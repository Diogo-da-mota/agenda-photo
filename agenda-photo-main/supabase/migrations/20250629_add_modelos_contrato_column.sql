-- Adicionar coluna modelos_contrato à tabela contratos
-- Data: 2025-06-29
-- Descrição: Adiciona flag para identificar contratos que são templates

DO $$
BEGIN
    -- Verificar se o campo modelos_contrato não existe e adicioná-lo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'modelos_contrato') THEN
        ALTER TABLE public.contratos ADD COLUMN modelos_contrato BOOLEAN DEFAULT FALSE;
        
        -- Adicionar comentário para documentação
        COMMENT ON COLUMN public.contratos.modelos_contrato IS 'Flag que indica se o registro é um template de contrato';
    END IF;
END $$;
