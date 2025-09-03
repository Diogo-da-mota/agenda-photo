-- =====================================================
-- MIGRAÇÃO: ADICIONAR CAMPO CPF_CLIENTE À AGENDA_EVENTOS
-- Data: 2025-01-28
-- Objetivo: Adicionar campo cpf_cliente para autenticação de clientes
-- =====================================================

-- Adicionar campo cpf_cliente à tabela agenda_eventos
ALTER TABLE public.agenda_eventos 
ADD COLUMN IF NOT EXISTS cpf_cliente TEXT;

-- Adicionar campo endereco_cliente à tabela agenda_eventos (se não existir)
ALTER TABLE public.agenda_eventos 
ADD COLUMN IF NOT EXISTS endereco_cliente TEXT;

-- Criar índice para melhorar performance das consultas de autenticação
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_cpf_cliente 
ON public.agenda_eventos(cpf_cliente);

-- Comentários para documentação
COMMENT ON COLUMN public.agenda_eventos.cpf_cliente IS 'CPF do cliente para autenticação no sistema de contratos';
COMMENT ON COLUMN public.agenda_eventos.endereco_cliente IS 'Endereço do cliente para exibição nos contratos';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'agenda_eventos' 
AND column_name IN ('cpf_cliente', 'endereco_cliente')
ORDER BY column_name;