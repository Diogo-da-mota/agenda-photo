
import AuditStats from './AuditStats';
import TableStatusDisplay from './TableStatusDisplay';
import { checkTableRLS, getTableRLSPolicies, getSuggestionForTable, TABLES_TO_AUDIT } from './rlsAuditUtils';
import { useRLSAudit } from './useRLSAudit';
import type { PolicyStatus } from './types';

// Exportar com os nomes corretos para manter compatibilidade
export {
  AuditStats,
  TableStatusDisplay,
  checkTableRLS,
  getTableRLSPolicies,
  // Aliases para manter compatibilidade com código existente
  checkTableRLS as checkTableHasRLS,
  checkTableRLS as checkTablePolicies,
  getSuggestionForTable,
  TABLES_TO_AUDIT
};

// Constante para manter compatibilidade com código existente
export const OPERATIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];

export type {
  PolicyStatus
};
