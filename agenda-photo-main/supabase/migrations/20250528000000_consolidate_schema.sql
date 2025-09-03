-- Migração para consolidar schema - Eliminar tabelas duplicadas e organizar user_id
-- Data: 2025-05-28
-- Descrição: Consolidação de tabelas duplicadas e padronização de user_id

-- =====================================================
-- 1. CONSOLIDAÇÃO DE TABELAS DE PORTFÓLIO
-- =====================================================

-- Migrar dados de portfolio_trabalhos para portfolio (tabela mais completa)
-- Primeiro, adicionar colunas que existem em portfolio_trabalhos mas não em portfolio
ALTER TABLE public.portfolio 
ADD COLUMN IF NOT EXISTS local text,
ADD COLUMN IF NOT EXISTS url_imagem_drive text;

-- Migrar dados de portfolio_trabalhos para portfolio
INSERT INTO public.portfolio (
    id, user_id, titulo, descricao, categoria, tags, 
    criado_em, atualizado_em, imagens, local, url_imagem_drive,
    publicado, destaque
)
SELECT 
    id, user_id, titulo, descricao, categoria, tags,
    criado_em, atualizado_em, imagens, local, url_imagem_drive,
    true as publicado, false as destaque
FROM public.portfolio_trabalhos
WHERE NOT EXISTS (
    SELECT 1 FROM public.portfolio p WHERE p.id = portfolio_trabalhos.id
);

-- Remover tabela duplicada portfolio_trabalhos
DROP TABLE IF EXISTS public.portfolio_trabalhos;

-- =====================================================
-- 2. CONSOLIDAÇÃO DE TABELAS DE IMAGENS
-- =====================================================

-- A tabela 'imagens' é mais simples e adequada, vamos manter ela
-- Migrar dados de media_imagens para imagens (se houver)
INSERT INTO public.imagens (id, url, nome, criado_em, user_id)
SELECT 
    id, 
    url, 
    COALESCE(filename, 'Imagem sem nome') as nome,
    criado_em,
    COALESCE(user_id, (SELECT id FROM auth.users LIMIT 1)) as user_id
FROM public.media_imagens
WHERE NOT EXISTS (
    SELECT 1 FROM public.imagens i WHERE i.id = media_imagens.id
)
AND user_id IS NOT NULL;

-- Remover tabela duplicada media_imagens
DROP TABLE IF EXISTS public.media_imagens;

-- =====================================================
-- 3. TORNAR user_id NOT NULL EM TODAS AS TABELAS
-- =====================================================

-- Atualizar registros com user_id NULL para o primeiro usuário disponível
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Buscar o primeiro usuário disponível
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Atualizar tabelas com user_id NULL
        UPDATE public.clientes SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.configuracoes_integracoes SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.contratos SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.financeiro_pagamentos SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.mensagens SET user_id = first_user_id WHERE user_id IS NULL;
        UPDATE public.notificacoes SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Tornar user_id NOT NULL em todas as tabelas
ALTER TABLE public.clientes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.configuracoes_integracoes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.contratos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.financeiro_pagamentos ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.mensagens ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.notificacoes ALTER COLUMN user_id SET NOT NULL;

-- =====================================================
-- 4. HABILITAR RLS E CRIAR POLICIES
-- =====================================================

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_imagens ENABLE ROW LEVEL SECURITY; -- caso ainda exista

-- Criar policies para portfolio
DROP POLICY IF EXISTS "Users can access their own portfolio" ON public.portfolio;
CREATE POLICY "Users can access their own portfolio"
    ON public.portfolio
    FOR ALL
    USING (user_id = auth.uid());

-- Criar policies para imagens
DROP POLICY IF EXISTS "Users can access their own images" ON public.imagens;
CREATE POLICY "Users can access their own images"
    ON public.imagens
    FOR ALL
    USING (user_id = auth.uid());

-- Verificar e criar policies para outras tabelas se necessário
DROP POLICY IF EXISTS "Users can access their own clients" ON public.clientes;
CREATE POLICY "Users can access their own clients"
    ON public.clientes
    FOR ALL
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access their own integrations" ON public.configuracoes_integracoes;
CREATE POLICY "Users can access their own integrations"
    ON public.configuracoes_integracoes
    FOR ALL
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access their own contracts" ON public.contratos;
CREATE POLICY "Users can access their own contracts"
    ON public.contratos
    FOR ALL
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access their own payments" ON public.financeiro_pagamentos;
CREATE POLICY "Users can access their own payments"
    ON public.financeiro_pagamentos
    FOR ALL
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access their own messages" ON public.mensagens;
CREATE POLICY "Users can access their own messages"
    ON public.mensagens
    FOR ALL
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can access their own notifications" ON public.notificacoes;
CREATE POLICY "Users can access their own notifications"
    ON public.notificacoes
    FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- 5. LIMPEZA E OTIMIZAÇÃO
-- =====================================================

-- Remover tabela clientes_completo se existir (parece ser duplicada)
DROP TABLE IF EXISTS public.clientes_completo;

-- Comentários finais
COMMENT ON TABLE public.portfolio IS 'Tabela consolidada de portfólio - unificação de portfolio e portfolio_trabalhos';
COMMENT ON TABLE public.imagens IS 'Tabela consolidada de imagens - unificação de imagens e media_imagens';

-- Log da migração
INSERT INTO public.sistema_atividades (table_name, operation, record_id, user_id, new_data)
VALUES (
    'schema_consolidation', 
    'MIGRATION', 
    gen_random_uuid(), 
    NULL,
    '{"migration": "20250528000000_consolidate_schema", "description": "Consolidação de schema - eliminação de tabelas duplicadas e padronização de user_id"}'::jsonb
); 