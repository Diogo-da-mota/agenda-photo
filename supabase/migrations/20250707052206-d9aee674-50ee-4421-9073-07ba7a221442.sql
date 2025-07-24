-- Correções de Segurança: Search Path em Funções Críticas
-- Fase 1: Funções mais críticas (execute_sql, financeiras, contratos)

-- 1. FUNÇÃO CRÍTICA: execute_sql - Adicionar search_path seguro
CREATE OR REPLACE FUNCTION public.execute_sql(statement text)
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    result json[];
BEGIN
    -- AVISO: Esta função permite execução dinâmica de SQL
    -- Use com extrema cautela em produção
    EXECUTE statement;
    
    -- Retorna array vazio como confirmação
    RETURN ARRAY[]::json[];
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao executar SQL: %', SQLERRM;
END;
$function$;

-- 2. Função de contratos crítica
CREATE OR REPLACE FUNCTION public.check_expired_contracts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Atualiza status dos contratos expirados
  UPDATE contratos
  SET 
    status = 'expirado',
    historico = COALESCE(historico, '[]'::jsonb) || jsonb_build_object(
      'data', CURRENT_TIMESTAMP,
      'acao', 'expiração automática',
      'detalhes', 'Contrato expirado automaticamente pelo sistema'
    )
  WHERE 
    status = 'pendente' 
    AND data_expiracao < CURRENT_TIMESTAMP;
END;
$function$;

-- 3. Função financeira crítica
CREATE OR REPLACE FUNCTION public.sincronizar_evento_atomico(p_evento_id uuid, p_user_id uuid, p_valor_entrada numeric, p_valor_restante numeric, p_descricao text)
RETURNS TABLE(success boolean, message text, transactions_created integer)
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    v_sync_id uuid;
    v_count int := 0;
BEGIN
    -- Gerar ID único para esta sincronização
    v_sync_id := gen_random_uuid();
    
    -- Iniciar transação
    BEGIN
        -- Inserir valor de entrada se não existir
        IF NOT EXISTS (
            SELECT 1 FROM financeiro_transacoes
            WHERE evento_id = p_evento_id
            AND user_id = p_user_id
            AND tipo = 'receita'
            AND valor = p_valor_entrada
        ) AND p_valor_entrada > 0 THEN
            INSERT INTO financeiro_transacoes (
                id, evento_id, user_id, tipo, valor, 
                descricao, sync_id, created_at
            )
            VALUES (
                gen_random_uuid(), p_evento_id, p_user_id, 
                'receita', p_valor_entrada, 
                p_descricao || ' (Entrada)', v_sync_id, now()
            );
            v_count := v_count + 1;
        END IF;

        -- Inserir valor restante se não existir
        IF NOT EXISTS (
            SELECT 1 FROM financeiro_transacoes
            WHERE evento_id = p_evento_id
            AND user_id = p_user_id
            AND tipo = 'receita'
            AND valor = p_valor_restante
        ) AND p_valor_restante > 0 THEN
            INSERT INTO financeiro_transacoes (
                id, evento_id, user_id, tipo, valor, 
                descricao, sync_id, created_at
            )
            VALUES (
                gen_random_uuid(), p_evento_id, p_user_id, 
                'receita', p_valor_restante, 
                p_descricao || ' (Restante)', v_sync_id, now()
            );
            v_count := v_count + 1;
        END IF;

        -- Retornar resultado
        RETURN QUERY SELECT 
            true as success,
            'Sincronização concluída com sucesso' as message,
            v_count as transactions_created;
            
    EXCEPTION WHEN OTHERS THEN
        -- Em caso de erro, fazer rollback e retornar erro
        RETURN QUERY SELECT 
            false as success,
            'Erro na sincronização: ' || SQLERRM as message,
            0 as transactions_created;
    END;
END;
$function$;

-- 4. Funções de cálculo financeiro
CREATE OR REPLACE FUNCTION public.calcular_faturamento_dinamico(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    total NUMERIC;
BEGIN
    -- Calcula o faturamento somando valores de entrada e a receber até a data atual
    -- Considerando apenas o ano atual
    SELECT COALESCE(SUM(
        CASE 
            WHEN tipo = 'Entrada' THEN valor_entrada
            WHEN tipo = 'A Receber' THEN valor_restante
            ELSE 0
        END
    ), 0) INTO total
    FROM agenda_eventos
    WHERE 
        user_id = p_user_id
        AND data_inicio <= CURRENT_DATE
        AND data_inicio >= DATE_TRUNC('year', CURRENT_DATE)
        AND (tipo = 'Entrada' OR tipo = 'A Receber');
    
    RETURN total;
END;
$function$;

-- 5. Função de busca avançada
CREATE OR REPLACE FUNCTION public.busca_avancada(termo text)
RETURNS TABLE(tipo text, id uuid, titulo text, descricao text, data_ref timestamp with time zone, relevancia double precision)
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    -- Busca em clientes
    RETURN QUERY
    SELECT 
        'cliente' AS tipo,
        id,
        nome AS titulo,
        email AS descricao,
        criado_em AS data_ref,
        similarity(nome, termo) AS relevancia
    FROM 
        clientes
    WHERE 
        nome % termo OR 
        email % termo
    
    UNION ALL
    
    -- Busca em agenda_eventos
    SELECT 
        'evento' AS tipo,
        id,
        titulo,
        descricao,
        data_inicio AS data_ref,
        similarity(titulo, termo) AS relevancia
    FROM 
        agenda_eventos
    WHERE 
        titulo % termo OR 
        descricao % termo
    
    UNION ALL
    
    -- Busca em financeiro_transacoes
    SELECT 
        'transacao' AS tipo,
        id,
        descricao AS titulo,
        observacoes AS descricao,
        data_transacao AS data_ref,
        similarity(descricao, termo) AS relevancia
    FROM 
        financeiro_transacoes
    WHERE 
        descricao % termo OR
        observacoes % termo
    
    ORDER BY relevancia DESC, data_ref DESC
    LIMIT 50;
END;
$function$;

-- 6. Criar schema para extensões e mover extensões do public
CREATE SCHEMA IF NOT EXISTS extensions;

-- Comentário: As extensões pg_trgm e unaccent precisam ser movidas manualmente
-- via dashboard do Supabase, pois requerem privilégios de superusuário