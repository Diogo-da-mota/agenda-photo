-- ========================================
-- CRITICAL SECURITY FIX: ADD MISSING RLS POLICIES
-- Tables with RLS enabled but no policies are exposed to all users
-- This migration adds comprehensive RLS policies for data protection
-- Date: 2025-01-24
-- ========================================

-- STEP 1: Add RLS policies for configuracoes_integracoes table
DROP POLICY IF EXISTS "Users can view their own integrations config" ON configuracoes_integracoes;
DROP POLICY IF EXISTS "Users can insert their own integrations config" ON configuracoes_integracoes;
DROP POLICY IF EXISTS "Users can update their own integrations config" ON configuracoes_integracoes;
DROP POLICY IF EXISTS "Users can delete their own integrations config" ON configuracoes_integracoes;

CREATE POLICY "Users can view their own integrations config" 
ON configuracoes_integracoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations config" 
ON configuracoes_integracoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations config" 
ON configuracoes_integracoes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations config" 
ON configuracoes_integracoes FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 2: Add RLS policies for integracoes_calendario table
DROP POLICY IF EXISTS "Users can view their own calendar integrations" ON integracoes_calendario;
DROP POLICY IF EXISTS "Users can insert their own calendar integrations" ON integracoes_calendario;
DROP POLICY IF EXISTS "Users can update their own calendar integrations" ON integracoes_calendario;
DROP POLICY IF EXISTS "Users can delete their own calendar integrations" ON integracoes_calendario;

CREATE POLICY "Users can view their own calendar integrations" 
ON integracoes_calendario FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar integrations" 
ON integracoes_calendario FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations" 
ON integracoes_calendario FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations" 
ON integracoes_calendario FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 3: Add RLS policies for modelos_contrato table
DROP POLICY IF EXISTS "Users can view their own contract templates" ON modelos_contrato;
DROP POLICY IF EXISTS "Users can insert their own contract templates" ON modelos_contrato;
DROP POLICY IF EXISTS "Users can update their own contract templates" ON modelos_contrato;
DROP POLICY IF EXISTS "Users can delete their own contract templates" ON modelos_contrato;

CREATE POLICY "Users can view their own contract templates" 
ON modelos_contrato FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contract templates" 
ON modelos_contrato FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contract templates" 
ON modelos_contrato FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract templates" 
ON modelos_contrato FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 4: Add RLS policies for perfis table
DROP POLICY IF EXISTS "Users can view their own profile" ON perfis;
DROP POLICY IF EXISTS "Users can insert their own profile" ON perfis;
DROP POLICY IF EXISTS "Users can update their own profile" ON perfis;
DROP POLICY IF EXISTS "Users can delete their own profile" ON perfis;

CREATE POLICY "Users can view their own profile" 
ON perfis FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON perfis FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON perfis FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
ON perfis FOR DELETE 
USING (auth.uid() = id);

-- STEP 5: Add RLS policies for notificacoes table
DROP POLICY IF EXISTS "Users can view their own notifications" ON notificacoes;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notificacoes;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notificacoes;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notificacoes;

CREATE POLICY "Users can view their own notifications" 
ON notificacoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON notificacoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON notificacoes FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
ON notificacoes FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 6: Add RLS policies for mensagens_logs table
DROP POLICY IF EXISTS "Users can view their own message logs" ON mensagens_logs;
DROP POLICY IF EXISTS "Users can insert their own message logs" ON mensagens_logs;
DROP POLICY IF EXISTS "Users can update their own message logs" ON mensagens_logs;
DROP POLICY IF EXISTS "Users can delete their own message logs" ON mensagens_logs;

CREATE POLICY "Users can view their own message logs" 
ON mensagens_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message logs" 
ON mensagens_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message logs" 
ON mensagens_logs FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message logs" 
ON mensagens_logs FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 7: Add RLS policies for respostas_orcamento table
DROP POLICY IF EXISTS "Users can view their own quote responses" ON respostas_orcamento;
DROP POLICY IF EXISTS "Users can insert their own quote responses" ON respostas_orcamento;
DROP POLICY IF EXISTS "Users can update their own quote responses" ON respostas_orcamento;
DROP POLICY IF EXISTS "Users can delete their own quote responses" ON respostas_orcamento;

CREATE POLICY "Users can view their own quote responses" 
ON respostas_orcamento FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quote responses" 
ON respostas_orcamento FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quote responses" 
ON respostas_orcamento FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quote responses" 
ON respostas_orcamento FOR DELETE 
USING (auth.uid() = user_id);

-- STEP 8: Secure functions - Add SET search_path to SECURITY DEFINER functions
-- This prevents search_path manipulation attacks

CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Auditar mudanças em dados financeiros
  IF TG_TABLE_NAME IN ('financeiro_transacoes', 'financeiro_despesas', 'contratos') THEN
    PERFORM public.log_security_event_enhanced('SENSITIVE_DATA_MODIFIED', 
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'changes', CASE 
          WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
          WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
          ELSE row_to_json(NEW)
        END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_policy_exists(table_name text, policy_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    policy_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = table_name 
        AND policyname = policy_name
    ) INTO policy_exists;
    
    RETURN policy_exists;
END;
$function$;

CREATE OR REPLACE FUNCTION public.incrementar_download_galeria(galeria_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    UPDATE public.entregar_fotos 
    SET total_downloads = total_downloads + 1,
        atualizado_em = now()
    WHERE id = galeria_id AND user_id = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.incrementar_acesso_galeria(galeria_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    UPDATE public.entregar_fotos 
    SET total_acessos = total_acessos + 1,
        ultimo_acesso = now(),
        atualizado_em = now()
    WHERE slug = galeria_slug;
END;
$function$;

-- ========================================
-- VERIFICATION QUERIES
-- Run these to verify the security fixes:
-- ========================================

/*
-- Check RLS policies were created
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'configuracoes_integracoes', 'integracoes_calendario', 'modelos_contrato',
  'perfis', 'notificacoes', 'mensagens_logs', 'respostas_orcamento'
)
ORDER BY tablename, policyname;

-- Check function security
SELECT proname, prosecdef, proconfig 
FROM pg_proc 
WHERE proname IN (
  'audit_sensitive_changes', 'check_policy_exists', 
  'incrementar_download_galeria', 'incrementar_acesso_galeria'
);
*/

-- ========================================
-- EXPECTED RESULTS:
-- - All tables should have 4 RLS policies each (SELECT, INSERT, UPDATE, DELETE)
-- - All SECURITY DEFINER functions should have search_path = 'public'
-- - Critical security vulnerabilities are now patched
-- ========================================