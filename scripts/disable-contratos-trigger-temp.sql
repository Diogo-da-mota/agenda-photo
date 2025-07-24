-- SOLUÇÃO TEMPORÁRIA PARA ERRO DE TRIGGER DOS CONTRATOS
-- Execute este SQL no Dashboard do Supabase para desabilitar temporariamente o trigger problemático
-- Isso permitirá que você exclua e crie contratos normalmente

-- 1. Desabilitar trigger problemático temporariamente
DROP TRIGGER IF EXISTS audit_contratos ON public.contratos;

-- 2. Verificar se o trigger foi removido
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'contratos' 
AND trigger_name = 'audit_contratos';

-- Se a consulta acima retornar 0 linhas, o trigger foi removido com sucesso

-- INSTRUÇÕES:
-- 1. Acesse https://supabase.com/dashboard/project/adxwgpfkvizpqdvortpu/sql
-- 2. Cole e execute este script
-- 3. Teste a exclusão e criação de contratos
-- 4. O trigger de auditoria ficará desabilitado temporariamente

-- NOTA: Esta é uma solução temporária. O trigger pode ser reativado posteriormente
-- com a versão corrigida quando necessário.