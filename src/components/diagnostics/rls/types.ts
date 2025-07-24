
// Definição do tipo PolicyStatus
export type PolicyStatus = 'success' | 'warning' | 'error';

// Interface para resultados de políticas RLS
export interface RLSPolicyResult {
  policyname: string;
  tablename: string;
  schemaname: string;
  roles: string[];
  cmd: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  qual: string;
  with_check: string;
  permissive: string;
}

// Interface para detalhes da auditoria
export interface AuditDetail {
  tableName: string;
  hasRLS: boolean;
  policies: RLSPolicyResult[];
  missingPolicies?: string[];
  status: PolicyStatus;
}

// Interface para o resultado da auditoria
export interface AuditResult {
  tableName: string;
  status: PolicyStatus;
  hasRLS?: boolean;
  policies?: RLSPolicyResult[];
  details?: any;
}
