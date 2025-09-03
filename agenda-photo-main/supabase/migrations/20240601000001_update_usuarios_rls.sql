-- Remover política existente que pode estar causando problemas
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios dados" ON public.usuarios;

-- Criar nova política mais permissiva para inserção
CREATE POLICY "Usuários autenticados podem inserir usuários" 
ON public.usuarios
FOR INSERT 
WITH CHECK (true);  -- Permite inserção para qualquer usuário autenticado

-- Criar políticas restritas para outras operações
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem deletar seus próprios dados" 
ON public.usuarios
FOR DELETE
USING (auth.uid() = id); 