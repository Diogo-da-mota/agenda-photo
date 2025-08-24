-- ========================================
-- SECURITY FIX: ADD MISSING RLS POLICIES FOR EXISTING TABLES
-- Only target tables that exist with correct column structures
-- Date: 2025-01-24
-- ========================================

-- STEP 1: Add RLS policies for configuracoes_integracoes table (has user_id)
ALTER TABLE configuracoes_integracoes ENABLE ROW LEVEL SECURITY;

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

-- STEP 2: Add RLS policies for integracoes_calendario table (has usuario_id)
ALTER TABLE integracoes_calendario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own calendar integrations" ON integracoes_calendario;
DROP POLICY IF EXISTS "Users can insert their own calendar integrations" ON integracoes_calendario;
DROP POLICY IF EXISTS "Users can update their own calendar integrations" ON integracoes_calendario;
DROP POLICY IF EXISTS "Users can delete their own calendar integrations" ON integracoes_calendario;

CREATE POLICY "Users can view their own calendar integrations" 
ON integracoes_calendario FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own calendar integrations" 
ON integracoes_calendario FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own calendar integrations" 
ON integracoes_calendario FOR UPDATE 
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own calendar integrations" 
ON integracoes_calendario FOR DELETE 
USING (auth.uid() = usuario_id);

-- STEP 3: Add RLS policies for modelos_contrato table (has id_fotografo)
ALTER TABLE modelos_contrato ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own contract templates" ON modelos_contrato;
DROP POLICY IF EXISTS "Users can insert their own contract templates" ON modelos_contrato;
DROP POLICY IF EXISTS "Users can update their own contract templates" ON modelos_contrato;
DROP POLICY IF EXISTS "Users can delete their own contract templates" ON modelos_contrato;

CREATE POLICY "Users can view their own contract templates" 
ON modelos_contrato FOR SELECT 
USING (auth.uid() = id_fotografo);

CREATE POLICY "Users can insert their own contract templates" 
ON modelos_contrato FOR INSERT 
WITH CHECK (auth.uid() = id_fotografo);

CREATE POLICY "Users can update their own contract templates" 
ON modelos_contrato FOR UPDATE 
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

CREATE POLICY "Users can delete their own contract templates" 
ON modelos_contrato FOR DELETE 
USING (auth.uid() = id_fotografo);

-- STEP 4: Add RLS policies for notificacoes table (has user_id)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

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

-- STEP 5: Add RLS policies for mensagens_logs table (has user_id)
ALTER TABLE mensagens_logs ENABLE ROW LEVEL SECURITY;

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

-- STEP 6: Add RLS policies for pagamentos table (has id_fotografo)
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON pagamentos;
DROP POLICY IF EXISTS "Users can insert their own payments" ON pagamentos;
DROP POLICY IF EXISTS "Users can update their own payments" ON pagamentos;
DROP POLICY IF EXISTS "Users can delete their own payments" ON pagamentos;

CREATE POLICY "Users can view their own payments" 
ON pagamentos FOR SELECT 
USING (auth.uid() = id_fotografo);

CREATE POLICY "Users can insert their own payments" 
ON pagamentos FOR INSERT 
WITH CHECK (auth.uid() = id_fotografo);

CREATE POLICY "Users can update their own payments" 
ON pagamentos FOR UPDATE 
USING (auth.uid() = id_fotografo)
WITH CHECK (auth.uid() = id_fotografo);

CREATE POLICY "Users can delete their own payments" 
ON pagamentos FOR DELETE 
USING (auth.uid() = id_fotografo);

-- STEP 7: Secure database functions - Add SET search_path to SECURITY DEFINER functions
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
-- CRITICAL SECURITY FIXES APPLIED:
-- - Fixed XSS vulnerabilities in contract signature modal
-- - Fixed HTML injection in receipt generator
-- - Improved encryption key management for credentials
-- - Added comprehensive RLS policies for exposed tables
-- - Secured SECURITY DEFINER functions with SET search_path
-- ========================================