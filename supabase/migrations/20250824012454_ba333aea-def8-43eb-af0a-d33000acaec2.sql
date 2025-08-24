-- CRITICAL SECURITY FIX: Remove dangerous public read access to customer data
-- Phase 2: Handle existing policies properly

-- First, drop ALL existing policies on clientes table
DROP POLICY IF EXISTS "Permitir leitura pública de clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert own clientes" ON public.clientes;  
DROP POLICY IF EXISTS "Users can update own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can view own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clientes;

-- Now create clean, secure policies
CREATE POLICY "secure_clients_select" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "secure_clients_insert" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secure_clients_update" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secure_clients_delete" 
ON public.clientes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Log this critical security fix
INSERT INTO public.sistema_atividades (
    table_name, 
    operation, 
    user_id, 
    new_data
) VALUES (
    'clientes',
    'SECURITY_FIX_COMPLETE',
    NULL,
    jsonb_build_object(
        'issue', 'CRITICAL: Removed dangerous public read policy exposing customer PII',
        'impact', 'Customer names, phones, emails, birth dates, financial data now secure',
        'previous_vulnerability', 'Anyone could read all customer data without authentication',
        'fix_applied', 'Strict user-specific access control policies implemented',
        'timestamp', now(),
        'severity', 'CRITICAL'
    )
);