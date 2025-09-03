-- Migração para adicionar coluna data_entrega à tabela entregar_imagens
-- Data: 2025-01-21
-- Descrição: Corrige a nomenclatura da coluna de data_evento para data_entrega

-- =====================================================
-- 1. ADICIONAR NOVA COLUNA data_entrega
-- =====================================================

-- Adicionar a coluna data_entrega
ALTER TABLE public.entregar_imagens 
ADD COLUMN IF NOT EXISTS data_entrega DATE;

-- =====================================================
-- 2. MIGRAR DADOS EXISTENTES (se houver)
-- =====================================================

-- Copiar dados de data_evento para data_entrega (se data_evento existir e data_entrega estiver vazia)
UPDATE public.entregar_imagens 
SET data_entrega = data_evento 
WHERE data_entrega IS NULL AND data_evento IS NOT NULL;

-- =====================================================
-- 3. CRIAR ÍNDICE PARA A NOVA COLUNA
-- =====================================================

-- Índice por data de entrega
CREATE INDEX IF NOT EXISTS idx_entregar_imagens_data_entrega 
ON public.entregar_imagens(data_entrega);

-- =====================================================
-- 4. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN public.entregar_imagens.data_entrega IS 'Data de entrega das fotos ao cliente';

-- =====================================================
-- 5. OPCIONAL: REMOVER COLUNA ANTIGA (descomente se necessário)
-- =====================================================

-- ATENÇÃO: Descomente as linhas abaixo apenas se tiver certeza de que quer remover data_evento
-- e depois de verificar que todos os dados foram migrados corretamente

-- -- Remover índice da coluna antiga
-- DROP INDEX IF EXISTS idx_entregar_imagens_data_evento;
-- 
-- -- Remover a coluna antiga
-- ALTER TABLE public.entregar_imagens DROP COLUMN IF EXISTS data_evento;