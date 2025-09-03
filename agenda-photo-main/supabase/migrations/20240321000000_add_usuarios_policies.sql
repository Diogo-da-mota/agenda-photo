-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Policy for inserting own user data
CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON public.usuarios
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy for selecting own user data
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

-- Policy for updating own user data
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for deleting own user data
CREATE POLICY "Usuários podem deletar seus próprios dados" 
ON public.usuarios
FOR DELETE
USING (auth.uid() = id); 