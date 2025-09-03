-- Função para verificar se um usuário existe pelo email
CREATE OR REPLACE FUNCTION public.check_user_exists(email_to_check TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Verificar na tabela auth.users
    SELECT EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE email = email_to_check
    ) INTO user_exists;
    
    IF user_exists THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar na tabela public.usuarios
    SELECT EXISTS (
        SELECT 1 
        FROM public.usuarios 
        WHERE email = email_to_check
    ) INTO user_exists;
    
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar um trigger para atualizar o campo atualizado_em automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger a todas as tabelas que têm o campo atualizado_em
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'atualizado_em'
    ) THEN
        DROP TRIGGER IF EXISTS set_usuarios_atualizado_em ON public.usuarios;
        CREATE TRIGGER set_usuarios_atualizado_em
        BEFORE UPDATE ON public.usuarios
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END
$$; 