-- ========================================
-- MIGRAÇÃO: OTIMIZAÇÃO ÍNDICES PORTFOLIO_TRABALHOS
-- Data: 2025-01-14
-- Objetivo: Resolver timeout erro 57014 nas operações UPDATE
-- ========================================

-- 1. VERIFICAR ÍNDICES EXISTENTES
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'portfolio_trabalhos';

-- 2. CRIAR ÍNDICES CRÍTICOS PARA PERFORMANCE

-- Índice composto para (id, user_id) - Usado no UPDATE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_id_user 
ON portfolio_trabalhos(id, user_id);

-- Índice para user_id ordenado por data de criação (listagens)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_user_created 
ON portfolio_trabalhos(user_id, criado_em DESC);

-- Índice para operações de atualização por data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_updated 
ON portfolio_trabalhos(atualizado_em) 
WHERE atualizado_em IS NOT NULL;

-- Índice para consultas por categoria do usuário
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_user_categoria 
ON portfolio_trabalhos(user_id, categoria);

-- Índice para campos de busca (titulo e tags)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_titulo_gin 
ON portfolio_trabalhos USING gin(titulo gin_trgm_ops);

-- Índice GIN para tags (busca em arrays)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_trabalhos_tags_gin 
ON portfolio_trabalhos USING gin(tags);

-- 3. VERIFICAR ESTATÍSTICAS DAS TABELAS
ANALYZE portfolio_trabalhos;

-- 4. VERIFICAR QUERIES ATIVAS QUE PODEM ESTAR TRAVANDO
SELECT 
    pid,
    query_start,
    state,
    query
FROM pg_stat_activity 
WHERE state = 'active' 
AND query NOT LIKE '%pg_stat_activity%'
AND query LIKE '%portfolio_trabalhos%';

-- 5. COMENTÁRIOS DE DOCUMENTAÇÃO
COMMENT ON INDEX idx_portfolio_trabalhos_id_user IS 'Índice composto para operações UPDATE otimizadas (id, user_id)';
COMMENT ON INDEX idx_portfolio_trabalhos_user_created IS 'Índice para listagem de trabalhos por usuário ordenado por data';
COMMENT ON INDEX idx_portfolio_trabalhos_updated IS 'Índice parcial para consultas por data de atualização';
COMMENT ON INDEX idx_portfolio_trabalhos_user_categoria IS 'Índice para filtros por categoria do usuário';
COMMENT ON INDEX idx_portfolio_trabalhos_titulo_gin IS 'Índice GIN para busca textual no título';
COMMENT ON INDEX idx_portfolio_trabalhos_tags_gin IS 'Índice GIN para busca em arrays de tags';

-- 6. VERIFICAR CONSTRAINT E CHAVES EXISTENTES
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'portfolio_trabalhos';

-- 7. ANÁLISE DE PERFORMANCE PÓS-CRIAÇÃO
-- Executar após aplicar a migração para verificar melhorias:
-- EXPLAIN ANALYZE UPDATE portfolio_trabalhos SET titulo = 'Teste' WHERE id = 'uuid' AND user_id = 'uuid'; 