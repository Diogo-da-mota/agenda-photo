-- Diagnóstico completo e correção do erro na tabela agenda_eventos
-- Execute este script no Supabase Dashboard > SQL Editor

-- PARTE 1: DIAGNÓSTICO COMPLETO
RAISE NOTICE '=== INICIANDO DIAGNÓSTICO COMPLETO DA TABELA AGENDA_EVENTOS ===';

-- 1. Verificar estrutura da tabela agenda_eventos
RAISE NOTICE '1. Verificando estrutura da tabela agenda_eventos:';
DO $$
DECLARE
    col_record RECORD;
BEGIN
    FOR col_record IN (
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'agenda_eventos' 
        AND table_schema = 'public'
        AND column_name IN ('updated_at', 'atualizado_em', 'criado_em', 'created_at')
        ORDER BY column_name
    ) LOOP
        RAISE NOTICE '   Campo: % | Tipo: % | Nullable: % | Default: %', 
            col_record.column_name, col_record.data_type, 
            col_record.is_nullable, col_record.column_default;
    END LOOP;
END $$;

-- 2. Listar todos os triggers ativos na tabela agenda_eventos
RAISE NOTICE '2. Triggers ativos na tabela agenda_eventos:';
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN (
        SELECT trigger_name, event_manipulation, action_timing, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'agenda_eventos'
        AND event_object_schema = 'public'
        ORDER BY trigger_name
    ) LOOP
        RAISE NOTICE '   Trigger: % | Evento: % | Timing: %', 
            trigger_record.trigger_name, trigger_record.event_manipulation, 
            trigger_record.action_timing;
        RAISE NOTICE '   Statement: %', trigger_record.action_statement;
    END LOOP;
END $$;

-- 3. Verificar todas as funções que podem estar sendo usadas
RAISE NOTICE '3. Funções relacionadas a updated_at/atualizado_em:';
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN (
        SELECT routine_name, routine_definition
        FROM information_schema.routines 
        WHERE routine_name IN (
            'handle_updated_at', 
            'update_updated_at_column',
            'update_relatorios_updated_at',
            'update_relatorio_updated_at'
        )
        AND routine_schema = 'public'
    ) LOOP
        RAISE NOTICE '   Função: %', func_record.routine_name;
        -- Verificar se a função usa updated_at ou atualizado_em
        IF func_record.routine_definition LIKE '%NEW.updated_at%' THEN
            RAISE NOTICE '   ⚠️  PROBLEMA: Função usa NEW.updated_at';
        ELSIF func_record.routine_definition LIKE '%NEW.atualizado_em%' THEN
            RAISE NOTICE '   ✅ OK: Função usa NEW.atualizado_em';
        END IF;
    END LOOP;
END $$;

-- PARTE 2: CORREÇÃO DEFINITIVA
RAISE NOTICE '=== INICIANDO CORREÇÃO DEFINITIVA ===';

-- 4. Remover TODOS os triggers da tabela agenda_eventos
RAISE NOTICE '4. Removendo todos os triggers da tabela agenda_eventos:';
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN (
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE event_object_table = 'agenda_eventos'
        AND event_object_schema = 'public'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.agenda_eventos';
        RAISE NOTICE '   ✅ Trigger % removido', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 5. Garantir que todas as funções estão corretas
RAISE NOTICE '5. Corrigindo/criando funções necessárias:';

-- Função handle_updated_at correta
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
RAISE NOTICE '   ✅ Função handle_updated_at criada/atualizada';

-- 6. Criar o trigger correto
RAISE NOTICE '6. Criando trigger correto:';
CREATE TRIGGER update_agenda_eventos_atualizado_em
    BEFORE UPDATE ON public.agenda_eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
RAISE NOTICE '   ✅ Trigger update_agenda_eventos_atualizado_em criado';

-- 7. Verificar se o campo atualizado_em existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agenda_eventos' 
        AND table_schema = 'public'
        AND column_name = 'atualizado_em'
    ) THEN
        RAISE EXCEPTION '❌ ERRO CRÍTICO: Campo atualizado_em não existe na tabela agenda_eventos';
    ELSE
        RAISE NOTICE '   ✅ Campo atualizado_em confirmado na tabela';
    END IF;
END $$;

-- 8. Teste final
RAISE NOTICE '8. Executando teste final:';
DO $$
DECLARE
    test_id UUID;
    old_updated TIMESTAMP WITH TIME ZONE;
    new_updated TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Buscar um evento para teste
    SELECT id, atualizado_em INTO test_id, old_updated 
    FROM agenda_eventos 
    LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- Aguardar 1 segundo para garantir diferença no timestamp
        PERFORM pg_sleep(1);
        
        -- Fazer uma atualização que não altera dados importantes
        UPDATE agenda_eventos 
        SET titulo = titulo 
        WHERE id = test_id
        RETURNING atualizado_em INTO new_updated;
        
        IF new_updated > old_updated THEN
            RAISE NOTICE '   ✅ Teste do trigger PASSOU - atualizado_em foi atualizado automaticamente';
            RAISE NOTICE '   Antes: % | Depois: %', old_updated, new_updated;
        ELSE
            RAISE EXCEPTION '❌ Teste do trigger FALHOU - atualizado_em não foi atualizado';
        END IF;
    ELSE
        RAISE NOTICE '   ⚠️  Nenhum evento encontrado para teste';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '❌ ERRO no teste: %', SQLERRM;
END $$;

-- PARTE 3: VERIFICAÇÃO FINAL
RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';

-- 9. Listar triggers finais
RAISE NOTICE '9. Triggers ativos após correção:';
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN (
        SELECT trigger_name, event_manipulation, action_timing
        FROM information_schema.triggers 
        WHERE event_object_table = 'agenda_eventos'
        AND event_object_schema = 'public'
        ORDER BY trigger_name
    ) LOOP
        RAISE NOTICE '   ✅ %: % %', 
            trigger_record.trigger_name, 
            trigger_record.action_timing, 
            trigger_record.event_manipulation;
    END LOOP;
END $$;

RAISE NOTICE '=== DIAGNÓSTICO E CORREÇÃO CONCLUÍDOS ===';
RAISE NOTICE 'Se não houve erros acima, o problema foi resolvido!';
RAISE NOTICE 'Agora teste a atualização de eventos na aplicação.';