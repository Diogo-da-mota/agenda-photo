-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA TABELA CONTRATOS
-- Data: 2025-06-27
-- Problema: Políticas usam 'fotografo_id' mas tabela tem 'user_id'
-- =====================================================

-- 1. REMOVER POLÍTICAS INCORRETAS
DROP POLICY IF EXISTS "Fotógrafos podem ver seus próprios contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Fotógrafos podem editar seus próprios contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Fotógrafos podem adicionar contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Clientes podem ver seus próprios contratos" ON "public"."contratos";
DROP POLICY IF EXISTS "Fotógrafos gerenciam seus contratos" ON "public"."contratos";

-- 2. ATIVAR RLS NA TABELA
ALTER TABLE "public"."contratos" ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS CORRETAS USANDO 'user_id'

-- Permitir que usuários vejam apenas seus próprios contratos
CREATE POLICY "Users can view their own contracts" 
ON "public"."contratos"
FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir que usuários editem apenas seus próprios contratos
CREATE POLICY "Users can update their own contracts" 
ON "public"."contratos"
FOR UPDATE 
USING (auth.uid() = user_id);

-- Permitir que usuários criem novos contratos
CREATE POLICY "Users can insert their own contracts" 
ON "public"."contratos"
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários deletem apenas seus próprios contratos
CREATE POLICY "Users can delete their own contracts" 
ON "public"."contratos"
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. POLÍTICA PARA CLIENTES VEREM SEUS CONTRATOS
-- (Opcional - se clientes precisam acessar diretamente)
CREATE POLICY "Clients can view their own contracts" 
ON "public"."contratos"
FOR SELECT 
USING (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE email = auth.email() 
    OR user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICAR A ESTRUTURA DA TABELA CONTRATOS
-- =====================================================

-- Verificar se todos os campos necessários existem
DO $$
BEGIN
    -- Adicionar campos que podem estar faltando
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'valor_total') THEN
        ALTER TABLE public.contratos ADD COLUMN valor_total DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'data_evento') THEN
        ALTER TABLE public.contratos ADD COLUMN data_evento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'tipo_evento') THEN
        ALTER TABLE public.contratos ADD COLUMN tipo_evento TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'data_assinatura') THEN
        ALTER TABLE public.contratos ADD COLUMN data_assinatura TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'conteudo') THEN
        ALTER TABLE public.contratos ADD COLUMN conteudo TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'email_cliente') THEN
        ALTER TABLE public.contratos ADD COLUMN email_cliente TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contratos' AND column_name = 'data_expiracao') THEN
        ALTER TABLE public.contratos ADD COLUMN data_expiracao TIMESTAMPTZ;
    END IF;
END $$;

-- =====================================================
-- VERIFICAR SE AS POLÍTICAS FORAM APLICADAS
-- =====================================================

-- Query para verificar as políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'contratos' 
ORDER BY policyname;
