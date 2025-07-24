-- Script final para corrigir o trigger da tabela agenda_eventos
-- Este script deve ser executado no Supabase Dashboard > SQL Editor

-- 1. Remover TODOS os triggers existentes na tabela agenda_eventos
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Listar e remover todos os triggers da tabela agenda_eventos
    FOR trigger_record IN (
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE event_object_table = 'agenda_eventos'
        AND event_object_schema = 'public'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.agenda_eventos';
        RAISE NOTICE 'Trigger % removido da tabela agenda_eventos', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 2. Garantir que a função handle_updated_at está correta
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

-- 3. Criar o trigger correto para agenda_eventos
CREATE TRIGGER update_agenda_eventos_atualizado_em
    BEFORE UPDATE ON public.agenda_eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Verificar se o campo atualizado_em existe na tabela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agenda_eventos' 
        AND table_schema = 'public'
        AND column_name = 'atualizado_em'
    ) THEN
        RAISE EXCEPTION 'ERRO: Campo atualizado_em não existe na tabela agenda_eventos';
    END IF;
    
    RAISE NOTICE 'Campo atualizado_em confirmado na tabela agenda_eventos';
END $$;

-- 5. Testar o trigger com uma atualização simples
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Buscar um evento existente para teste
    SELECT id INTO test_id FROM agenda_eventos LIMIT 1;
    
    IF test_id IS NOT NULL THEN
        -- Fazer uma atualização que não altera dados importantes
        UPDATE agenda_eventos 
        SET titulo = titulo 
        WHERE id = test_id;
        
        RAISE NOTICE 'Teste do trigger executado com sucesso para evento %', test_id;
    ELSE
        RAISE NOTICE 'Nenhum evento encontrado para teste do trigger';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'ERRO no teste do trigger: %', SQLERRM;
END $$;

-- 6. Verificar triggers ativos na tabela agenda_eventos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'agenda_eventos'
AND event_object_schema = 'public'
ORDER BY trigger_name;