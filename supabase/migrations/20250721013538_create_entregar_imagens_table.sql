-- Criação da tabela entregar_imagens para o sistema de entrega de fotos
-- Data: 2025-01-21
-- Descrição: Tabela para armazenar imagens individuais das galerias de entrega

-- =====================================================
-- 1. CRIAÇÃO DA TABELA ENTREGAR_IMAGENS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.entregar_imagens (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informações da galeria (estrutura unificada)
    titulo TEXT NOT NULL,
    descricao TEXT,
    slug TEXT NOT NULL,
    data_evento DATE,
    data_expiracao TIMESTAMPTZ,
    senha_acesso TEXT,
    permitir_download BOOLEAN DEFAULT true,
    permitir_compartilhamento BOOLEAN DEFAULT true,
    marca_dagua BOOLEAN DEFAULT false,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'expirada', 'arquivada', 'inativa')),
    total_fotos INTEGER DEFAULT 0,
    total_acessos INTEGER DEFAULT 0,
    ultimo_acesso TIMESTAMPTZ,
    
    -- Informações da imagem
    nome_arquivo TEXT NOT NULL,
    nome_original TEXT,
    descricao TEXT,
    
    -- URLs e armazenamento
    url_imagem TEXT NOT NULL,
    url_thumbnail TEXT,
    url_preview TEXT,
    
    -- Metadados técnicos
    tamanho_arquivo BIGINT, -- em bytes
    tipo_mime TEXT,
    largura INTEGER,
    altura INTEGER,
    
    -- Organização
    ordem INTEGER DEFAULT 0,
    destaque BOOLEAN DEFAULT false,
    
    -- Estatísticas
    total_downloads INTEGER DEFAULT 0,
    total_visualizacoes INTEGER DEFAULT 0,
    
    -- Controle de usuário
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timestamps
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT entregar_imagens_ordem_positiva CHECK (ordem >= 0),
    CONSTRAINT entregar_imagens_tamanho_positivo CHECK (tamanho_arquivo > 0),
    CONSTRAINT entregar_imagens_dimensoes_positivas CHECK (largura > 0 AND altura > 0)
);

-- =====================================================
-- 2. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice por slug (consulta mais comum)
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_slug 
ON public.entregar_imagens(slug);

-- Índice por usuário
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_user_id 
ON public.entregar_imagens(user_id);

-- Índice por status
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_status 
ON public.entregar_imagens(status);

-- Índice por data do evento
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_data_evento 
ON public.entregar_imagens(data_evento);

-- Índice por data de expiração
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_data_expiracao 
ON public.entregar_imagens(data_expiracao);

-- Índice para ordem por slug
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_ordem 
ON public.entregar_imagens(slug, ordem);

-- Índice para imagens em destaque
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_destaque 
ON public.entregar_imagens(slug, destaque) 
WHERE destaque = true;

-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_nome_arquivo 
ON public.entregar_imagens USING gin(to_tsvector('portuguese', nome_arquivo));

-- =====================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.entregar_imagens ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CRIAÇÃO DE POLÍTICAS RLS
-- =====================================================

-- Política para SELECT: Usuários podem ver suas próprias imagens
CREATE POLICY "entregar_imagens_select_policy"
ON public.entregar_imagens
FOR SELECT
USING (user_id = auth.uid());

-- Política para INSERT: Usuários podem inserir suas próprias imagens
CREATE POLICY "entregar_imagens_insert_policy"
ON public.entregar_imagens
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Política para UPDATE: Usuários podem atualizar suas próprias imagens
CREATE POLICY "entregar_imagens_update_policy"
ON public.entregar_imagens
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para DELETE: Usuários podem deletar suas próprias imagens
CREATE POLICY "entregar_imagens_delete_policy"
ON public.entregar_imagens
FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- 5. CRIAÇÃO DE TRIGGERS
-- =====================================================

-- Trigger para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION update_entregar_imagens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entregar_imagens_updated_at
    BEFORE UPDATE ON public.entregar_imagens
    FOR EACH ROW
    EXECUTE FUNCTION update_entregar_imagens_updated_at();

-- =====================================================
-- 6. CRIAÇÃO DE FUNÇÕES AUXILIARES
-- =====================================================

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION public.incrementar_downloads_imagem(imagem_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.entregar_imagens 
    SET total_downloads = total_downloads + 1,
        ultimo_download = NOW()
    WHERE id = imagem_id;
END;
$$;

-- Função para incrementar contador de visualizações
CREATE OR REPLACE FUNCTION public.incrementar_visualizacoes_imagem(imagem_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.entregar_imagens 
    SET total_visualizacoes = total_visualizacoes + 1,
        ultima_visualizacao = NOW()
    WHERE id = imagem_id;
END;
$$;

-- Função para reordenar imagens de uma galeria
CREATE OR REPLACE FUNCTION public.reordenar_imagens_galeria(galeria_slug TEXT, nova_ordem INTEGER[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    imagem_id UUID;
    i INTEGER := 1;
BEGIN
    -- Verificar se o usuário tem permissão para editar esta galeria
    IF NOT EXISTS (
        SELECT 1 FROM public.entregar_imagens 
        WHERE slug = galeria_slug 
        AND user_id = auth.uid()
        LIMIT 1
    ) THEN
        RAISE EXCEPTION 'Acesso negado: você não tem permissão para editar esta galeria';
    END IF;
    
    -- Atualizar a ordem das imagens
    FOREACH imagem_id IN ARRAY nova_ordem
    LOOP
        UPDATE public.entregar_imagens 
        SET ordem = i,
            atualizado_em = NOW()
        WHERE id = imagem_id 
        AND slug = galeria_slug
        AND user_id = auth.uid();
        
        i := i + 1;
    END LOOP;
END;
$$;

-- =====================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.entregar_imagens IS 'Tabela para armazenar imagens individuais das galerias de entrega de fotos';
COMMENT ON COLUMN public.entregar_imagens.id IS 'Identificador único da imagem (UUID)';
COMMENT ON COLUMN public.entregar_imagens.galeria_id IS 'Referência à galeria de entrega (entregar_fotos)';
COMMENT ON COLUMN public.entregar_imagens.nome_arquivo IS 'Nome do arquivo da imagem';
COMMENT ON COLUMN public.entregar_imagens.nome_original IS 'Nome original do arquivo antes do upload';
COMMENT ON COLUMN public.entregar_imagens.url_imagem IS 'URL da imagem em resolução completa';
COMMENT ON COLUMN public.entregar_imagens.url_thumbnail IS 'URL da miniatura da imagem';
COMMENT ON COLUMN public.entregar_imagens.url_preview IS 'URL da imagem em resolução média para preview';
COMMENT ON COLUMN public.entregar_imagens.tamanho_arquivo IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN public.entregar_imagens.ordem IS 'Ordem de exibição da imagem na galeria';
COMMENT ON COLUMN public.entregar_imagens.destaque IS 'Indica se a imagem é destaque da galeria';
COMMENT ON COLUMN public.entregar_imagens.total_downloads IS 'Contador de downloads da imagem';
COMMENT ON COLUMN public.entregar_imagens.total_visualizacoes IS 'Contador de visualizações da imagem';

-- =====================================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Esta tabela utiliza uma estrutura unificada onde as informações da galeria
-- e das imagens são armazenadas na mesma tabela, simplificando as consultas
-- e melhorando a performance do sistema.

COMMENT ON TABLE public.entregar_imagens IS 'Tabela unificada para galerias e imagens de entrega de fotos';
COMMENT ON COLUMN public.entregar_imagens.titulo IS 'Título da galeria';
COMMENT ON COLUMN public.entregar_imagens.slug IS 'Slug único para URL da galeria';
COMMENT ON COLUMN public.entregar_imagens.nome_arquivo IS 'Nome do arquivo da imagem no storage';
COMMENT ON COLUMN public.entregar_imagens.ordem IS 'Ordem da imagem na galeria';
COMMENT ON COLUMN public.entregar_imagens.destaque IS 'Se esta imagem é a capa da galeria';

-- Log da migração
INSERT INTO public.sistema_atividades (table_name, operation, record_id, user_id, new_data)
VALUES (
    'entregar_imagens', 
    'CREATE_TABLE', 
    gen_random_uuid(), 
    NULL,
    '{"migration": "20250721013538_create_entregar_imagens_table", "description": "Criação da tabela entregar_imagens para sistema de entrega de fotos"}'::jsonb
) ON CONFLICT DO NOTHING;