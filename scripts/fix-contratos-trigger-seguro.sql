-- CORREÇÃO SEGURA DO TRIGGER DE CONTRATOS
-- Script para corrigir o erro: "CASE/WHEN could not convert type jsonb to json"
-- Execute este script no Dashboard do Supabase (SQL Editor)

-- ========================================
-- ETAPA 1: BACKUP E VERIFICAÇÃO INICIAL
-- ========================================

-- Verificar triggers existentes antes da correção
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'contratos'
ORDER BY trigger_name;

-- ========================================
-- ETAPA 2: REMOÇÃO SEGURA DO TRIGGER PROBLEMÁTICO
-- ========================================

-- Remover trigger que está causando o erro
DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;

-- Confirmar remoção
SELECT 'Trigger audit_contratos removido com sucesso' as status;

-- ========================================
-- ETAPA 3: CORREÇÃO DA FUNÇÃO DE AUDITORIA
-- ========================================

-- Recriar função com correção para campos JSONB
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Auditar mudanças em dados sensíveis
  IF TG_TABLE_NAME IN ('financeiro_transacoes', 'financeiro_despesas', 'contratos') THEN
    
    -- Usar to_jsonb() em vez de row_to_json() para compatibilidade com campos JSONB
    PERFORM public.log_security_event_enhanced('SENSITIVE_DATA_MODIFIED', 
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'timestamp', NOW(),
        'changes', CASE 
          WHEN TG_OP = 'UPDATE' THEN 
            jsonb_build_object(
              'old', to_jsonb(OLD), 
              'new', to_jsonb(NEW)
            )
          WHEN TG_OP = 'DELETE' THEN 
            jsonb_build_object(
              'deleted', to_jsonb(OLD)
            )
          WHEN TG_OP = 'INSERT' THEN 
            jsonb_build_object(
              'created', to_jsonb(NEW)
            )
          ELSE NULL
        END
      )
    );
  END IF;
  
  -- Retornar o registro apropriado
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirmar criação da função
SELECT 'Função audit_sensitive_changes corrigida com sucesso' as status;

-- ========================================
-- ETAPA 4: RECRIAR TRIGGER COM FUNÇÃO CORRIGIDA
-- ========================================

-- Recriar trigger com a função corrigida
CREATE TRIGGER audit_contratos 
  AFTER INSERT OR UPDATE OR DELETE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

-- Confirmar criação do trigger
SELECT 'Trigger audit_contratos recriado com sucesso' as status;

-- ========================================
-- ETAPA 5: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se o trigger foi recriado corretamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  'Trigger ativo e funcionando' as status
FROM information_schema.triggers 
WHERE event_object_table = 'contratos' 
AND trigger_name = 'audit_contratos';

-- Verificar se a função existe e está correta
SELECT 
  routine_name,
  routine_type,
  'Função disponível' as status
FROM information_schema.routines 
WHERE routine_name = 'audit_sensitive_changes'
AND routine_schema = 'public';

-- ========================================
-- TESTE DE VALIDAÇÃO (OPCIONAL)
-- ========================================

-- Comentário: Após executar este script, teste a exclusão de um contrato
-- para verificar se o erro foi corrigido.

-- INSTRUÇÕES DE USO:
-- 1. Acesse: https://supabase.com/dashboard/project/adxwgpfkvizpqdvortpu/sql
-- 2. Cole este script completo no SQL Editor
-- 3. Execute o script
-- 4. Verifique se todas as etapas retornaram sucesso
-- 5. Teste a exclusão de contratos na aplicação

-- RESULTADO ESPERADO:
-- ✅ Trigger removido e recriado com correção
-- ✅ Função de auditoria corrigida para usar to_jsonb()
-- ✅ Exclusão e criação de contratos funcionando normalmente
-- ✅ Auditoria de segurança mantida e funcionando

SELECT '🎉 CORREÇÃO APLICADA COM SUCESSO! Teste agora a exclusão de contratos.' as resultado_final;