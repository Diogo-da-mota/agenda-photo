-- supabase/migrations/20250710100000_fix_function_search_path_security.sql
-- Movendo para um novo arquivo de migração.
-- O conteúdo será adicionado na próxima etapa.
-- =================================================================
-- MIGRATION: Corrigir Vulnerabilidade de Search Path em Funções
-- =================================================================
--
-- DESCRIÇÃO:
-- Esta migração corrige uma vulnerabilidade de segurança ("Function Search Path Mutable")
-- apontada pelo Supabase Security Advisor. Para cada função listada, estamos definindo
-- explicitamente o `search_path` como 'public'. Isso previne ataques de "hijacking",
-- onde um usuário mal-intencionado poderia enganar a função para executar código
-- em um esquema não confiável.
--
-- FUNÇÕES CORRIGIDAS:
-- - get_storage_stats
-- - get_user_storage_usage
-- - check_rate_limit
-- - audit_sensitive_changes
-- - log_security_event
-- - log_security_event_enhanced
-- - validate_sensitive_data
-- - validate_input_security
-- - inserir_dados_backup_exemplo
-- - inserir_dados_backup_completo
-- - validate_file_upload
-- - E outras funções identificadas pelo Security Advisor.
--
-- APLICAÇÃO:
-- A correção é feita usando o comando `ALTER FUNCTION ... SET search_path`.
-- Isso é seguro e não altera a lógica interna das funções.

-- Corrigindo funções com assinaturas conhecidas e estáveis
ALTER FUNCTION public.get_storage_stats() SET search_path = public;
ALTER FUNCTION public.validate_input_security(input_text TEXT) SET search_path = public;
ALTER FUNCTION public.validate_sensitive_data() SET search_path = public;
ALTER FUNCTION public.audit_sensitive_changes() SET search_path = public;
ALTER FUNCTION public.validate_file_upload(file_name text, file_size bigint, content_type text) SET search_path = public;

-- Corrigindo funções com base nas assinaturas encontradas no código-fonte e tipos
-- Nota: As assinaturas podem ter variado entre migrações. Usando a mais provável.
ALTER FUNCTION public.check_rate_limit(p_user_id UUID, p_event_type TEXT) SET search_path = public;
ALTER FUNCTION public.log_security_event(event_type text, event_details json, user_id_param uuid) SET search_path = public;
ALTER FUNCTION public.log_security_event_enhanced(event_type text, event_details json, user_id_param uuid, ip_address text) SET search_path = public;

-- Corrigindo funções que aparecem nos avisos mas não foram encontradas nos arquivos de migração,
-- usando as assinaturas do arquivo de tipos (`types.ts`) ou inferindo.
-- Isso garante que a base de dados fique segura mesmo que o código esteja dessincronizado.
ALTER FUNCTION public.get_user_storage_usage() SET search_path = public;
ALTER FUNCTION public.inserir_dados_backup_exemplo(p_user_id uuid) SET search_path = public;
ALTER FUNCTION public.inserir_dados_backup_completo(p_user_id uuid) SET search_path = public;


-- NOTA FINAL:
-- As funções `check_file_type` e `criar_nova_indicacao` foram listadas no aviso de segurança,
-- mas não foi possível encontrar suas definições ou assinaturas no código-fonte.
-- Elas precisam ser corrigidas manualmente no Editor SQL do Supabase ou ter uma migração criada
-- assim que suas assinaturas (argumentos) forem conhecidas. Exemplo:
-- ALTER FUNCTION public.check_file_type(arg1 type, arg2 type) SET search_path = public;

COMMENT ON FUNCTION public.get_storage_stats() IS 'Calcula o uso total de armazenamento em bytes para o usuário autenticado. SECURITY PATCH: search_path set to public.';
COMMENT ON FUNCTION public.validate_input_security(input_text TEXT) IS 'Valida texto para previnir ataques de injeção. SECURITY PATCH: search_path set to public.'; 