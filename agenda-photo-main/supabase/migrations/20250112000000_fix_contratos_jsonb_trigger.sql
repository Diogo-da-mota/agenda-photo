-- Correção do trigger de auditoria para tabela contratos
-- Data: 2025-01-12
-- Problema: Erro 'CASE/WHEN could not convert type jsonb to json' ao deletar contratos
-- Causa: Trigger audit_contratos usando row_to_json() com campos JSON/JSONB
-- Solução: Usar to_jsonb() em vez de row_to_json() para compatibilidade

-- Remover trigger problemático
DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;

-- Recriar função de auditoria com correção
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

-- Recriar trigger com função corrigida
CREATE TRIGGER audit_contratos 
  AFTER INSERT OR UPDATE OR DELETE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

-- Log da correção
INSERT INTO public.sistema_atividades (table_name, operation, new_data)
VALUES (
  'contratos_trigger_fix',
  'MIGRATION',
  '{"description": "Correção do trigger audit_contratos para resolver erro JSONB/JSON", "timestamp": "2025-01-12"}'
);

-- Comentário explicativo
COMMENT ON TRIGGER audit_contratos ON public.contratos IS 'Trigger de auditoria corrigido para compatibilidade com campos JSON/JSONB';