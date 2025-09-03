-- 1. Verificar e criar a tabela usuarios se não existir
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'usuario' CHECK (papel IN ('admin', 'usuario')),
    nome TEXT,
    telefone TEXT,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança (primeiro remove as existentes se houver)
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON public.usuarios;

-- Agora cria as políticas
CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON public.usuarios
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem deletar seus próprios dados" 
ON public.usuarios
FOR DELETE
USING (auth.uid() = id);

-- 4. Corrigir search_path das funções
DO $$
BEGIN
    -- Log Table Access
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_table_access') THEN
        ALTER FUNCTION public.log_table_access SET search_path = 'public';
    END IF;

    -- Log Table Read
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_table_read') THEN
        ALTER FUNCTION public.log_table_read SET search_path = 'public';
    END IF;

    -- Handle New User
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user SET search_path = 'public';
    END IF;

    -- PG Table Exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'pg_table_exists') THEN
        ALTER FUNCTION public.pg_table_exists SET search_path = 'public';
    END IF;

    -- Execute SQL
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'execute_sql') THEN
        ALTER FUNCTION public.execute_sql SET search_path = 'public';
    END IF;

    -- Handle Updated At
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        ALTER FUNCTION public.handle_updated_at SET search_path = 'public';
    END IF;
END$$;

-- 5. Criar tabela de registros de autenticação se não existir
CREATE TABLE IF NOT EXISTS public.registros_autenticacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_evento TEXT NOT NULL,
    id_usuario UUID REFERENCES auth.users(id),
    metadados JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT now()
);

-- 6. Criar função para registrar eventos de autenticação
CREATE OR REPLACE FUNCTION public.registrar_evento_autenticacao(
    tipo_evento TEXT,
    id_usuario UUID,
    metadados JSONB DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
    INSERT INTO public.registros_autenticacao (
        tipo_evento,
        id_usuario,
        metadados,
        criado_em
    ) VALUES (
        tipo_evento,
        id_usuario,
        metadados,
        now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 