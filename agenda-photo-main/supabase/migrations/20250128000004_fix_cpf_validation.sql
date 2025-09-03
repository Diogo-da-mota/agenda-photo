-- =====================================================
-- MIGRAÇÃO: CORREÇÃO DA VALIDAÇÃO DE CPF
-- Data: 2025-01-28
-- Objetivo: Permitir pontos e hífens na validação de entrada para CPFs formatados
-- Problema: A função validate_input_security estava rejeitando CPFs com formato 123.456.789-00
-- =====================================================

-- Corrigir função de validação de entrada para permitir CPFs formatados
CREATE OR REPLACE FUNCTION public.validate_input_security(input_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se há tentativas de SQL injection ou XSS
  IF input_text ~* '(script|javascript|onload|onerror|eval|expression|vbscript)' THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar padrões de SQL injection
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|/\*|\*/)' THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar caracteres perigosos (removendo ponto e hífen para permitir CPFs)
  -- Mantendo proteção contra: < > " ' ; &
  IF input_text ~ '[<>"'';;&]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION public.validate_input_security(TEXT) IS 'Função de validação de entrada que permite pontos e hífens para CPFs formatados, mantendo proteção contra XSS e SQL injection';

-- Log da correção
INSERT INTO public.sistema_atividades (table_name, operation, new_data)
VALUES (
  'validate_input_security_fix',
  'MIGRATION',
  '{"description": "Correção da função validate_input_security para permitir CPFs formatados", "timestamp": "2025-01-28", "changes": "Removidos pontos e hífens da regex de caracteres bloqueados"}'
);