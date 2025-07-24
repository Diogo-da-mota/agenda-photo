-- Criar função RPC segura para verificar existência de email sem expor dados sensíveis
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador
SET search_path = public
AS $$
DECLARE
  email_count INTEGER;
BEGIN
  -- Verificar se o email existe na tabela auth.users
  -- Este é o método recomendado e seguro para verificar existência
  SELECT COUNT(*) INTO email_count 
  FROM auth.users 
  WHERE email = email_to_check;
  
  RETURN email_count > 0;
END;
$$;

-- Conceder permissão para anon e authenticated usarem a função
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated; 