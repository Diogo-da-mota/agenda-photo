-- Aplicar triggers de segurança para prevenir elevação de privilégio

-- Trigger específico para tabela usuarios
DROP TRIGGER IF EXISTS prevent_privilege_escalation_usuarios ON public.usuarios;

CREATE OR REPLACE FUNCTION public.log_privilege_escalation_usuarios()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log tentativa de alteração de papel por usuário não autorizado
  IF (TG_OP = 'UPDATE' AND OLD.papel != NEW.papel AND NOT public.has_role(auth.uid(), 'admin')) THEN
    PERFORM public.log_security_event_enhanced(
      'PRIVILEGE_ESCALATION_ATTEMPT',
      jsonb_build_object(
        'user_id', auth.uid(),
        'target_user', NEW.id,
        'old_role', OLD.papel,
        'attempted_role', NEW.papel,
        'table', 'usuarios'
      )
    );
    RAISE EXCEPTION 'Tentativa de elevação de privilégio detectada e bloqueada';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_privilege_escalation_usuarios
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.log_privilege_escalation_usuarios();

-- Trigger específico para tabela perfis
DROP TRIGGER IF EXISTS prevent_privilege_escalation_perfis ON public.perfis;

CREATE OR REPLACE FUNCTION public.log_privilege_escalation_perfis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log tentativa de alteração de role por usuário não autorizado
  IF (TG_OP = 'UPDATE' AND OLD.role != NEW.role AND NOT public.has_role(auth.uid(), 'admin')) THEN
    PERFORM public.log_security_event_enhanced(
      'PRIVILEGE_ESCALATION_ATTEMPT',
      jsonb_build_object(
        'user_id', auth.uid(),
        'target_user', NEW.id,
        'old_role', OLD.role,
        'attempted_role', NEW.role,
        'table', 'perfis'
      )
    );
    RAISE EXCEPTION 'Tentativa de elevação de privilégio detectada e bloqueada';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_privilege_escalation_perfis
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW
  EXECUTE FUNCTION public.log_privilege_escalation_perfis();