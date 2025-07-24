-- ========================================
-- CORREÇÃO DE POLÍTICAS RLS PARA PORTFOLIO_TRABALHOS
-- Problema: Políticas incorretas bloqueando queries
-- Solução: Criar políticas corretas usando user_id
-- Data: 2025-01-27
-- ========================================

-- STEP 1: Habilitar RLS na tabela portfolio_trabalhos
ALTER TABLE portfolio_trabalhos ENABLE ROW LEVEL SECURITY;

-- STEP 2: Remover políticas antigas conflitantes (se existirem)
DROP POLICY IF EXISTS "Users can view own portfolio items" ON portfolio_trabalhos;
DROP POLICY IF EXISTS "Users can insert own portfolio items" ON portfolio_trabalhos;
DROP POLICY IF EXISTS "Users can update own portfolio items" ON portfolio_trabalhos;
DROP POLICY IF EXISTS "Users can delete own portfolio items" ON portfolio_trabalhos;

-- STEP 3: Criar políticas RLS corretas

-- Política para SELECT (visualização)
CREATE POLICY "Users can view own portfolio items" 
ON portfolio_trabalhos FOR SELECT 
USING (auth.uid() = user_id);

-- Política para INSERT (criação)
CREATE POLICY "Users can insert own portfolio items" 
ON portfolio_trabalhos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualização)
CREATE POLICY "Users can update own portfolio items" 
ON portfolio_trabalhos FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para DELETE (exclusão)
CREATE POLICY "Users can delete own portfolio items" 
ON portfolio_trabalhos FOR DELETE 
USING (auth.uid() = user_id);

-- ========================================
-- VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- Execute esta query para confirmar:
-- ========================================
/*
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'portfolio_trabalhos'
ORDER BY policyname;
*/

-- ========================================
-- RESULTADO ESPERADO:
-- 4 políticas criadas (SELECT, INSERT, UPDATE, DELETE)
-- Todas usando: auth.uid() = user_id
-- RLS habilitado na tabela
-- ======================================== 