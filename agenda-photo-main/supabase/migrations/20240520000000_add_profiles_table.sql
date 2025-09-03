
-- Criação da tabela perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT, 
  avatar_url TEXT,
  profession TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criação das políticas RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de perfis próprios
CREATE POLICY "Usuários podem ver seus próprios perfis" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para permitir atualização de perfis próprios
CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para permitir inserção de perfis próprios
CREATE POLICY "Usuários podem inserir seus próprios perfis" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
