-- Correções de Segurança: Search Path em Funções Restantes
-- Fase 2: Triggers e funções utilitárias

-- 1. Funções de trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_relatorio_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_relatorios_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_media_imagens_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$function$;

-- 2. Funções de histórico e auditoria
CREATE OR REPLACE FUNCTION public.registrar_historico_transacao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO financeiro_transacoes_historico(transacao_id, operacao, dados, alterado_por)
        VALUES (NEW.id, 'INSERT', row_to_json(NEW), NEW.user_id);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO financeiro_transacoes_historico(transacao_id, operacao, dados, alterado_por)
        VALUES (NEW.id, 'UPDATE', row_to_json(NEW), NEW.user_id);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO financeiro_transacoes_historico(transacao_id, operacao, dados, alterado_por)
        VALUES (OLD.id, 'DELETE', row_to_json(OLD), OLD.user_id);
    END IF;
    RETURN NULL;
END;
$function$;

-- 3. Funções de limpeza e migração
CREATE OR REPLACE FUNCTION public.find_duplicate_transactions()
RETURNS TABLE(evento_id uuid, tipo character varying, valor numeric, user_id uuid, count bigint, transaction_ids uuid[])
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        ft.evento_id,
        ft.tipo,
        ft.valor,
        ft.user_id,
        COUNT(*) as count,
        ARRAY_AGG(ft.id ORDER BY ft.created_at) as transaction_ids
    FROM financeiro_transacoes ft
    GROUP BY ft.evento_id, ft.tipo, ft.valor, ft.user_id
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_duplicate_transactions()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    v_deleted_count bigint := 0;
    v_duplicates RECORD;
BEGIN
    FOR v_duplicates IN (
        SELECT 
            evento_id,
            tipo,
            valor,
            user_id,
            transaction_ids[1] as keep_id,
            transaction_ids[2:array_length(transaction_ids, 1)] as delete_ids
        FROM find_duplicate_transactions()
    ) LOOP
        -- Deletar todas as duplicatas exceto a mais antiga
        DELETE FROM financeiro_transacoes
        WHERE id = ANY(v_duplicates.delete_ids);
        
        GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
        
        -- Retornar quantidade de registros deletados
        RETURN QUERY SELECT v_deleted_count;
    END LOOP;
    
    -- Se não houver duplicatas, retornar 0
    IF v_deleted_count = 0 THEN
        RETURN QUERY SELECT 0::bigint;
    END IF;
END;
$function$;

-- 4. Funções de migração de dados
CREATE OR REPLACE FUNCTION public.migrar_categorias_despesas()
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    despesa_rec RECORD;
    categoria_id_var UUID;
    contador INTEGER := 0;
BEGIN
    -- Iterar sobre despesas que têm categoria em texto mas não têm categoria_id
    FOR despesa_rec IN 
        SELECT id, categoria, user_id 
        FROM financeiro_despesas 
        WHERE categoria IS NOT NULL 
        AND categoria_id IS NULL
    LOOP
        -- Buscar ou criar categoria
        SELECT id INTO categoria_id_var
        FROM financeiro_categorias 
        WHERE user_id = despesa_rec.user_id 
        AND nome = despesa_rec.categoria 
        AND tipo = 'despesa';
        
        -- Se não encontrou, criar categoria
        IF categoria_id_var IS NULL THEN
            INSERT INTO financeiro_categorias (id, nome, tipo, user_id)
            VALUES (gen_random_uuid(), despesa_rec.categoria, 'despesa', despesa_rec.user_id)
            RETURNING id INTO categoria_id_var;
        END IF;
        
        -- Atualizar despesa com categoria_id
        UPDATE financeiro_despesas 
        SET categoria_id = categoria_id_var
        WHERE id = despesa_rec.id;
        
        contador := contador + 1;
    END LOOP;
    
    RETURN contador;
END;
$function$;

CREATE OR REPLACE FUNCTION public.migrar_formas_pagamento_despesas()
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    despesa_rec RECORD;
    forma_id_var UUID;
    contador INTEGER := 0;
BEGIN
    -- Iterar sobre despesas que têm forma_pagamento em texto mas não têm forma_pagamento_id
    FOR despesa_rec IN 
        SELECT id, forma_pagamento, user_id 
        FROM financeiro_despesas 
        WHERE forma_pagamento IS NOT NULL 
        AND forma_pagamento_id IS NULL
    LOOP
        -- Buscar ou criar forma de pagamento
        SELECT id INTO forma_id_var
        FROM financeiro_formas_pagamento 
        WHERE user_id = despesa_rec.user_id 
        AND nome = despesa_rec.forma_pagamento;
        
        -- Se não encontrou, criar forma de pagamento
        IF forma_id_var IS NULL THEN
            INSERT INTO financeiro_formas_pagamento (id, nome, user_id)
            VALUES (gen_random_uuid(), despesa_rec.forma_pagamento, despesa_rec.user_id)
            RETURNING id INTO forma_id_var;
        END IF;
        
        -- Atualizar despesa com forma_pagamento_id
        UPDATE financeiro_despesas 
        SET forma_pagamento_id = forma_id_var
        WHERE id = despesa_rec.id;
        
        contador := contador + 1;
    END LOOP;
    
    RETURN contador;
END;
$function$;