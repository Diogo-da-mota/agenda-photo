-- Adicionar campo nome_cliente à tabela contratos
-- Data: 2025-06-27
-- Descrição: Adiciona campo para armazenar o nome do cliente diretamente no contrato

DO $$
BEGIN
    -- Verificar se o campo nome_cliente não existe e adicioná-lo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'nome_cliente') THEN
        ALTER TABLE public.contratos ADD COLUMN nome_cliente TEXT;
        
        -- Adicionar comentário para documentação
        COMMENT ON COLUMN public.contratos.nome_cliente IS 'Nome do cliente armazenado diretamente no contrato';
    END IF;
END $$;
