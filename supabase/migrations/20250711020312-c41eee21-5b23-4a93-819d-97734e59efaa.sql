-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA - SISTEMA DE PAPÉIS

-- Criar enum para papéis da aplicação
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'usuario', 'moderador');

-- Criar tabela de papéis de usuário (sistema seguro)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'usuario',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para verificar papéis (previne recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter papel atual do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'usuario'::app_role
  )
$$;

-- Políticas RLS para user_roles (apenas admins podem gerenciar papéis)
CREATE POLICY "Admins podem gerenciar todos os papéis" 
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver seu próprio papel" 
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

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

-- Aplicar trigger de segurança
CREATE TRIGGER prevent_privilege_escalation_usuarios
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.log_privilege_escalation_attempt();

CREATE TRIGGER prevent_privilege_escalation_perfis
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW
  EXECUTE FUNCTION public.log_privilege_escalation_attempt();