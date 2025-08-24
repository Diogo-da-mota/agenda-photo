-- CRITICAL SECURITY FIX: Remove dangerous public read access to customer data
-- This policy allows anyone to access sensitive customer information

-- Drop the dangerous public read policy that exposes all customer data
DROP POLICY IF EXISTS "Permitir leitura pública de clientes" ON public.clientes;

-- Clean up duplicate policies to avoid confusion
DROP POLICY IF EXISTS "Users can delete own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can update own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can view own clientes" ON public.clientes;

-- Ensure we have clean, secure policies that only allow users to access their own client data
CREATE POLICY "Users can view their own clients" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
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
    'SECURITY_FIX',
    NULL,
    jsonb_build_object(
        'issue', 'Removed dangerous public read policy',
        'impact', 'Prevented unauthorized access to customer PII',
        'timestamp', now(),
        'severity', 'CRITICAL'
    )
);