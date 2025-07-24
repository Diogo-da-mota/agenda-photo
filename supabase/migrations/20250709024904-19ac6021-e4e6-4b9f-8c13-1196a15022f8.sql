-- Adicionar função de log de segurança aprimorada
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  event_type TEXT,
  event_details JSONB,
  user_id_param UUID DEFAULT auth.uid(),
  ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
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
      'ip_address', COALESCE(ip_address, current_setting('request.headers', true)::jsonb->>'x-forwarded-for'),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'severity', CASE 
        WHEN event_type IN ('LOGIN_FAILED', 'BRUTE_FORCE', 'SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT') THEN 'HIGH'
        WHEN event_type IN ('RATE_LIMIT_EXCEEDED', 'INVALID_FILE_UPLOAD') THEN 'MEDIUM'
        ELSE 'LOW'
      END
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para validação automática de inputs em tabelas críticas
CREATE OR REPLACE FUNCTION public.validate_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar campos de texto em tabelas críticas
  IF TG_TABLE_NAME IN ('clientes', 'contratos', 'mensagens_modelos') THEN
    -- Validar campos de nome/título
    IF NEW.nome IS NOT NULL AND NOT public.validate_input_security(NEW.nome) THEN
      PERFORM public.log_security_event_enhanced('INVALID_INPUT_DETECTED', 
        jsonb_build_object('table', TG_TABLE_NAME, 'field', 'nome', 'value', LEFT(NEW.nome, 50))
      );
      RAISE EXCEPTION 'Dados de entrada contêm conteúdo não permitido';
    END IF;
    
    -- Validar campos de descrição/conteúdo
    IF TG_TABLE_NAME = 'contratos' AND NEW.conteudo IS NOT NULL 
       AND NOT public.validate_input_security(NEW.conteudo) THEN
      PERFORM public.log_security_event_enhanced('INVALID_INPUT_DETECTED', 
        jsonb_build_object('table', TG_TABLE_NAME, 'field', 'conteudo')
      );
      RAISE EXCEPTION 'Conteúdo do contrato contém elementos não permitidos';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;