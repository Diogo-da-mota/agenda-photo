-- CORREÇÃO MANUAL PARA O ERRO DE TRIGGER DOS CONTRATOS
-- Execute este SQL no Dashboard do Supabase para corrigir o erro:
-- "CASE/WHEN could not convert type jsonb to json"

-- 1. Remover trigger problemático
DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;

-- 2. Recriar função de auditoria com correção
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Auditar mudanças em dados financeiros
  IF TG_TABLE_NAME IN ('financeiro_transacoes', 'financeiro_despesas', 'contratos') THEN
    PERFORM public.log_security_event_enhanced('SENSITIVE_DATA_MODIFIED', 
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'changes', CASE 
          WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
          WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
          ELSE to_jsonb(NEW)
        END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar trigger com função corrigida
CREATE TRIGGER audit_contratos 
  AFTER INSERT OR UPDATE OR DELETE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

-- 4. Verificar se a correção foi aplicada
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'contratos' 
AND trigger_name = 'audit_contratos';

-- INSTRUÇÕES:
-- 1. Acesse o Dashboard do Supabase
-- 2. Vá para SQL Editor
-- 3. Cole e execute este script
-- 4. Teste a exclusão de contratos novamente