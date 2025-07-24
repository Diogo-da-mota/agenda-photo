-- ========================================
-- LIMPEZA COMPLETA DOS TRIGGERS E FUNÇÕES PROBLEMÁTICAS
-- Problema: Função update_updated_at_column ainda existe e pode causar conflitos
-- Solução: Remover função problemática e garantir que só existe a correta
-- Data: 2025-01-27
-- ========================================

-- STEP 1: Remover função problemática se existir
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- STEP 2: Verificar se há outros triggers problemáticos
DROP TRIGGER IF EXISTS update_portfolio_trabalhos_updated_at ON portfolio_trabalhos;

-- STEP 3: Garantir que a função correta existe
CREATE OR REPLACE FUNCTION update_portfolio_trabalhos_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Garantir que o trigger correto existe (DROP e CREATE para garantir)
DROP TRIGGER IF EXISTS update_portfolio_trabalhos_atualizado_em ON portfolio_trabalhos;

CREATE TRIGGER update_portfolio_trabalhos_atualizado_em
    BEFORE UPDATE ON portfolio_trabalhos
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_trabalhos_atualizado_em();

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
-- Execute esta query para confirmar que tudo está correto:
/*
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'portfolio_trabalhos';

SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%updated_at%' OR routine_name LIKE '%atualizado_em%';
*/ 