-- ========================================
-- CRITICAL SECURITY FIXES - Priority 1 (CORRECTED)
-- Fix public RLS policies and secure sensitive data
-- ========================================

-- STEP 1: Remove dangerous public policies from sensitive tables
DROP POLICY IF EXISTS "public_read_agenda_eventos_for_client_login" ON agenda_eventos;
DROP POLICY IF EXISTS "public_contracts_select" ON contratos;
DROP POLICY IF EXISTS "public_read_contracts" ON contratos;

-- STEP 2: Enable RLS on financial tables that are missing it
ALTER TABLE financeiro_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_categorias ENABLE ROW LEVEL SECURITY; 
ALTER TABLE financeiro_formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create secure RLS policies for financial tables
CREATE POLICY "Users can view their own despesas" 
ON financeiro_despesas FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own despesas" 
ON financeiro_despesas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own despesas" 
ON financeiro_despesas FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own despesas" 
ON financeiro_despesas FOR DELETE 
USING (auth.uid() = user_id);

-- Financial categories policies
CREATE POLICY "Users can view their own categories" 
ON financeiro_categorias FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" 
ON financeiro_categorias FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON financeiro_categorias FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON financeiro_categorias FOR DELETE 
USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods" 
ON financeiro_formas_pagamento FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
ON financeiro_formas_pagamento FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
ON financeiro_formas_pagamento FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" 
ON financeiro_formas_pagamento FOR DELETE 
USING (auth.uid() = user_id);

-- Company configurations policies  
CREATE POLICY "Users can view their own company config" 
ON configuracoes_empresa FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company config" 
ON configuracoes_empresa FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company config" 
ON configuracoes_empresa FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company config" 
ON configuracoes_empresa FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 4: Create missing clientes table if it doesn't exist and secure it
CREATE TABLE IF NOT EXISTS public.clientes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    nome text NOT NULL,
    telefone text,
    email text,
    cpf character varying,
    endereco text,
    observacoes text,
    criado_em timestamp with time zone DEFAULT now(),
    atualizado_em timestamp with time zone DEFAULT now()
);

-- Enable RLS on clientes if not already enabled
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Create secure policies for clientes
DROP POLICY IF EXISTS "Users can view their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clientes;  
DROP POLICY IF EXISTS "Users can update their own clients" ON clientes;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clientes;

CREATE POLICY "Users can view their own clients" 
ON clientes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" 
ON clientes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON clientes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON clientes FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 5: Secure backup table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agenda_eventos_backup') THEN
        ALTER TABLE agenda_eventos_backup ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own backup events" ON agenda_eventos_backup;
        DROP POLICY IF EXISTS "Users can insert their own backup events" ON agenda_eventos_backup;
        DROP POLICY IF EXISTS "Users can update their own backup events" ON agenda_eventos_backup;
        DROP POLICY IF EXISTS "Users can delete their own backup events" ON agenda_eventos_backup;
        
        CREATE POLICY "Users can view their own backup events" 
        ON agenda_eventos_backup FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own backup events" 
        ON agenda_eventos_backup FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own backup events" 
        ON agenda_eventos_backup FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own backup events" 
        ON agenda_eventos_backup FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- STEP 6: Only secure actual tables (skip views like galeria)
-- Check if imagens_galeria is a table before applying RLS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'imagens_galeria' 
        AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE imagens_galeria ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view their own gallery images" ON imagens_galeria;
        DROP POLICY IF EXISTS "Users can insert their own gallery images" ON imagens_galeria;
        DROP POLICY IF EXISTS "Users can update their own gallery images" ON imagens_galeria;
        DROP POLICY IF EXISTS "Users can delete their own gallery images" ON imagens_galeria;

        CREATE POLICY "Users can view their own gallery images" 
        ON imagens_galeria FOR SELECT 
        USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own gallery images" 
        ON imagens_galeria FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own gallery images" 
        ON imagens_galeria FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own gallery images" 
        ON imagens_galeria FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- STEP 7: Secure financeiro_transacoes with proper RLS
ALTER TABLE financeiro_transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON financeiro_transacoes;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON financeiro_transacoes;
DROP POLICY IF EXISTS "Users can update their own transactions" ON financeiro_transacoes;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON financeiro_transacoes;

CREATE POLICY "Users can view their own transactions" 
ON financeiro_transacoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON financeiro_transacoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON financeiro_transacoes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON financeiro_transacoes FOR DELETE 
USING (auth.uid() = user_id);