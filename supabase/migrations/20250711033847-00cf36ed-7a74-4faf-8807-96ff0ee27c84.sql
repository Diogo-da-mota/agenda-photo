-- CORRIGIR VULNERABILIDADE CRÍTICA: Remover permissão de usuários editarem seus próprios papéis

-- Política mais restritiva para tabela usuarios - usuários NÃO podem alterar papel
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;

CREATE POLICY "Usuários podem atualizar dados próprios exceto papel" 
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Verifica se o papel não está sendo alterado ou se o usuário é admin
  (OLD.papel = NEW.papel OR public.has_role(auth.uid(), 'admin'))
);

-- Política mais restritiva para tabela perfis - usuários NÃO podem alterar role
DROP POLICY IF EXISTS "perfis_update_own" ON public.perfis;

CREATE POLICY "Usuários podem atualizar perfil exceto role" 
ON public.perfis
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Verifica se o role não está sendo alterado ou se o usuário é admin
  (OLD.role = NEW.role OR public.has_role(auth.uid(), 'admin'))
);

-- Política para admins gerenciarem papéis
CREATE POLICY "Admins podem gerenciar papéis de usuários" 
ON public.usuarios
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem gerenciar roles de perfis" 
ON public.perfis
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para criar papel padrão quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (NEW.id, 'usuario', NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Log de segurança para tentativas de elevação de privilégio
CREATE OR REPLACE FUNCTION public.log_privilege_escalation_attempt()
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
        'table', TG_TABLE_NAME
      )
    );
    RAISE EXCEPTION 'Tentativa de elevação de privilégio detectada e bloqueada';
  END IF;
  RETURN NEW;
END;
$$;