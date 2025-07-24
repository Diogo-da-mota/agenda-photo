-- ========================================
-- CORREÇÃO URGENTE: ÍNDICES PORTFOLIO_TRABALHOS
-- Data: 2025-01-14
-- Objetivo: Resolver timeout erro 57014
-- ========================================

-- 1. VERIFICAR ÍNDICES EXISTENTES
SELECT 
    'ÍNDICES ATUAIS' as secao,
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'portfolio_trabalhos'
ORDER BY indexname;

-- 2. CRIAR ÍNDICES CRÍTICOS PARA PERFORMANCE

-- Índice composto para (id, user_id) - CRÍTICO para UPDATE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_id_user 
ON portfolio_trabalhos(id, user_id);

-- Índice para user_id ordenado por data de criação
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_user_created 
ON portfolio_trabalhos(user_id, criado_em DESC);

-- Índice para operações de atualização por data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_updated 
ON portfolio_trabalhos(atualizado_em) 
WHERE atualizado_em IS NOT NULL;

-- 3. ATUALIZAR ESTATÍSTICAS DA TABELA
ANALYZE portfolio_trabalhos;

-- 4. VERIFICAR NOVOS ÍNDICES CRIADOS
SELECT 
    'NOVOS ÍNDICES' as secao,
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'portfolio_trabalhos'
AND indexname LIKE 'idx_portfolio%'
ORDER BY indexname;

-- 5. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    'ESTRUTURA DA TABELA' as secao,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'portfolio_trabalhos' 
ORDER BY ordinal_position;

-- 6. CONTAR REGISTROS
SELECT 
    'ESTATÍSTICAS' as secao,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    MIN(criado_em) as primeiro_registro,
    MAX(atualizado_em) as ultima_atualizacao
FROM portfolio_trabalhos;

-- 7. COMENTÁRIOS DE DOCUMENTAÇÃO
COMMENT ON INDEX idx_portfolio_trabalhos_id_user IS 'Índice composto CRÍTICO para operações UPDATE otimizadas (id, user_id) - Resolve timeout 57014';
COMMENT ON INDEX idx_portfolio_trabalhos_user_created IS 'Índice para listagem de trabalhos por usuário ordenado por data';
COMMENT ON INDEX idx_portfolio_trabalhos_updated IS 'Índice parcial para consultas por data de atualização';

-- ========================================
-- TESTE DE PERFORMANCE
-- ========================================

-- Simular UPDATE que causava timeout
-- EXPLAIN ANALYZE UPDATE portfolio_trabalhos 
-- SET atualizado_em = NOW()
-- WHERE id = 'test-id' AND user_id = 'test-user';

SELECT 'CORREÇÃO APLICADA COM SUCESSO!' as status; 