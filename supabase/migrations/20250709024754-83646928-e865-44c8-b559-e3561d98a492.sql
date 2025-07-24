-- Correções críticas de segurança RLS
-- 1. Corrigir políticas da tabela usuarios para permitir operações próprias
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.usuarios;

-- Criar políticas mais seguras e funcionais para usuarios
CREATE POLICY "usuarios_select_own" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 2. Corrigir política permissiva do sistema_atividades
DROP POLICY IF EXISTS "atividades_insert_own" ON public.sistema_atividades;
DROP POLICY IF EXISTS "atividades_select_own" ON public.sistema_atividades;

CREATE POLICY "sistema_atividades_select_own" 
ON public.sistema_atividades 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "sistema_atividades_insert_secure" 
ON public.sistema_atividades 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND table_name NOT IN ('auth', 'storage', 'supabase_functions')
);

-- 3. Adicionar função de validação de entrada segura
CREATE OR REPLACE FUNCTION public.validate_input_security(input_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se há tentativas de SQL injection ou XSS
  IF input_text ~* '(script|javascript|onload|onerror|eval|expression|vbscript)' THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar padrões de SQL injection
  IF input_text ~* '(union|select|insert|update|delete|drop|create|alter|exec|execute)(\s|/\*|\*/)' THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar caracteres perigosos
  IF input_text ~ '[<>"\'';&]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Adicionar função de log de segurança aprimorada
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

-- 5. Criar trigger para validação automática de inputs em tabelas críticas
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

-- Aplicar triggers de validação
DROP TRIGGER IF EXISTS validate_clientes_data ON public.clientes;
CREATE TRIGGER validate_clientes_data
  BEFORE INSERT OR UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_data();

DROP TRIGGER IF EXISTS validate_contratos_data ON public.contratos;
CREATE TRIGGER validate_contratos_data
  BEFORE INSERT OR UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_data();

-- 6. Melhorar políticas de storage para uploads seguros
CREATE POLICY "secure_file_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  -- Apenas arquivos com extensões permitidas
  (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp'))
  AND
  -- Tamanho máximo de 10MB
  ((metadata->>'size')::int < 10485760)
  AND
  -- Usuário autenticado
  (auth.uid() IS NOT NULL)
  AND
  -- Bucket permitido
  (bucket_id IN ('imagens', 'documentos', 'avatars'))
);

-- 7. Criar função para auditoria de mudanças sensíveis
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Auditar mudanças em dados financeiros
  IF TG_TABLE_NAME IN ('financeiro_transacoes', 'financeiro_despesas', 'contratos') THEN
    PERFORM public.log_security_event_enhanced('SENSITIVE_DATA_MODIFIED', 
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id),
        'changes', CASE 
          WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
          WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
          ELSE to_jsonb(NEW)
        END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoria
CREATE TRIGGER audit_financeiro_transacoes 
  AFTER INSERT OR UPDATE OR DELETE ON public.financeiro_transacoes
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

CREATE TRIGGER audit_contratos 
  AFTER INSERT OR UPDATE OR DELETE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();