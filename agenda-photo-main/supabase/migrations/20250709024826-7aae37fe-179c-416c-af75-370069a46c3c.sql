-- Correções críticas de segurança RLS (versão corrigida)
-- 1. Limpar políticas existentes da tabela usuarios
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;

-- Criar políticas mais seguras e funcionais para usuarios
CREATE POLICY "usuarios_select_own" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 2. Adicionar função de validação de entrada segura
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
  
  -- Verificar caracteres perigosos
  IF input_text ~ '[<>"\'';&]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;