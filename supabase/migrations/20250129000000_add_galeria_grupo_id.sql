-- Adiciona o campo galeria_grupo_id à tabela entregar_imagens
-- Data: 2025-01-29
-- Descrição: Campo necessário para agrupar imagens em galerias

-- =====================================================
-- 1. ADICIONAR CAMPO GALERIA_GRUPO_ID
-- =====================================================

ALTER TABLE public.entregar_imagens 
ADD COLUMN galeria_grupo_id UUID NOT NULL DEFAULT gen_random_uuid();

-- =====================================================
-- 2. CRIAR ÍNDICE PARA PERFORMANCE
-- =====================================================

-- Índice para galeria_grupo_id
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_galeria_grupo_id
ON public.entregar_imagens(galeria_grupo_id);

-- Índice composto para consultas por galeria
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_galeria_ordem
ON public.entregar_imagens(galeria_grupo_id, ordem, criado_em);

-- =====================================================
-- 3. COMENTÁRIOS
-- =====================================================

COMMENT ON COLUMN public.entregar_imagens.galeria_grupo_id IS 'ID único que agrupa imagens da mesma galeria';