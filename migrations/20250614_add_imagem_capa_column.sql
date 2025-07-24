-- Migration para adicionar coluna imagem_capa na tabela portfolio_trabalhos
-- Data: 2025-06-14
-- Descrição: Adicionar campo para seleção manual de imagem de capa

-- Adicionar coluna imagem_capa
ALTER TABLE public.portfolio_trabalhos 
ADD COLUMN IF NOT EXISTS imagem_capa TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.portfolio_trabalhos.imagem_capa 
IS 'URL da imagem escolhida como capa manualmente pelo usuário';

-- Atualizar registros existentes: definir primeira imagem como capa automática
UPDATE public.portfolio_trabalhos 
SET imagem_capa = COALESCE(
  url_imagem_drive,
  CASE 
    WHEN urls_drive IS NOT NULL AND array_length(urls_drive, 1) > 0 
    THEN urls_drive[1]
    WHEN imagens IS NOT NULL AND array_length(imagens, 1) > 0 
    THEN imagens[1]
    ELSE NULL
  END
)
WHERE imagem_capa IS NULL; 