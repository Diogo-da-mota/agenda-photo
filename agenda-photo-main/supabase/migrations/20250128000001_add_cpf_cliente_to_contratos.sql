-- =====================================================
-- MIGRAÇÃO: ADICIONAR CAMPO CPF_CLIENTE À TABELA CONTRATOS
-- Data: 2025-01-28
-- Objetivo: Adicionar campo cpf_cliente para armazenar CPF do cliente diretamente no contrato
-- =====================================================

-- Adicionar campo cpf_cliente à tabela contratos se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'cpf_cliente') THEN
        ALTER TABLE public.contratos ADD COLUMN cpf_cliente TEXT;
    END IF;
END $$;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.contratos.cpf_cliente IS 'CPF do cliente armazenado diretamente no contrato para facilitar consultas';

-- Criar índice para melhorar performance de consultas por CPF
CREATE INDEX IF NOT EXISTS idx_contratos_cpf_cliente
ON public.contratos(cpf_cliente);