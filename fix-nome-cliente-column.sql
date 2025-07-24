-- SCRIPT SQL PARA ADICIONAR COLUNA nome_cliente
-- Execute este script no painel do Supabase (SQL Editor)
-- Data: 2025-06-27

-- Adicionar coluna nome_cliente à tabela contratos
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS nome_cliente TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.contratos.nome_cliente IS 'Nome do cliente armazenado diretamente no contrato';

-- Verificar se a coluna foi adicionada com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contratos' 
AND column_name = 'nome_cliente';
