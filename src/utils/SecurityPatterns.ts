/**
 * Repositório central de padrões (RegExp) para identificar dados sensíveis.
 * Estes padrões são usados pelo SecureLogger para mascarar informações automaticamente.
 */
export const SENSITIVE_PATTERNS: Record<string, RegExp> = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  supabaseKey: /eyJ[A-Za-z0-9-_=]{10,}\.eyJ[A-Za-z0-9-_=]{10,}\.[A-Za-z0-9-_.+/=]{10,}/gi,
  supabaseUrl: /https:\/\/[a-z0-9]+\.supabase\.co/g,
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  userId: /(?:userId|user_id|id_usuario)["'\s:=]+['"]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['"]?/gi,
  token: /(?:bearer|token|key|secret|password|auth-token|api-key)["'\s:=]+([a-zA-Z0-9-_.]{20,})/gi,
  password: /("?password"?|"?secret"?)\s*:\s*".*?"/gi,
  ipv4: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  path: /(?:path)["'\s:=]+['"]?\/[a-zA-Z0-9\/_-]+['"]?/gi,
  role: /(?:role)["'\s:=]+['"]?(?:admin|user|protected)['"]?/gi,
};