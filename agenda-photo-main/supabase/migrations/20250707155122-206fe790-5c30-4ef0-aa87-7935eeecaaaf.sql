-- ================================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA (VERSÃO CORRIGIDA)
-- ================================================

-- 2. FUNÇÃO PARA VALIDAÇÃO DE UPLOAD SEGURO
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  file_name text,
  file_size bigint,
  content_type text
) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_file_size bigint := 10485760; -- 10MB
  allowed_types text[] := ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
BEGIN
  -- Verificar tamanho do arquivo
  IF file_size > max_file_size THEN
    RAISE EXCEPTION 'Arquivo muito grande. Máximo permitido: 10MB';
  END IF;
  
  -- Verificar tipo de conteúdo
  IF NOT (content_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'Tipo de arquivo não permitido: %', content_type;
  END IF;
  
  -- Verificar caracteres perigosos no nome do arquivo
  IF file_name ~ '[<>:"/\\|?*]' THEN
    RAISE EXCEPTION 'Nome de arquivo contém caracteres inválidos';
  END IF;
  
  RETURN true;
END;
$$;

-- 3. FUNÇÃO PARA LOG DE AUDITORIA DE SEGURANÇA
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb,
  user_id_param uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.sistema_atividades (
    table_name,
    operation,
    user_id,
    new_data
  ) VALUES (
    'security_events',
    event_type,
    user_id_param,
    jsonb_build_object(
      'timestamp', now(),
      'event_type', event_type,
      'details', event_details,
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  );
END;
$$;

-- 4. FUNÇÃO PARA RATE LIMITING
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier text,
  action_type text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count integer;
  window_start timestamp;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Contar tentativas no período
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.sistema_atividades
  WHERE 
    new_data->>'user_identifier' = user_identifier
    AND new_data->>'action_type' = action_type
    AND timestamp > window_start;
  
  -- Se excedeu o limite, registrar tentativa bloqueada
  IF attempt_count >= max_attempts THEN
    PERFORM public.log_security_event(
      'RATE_LIMIT_EXCEEDED',
      jsonb_build_object(
        'user_identifier', user_identifier,
        'action_type', action_type,
        'attempt_count', attempt_count,
        'max_attempts', max_attempts
      )
    );
    RETURN false;
  END IF;
  
  -- Registrar tentativa atual
  PERFORM public.log_security_event(
    'RATE_LIMIT_CHECK',
    jsonb_build_object(
      'user_identifier', user_identifier,
      'action_type', action_type,
      'attempt_count', attempt_count + 1
    )
  );
  
  RETURN true;
END;
$$;

-- 5. TRIGGER PARA AUDITORIA AUTOMÁTICA DE TABELAS SENSÍVEIS
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auditar mudanças em dados sensíveis
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'SENSITIVE_DATA_CHANGE',
      jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'old_data', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE null END,
        'new_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE null END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger em tabelas sensíveis
DROP TRIGGER IF EXISTS audit_contratos_changes ON public.contratos;
CREATE TRIGGER audit_contratos_changes
  AFTER UPDATE OR DELETE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_financeiro_changes ON public.financeiro_transacoes;
CREATE TRIGGER audit_financeiro_changes
  AFTER UPDATE OR DELETE ON public.financeiro_transacoes
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

-- 6. ÍNDICES PARA PERFORMANCE DE AUDITORIA
CREATE INDEX IF NOT EXISTS idx_sistema_atividades_timestamp 
ON public.sistema_atividades (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sistema_atividades_user_action 
ON public.sistema_atividades (user_id, operation, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sistema_atividades_security_events 
ON public.sistema_atividades (table_name, operation) 
WHERE table_name = 'security_events';