-- Verificar se a tabela usuarios existe e criar se não existir
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Garantir que a tabela tenha as permissões RLS ativas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Atualizar os tipos para incluir a tabela usuarios na declaração de tipos
COMMENT ON TABLE public.usuarios IS 'Tabela de perfis de usuários vinculada às contas de autenticação';

-- Adicionar a tabela aos types do Supabase
COMMENT ON COLUMN public.usuarios.id IS 'ID do usuário, referência à tabela auth.users';
COMMENT ON COLUMN public.usuarios.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN public.usuarios.email IS 'Email do usuário (deve corresponder ao email da auth)';
COMMENT ON COLUMN public.usuarios.avatar_url IS 'URL da imagem de avatar do usuário';
COMMENT ON COLUMN public.usuarios.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.usuarios.updated_at IS 'Data da última atualização'; 