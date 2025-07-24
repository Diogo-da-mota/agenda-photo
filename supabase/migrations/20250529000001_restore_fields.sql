-- Migração para restaurar campos na tabela portfolio_trabalhos e manter compatibilidade

-- 1. Restaurar os campos removidos na migração anterior
ALTER TABLE public.portfolio_trabalhos 
ADD COLUMN IF NOT EXISTS urls_drive TEXT[] DEFAULT '{}'::text[];

ALTER TABLE public.portfolio_trabalhos 
ADD COLUMN IF NOT EXISTS url_imagem_drive TEXT;

-- 2. Adicionar comentários para documentação
COMMENT ON COLUMN public.portfolio_trabalhos.urls_drive IS 'Array de URLs do Google Drive (mantido para compatibilidade)';
COMMENT ON COLUMN public.portfolio_trabalhos.url_imagem_drive IS 'URL principal da imagem no Google Drive (mantido para compatibilidade)'; 