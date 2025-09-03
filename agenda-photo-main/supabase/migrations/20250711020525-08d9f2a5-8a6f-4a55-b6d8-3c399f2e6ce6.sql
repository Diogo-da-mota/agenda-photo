-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA - SISTEMA DE PAPÉIS

-- Criar enum para papéis da aplicação (sem IF NOT EXISTS para evitar erro de sintaxe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'usuario', 'moderador');
    END IF;
END $$;

-- Criar tabela de papéis de usuário (sistema seguro)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'usuario',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para verificar papéis (previne recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter papel atual do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'usuario'::app_role
  )
$$;

-- Políticas RLS para user_roles (apenas admins podem gerenciar papéis)
DROP POLICY IF EXISTS "Admins podem gerenciar todos os papéis" ON public.user_roles;
CREATE POLICY "Admins podem gerenciar todos os papéis" 
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Usuários podem ver seu próprio papel" ON public.user_roles;
CREATE POLICY "Usuários podem ver seu próprio papel" 
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);