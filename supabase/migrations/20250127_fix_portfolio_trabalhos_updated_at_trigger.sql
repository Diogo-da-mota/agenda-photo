-- ========================================
-- CORREÇÃO DO TRIGGER PARA PORTFOLIO_TRABALHOS
-- Problema: Trigger usando 'updated_at' em vez de 'atualizado_em'
-- Solução: Remover trigger incorreto e criar função correta
-- Data: 2025-01-27
-- ========================================

-- STEP 1: Remover o trigger incorreto
DROP TRIGGER IF EXISTS update_portfolio_trabalhos_updated_at ON portfolio_trabalhos;

-- STEP 2: Criar função correta para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_portfolio_trabalhos_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Criar trigger correto
CREATE TRIGGER update_portfolio_trabalhos_atualizado_em
    BEFORE UPDATE ON portfolio_trabalhos
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_trabalhos_atualizado_em();

-- ========================================
-- VERIFICAÇÃO
-- ========================================
-- Execute esta query para confirmar que o trigger foi criado corretamente:
/*
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'portfolio_trabalhos';
*/ 