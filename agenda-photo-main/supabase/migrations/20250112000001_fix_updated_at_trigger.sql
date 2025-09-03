-- Correção do trigger que usa 'updated_at' em vez de 'atualizado_em'
-- Esta migração corrige a função update_relatorios_updated_at para usar o campo correto

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

-- Verificar se existe algum trigger aplicado incorretamente à tabela agenda_eventos
-- e removê-lo se necessário
DO $$
BEGIN
    -- Verificar se existe trigger na tabela agenda_eventos que usa update_relatorios_updated_at
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'agenda_eventos' 
        AND action_statement LIKE '%update_relatorios_updated_at%'
    ) THEN
        -- Remover o trigger incorreto
        DROP TRIGGER IF EXISTS update_agenda_eventos_updated_at ON public.agenda_eventos;
        RAISE NOTICE 'Trigger incorreto removido da tabela agenda_eventos';
    END IF;
END $$;

-- Garantir que a tabela agenda_eventos use o trigger correto para atualizado_em
DROP TRIGGER IF EXISTS update_agenda_eventos_atualizado_em ON public.agenda_eventos;

CREATE TRIGGER update_agenda_eventos_atualizado_em
    BEFORE UPDATE ON public.agenda_eventos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();