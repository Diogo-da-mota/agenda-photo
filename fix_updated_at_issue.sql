-- Script para corrigir o problema do campo 'updated_at' vs 'atualizado_em'
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Corrigir a função update_relatorios_updated_at para usar 'atualizado_em'
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

-- 2. Verificar e remover qualquer trigger incorreto na tabela agenda_eventos
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Listar todos os triggers na tabela agenda_eventos
    FOR trigger_record IN 
        SELECT trigger_name, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'agenda_eventos'
    LOOP
        RAISE NOTICE 'Trigger encontrado: % - %', trigger_record.trigger_name, trigger_record.action_statement;
        
        -- Se o trigger usa update_relatorios_updated_at, removê-lo
        IF trigger_record.action_statement LIKE '%update_relatorios_updated_at%' THEN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.agenda_eventos';
            RAISE NOTICE 'Trigger % removido da tabela agenda_eventos', trigger_record.trigger_name;
        END IF;
    END LOOP;
END $$;

-- 3. Garantir que existe o trigger correto para agenda_eventos
DROP TRIGGER IF EXISTS update_agenda_eventos_atualizado_em ON public.agenda_eventos;

CREATE TRIGGER update_agenda_eventos_atualizado_em
    BEFORE UPDATE ON public.agenda_eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Verificar a estrutura da tabela agenda_eventos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'agenda_eventos' 
AND column_name IN ('updated_at', 'atualizado_em')
ORDER BY column_name;

-- 5. Listar todos os triggers ativos na tabela agenda_eventos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'agenda_eventos'
ORDER BY trigger_name;