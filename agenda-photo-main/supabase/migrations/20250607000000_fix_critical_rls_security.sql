
-- CORREÇÃO CRÍTICA DE SEGURANÇA: Política RLS permissiva
-- Remove a política perigosa que permite inserção sem verificação
DROP POLICY IF EXISTS "Usuários autenticados podem inserir usuários" ON public.usuarios;

-- Recriar a política correta que só permite inserir dados próprios
CREATE POLICY "Usuários podem inserir apenas seus próprios dados" 
ON public.usuarios
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Adicionar políticas RLS para tabelas sem proteção
-- Tabela fotos_drive
ALTER TABLE public.fotos_drive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias fotos" ON public.fotos_drive;
CREATE POLICY "Usuários podem ver suas próprias fotos" 
ON public.fotos_drive FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias fotos" ON public.fotos_drive;
CREATE POLICY "Usuários podem inserir suas próprias fotos" 
ON public.fotos_drive FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON public.fotos_drive;
CREATE POLICY "Usuários podem atualizar suas próprias fotos" 
ON public.fotos_drive FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON public.fotos_drive;
CREATE POLICY "Usuários podem deletar suas próprias fotos" 
ON public.fotos_drive FOR DELETE USING (auth.uid() = user_id);

-- Verificar e corrigir outras tabelas importantes
-- Configurações de integração
ALTER TABLE public.configuracoes_integracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem gerenciar suas configurações" ON public.configuracoes_integracoes;
CREATE POLICY "Usuários podem gerenciar suas configurações" 
ON public.configuracoes_integracoes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- App settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem gerenciar suas configurações de app" ON public.app_settings;
CREATE POLICY "Usuários podem gerenciar suas configurações de app" 
ON public.app_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
