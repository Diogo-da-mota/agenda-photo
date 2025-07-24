-- Correção de segurança para políticas RLS permissivas
-- Remover a política permissiva que permite inserção sem verificação
DROP POLICY IF EXISTS "Usuários autenticados podem inserir usuários" ON public.usuarios;

-- Recriar a política correta que permite apenas inserir próprios dados
CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON public.usuarios
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Consolidar as políticas SELECT, verificando se existem antes de recriar
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

-- Consolidar as políticas UPDATE
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Consolidar as políticas DELETE
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios dados" ON public.usuarios;
CREATE POLICY "Usuários podem deletar seus próprios dados" 
ON public.usuarios
FOR DELETE
USING (auth.uid() = id);

-- Garante que RLS está ativado para a tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY; 