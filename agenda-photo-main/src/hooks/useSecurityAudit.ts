
import { useState, useCallback } from 'react';
import { checkTablePolicies } from '@/utils/secureQuery';
import { TABLES_TO_AUDIT } from '@/components/diagnostics/rls/rlsAuditUtils';

interface SecurityIssue {
  table: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
}

export const useSecurityAudit = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [progress, setProgress] = useState(0);

  const runSecurityAudit = useCallback(async () => {
    setIsAuditing(true);
    setIssues([]);
    setProgress(0);

    const foundIssues: SecurityIssue[] = [];
    const totalTables = TABLES_TO_AUDIT.length;

    for (let i = 0; i < TABLES_TO_AUDIT.length; i++) {
      const tableName = TABLES_TO_AUDIT[i];
      
      try {
        const { data: policies, error } = await checkTablePolicies(tableName);
        
        if (error) {
          foundIssues.push({
            table: tableName,
            severity: 'high',
            issue: 'Erro ao verificar políticas RLS',
            recommendation: 'Verificar se a tabela existe e tem RLS habilitado'
          });
          continue;
        }

        if (!policies || policies.length === 0) {
          foundIssues.push({
            table: tableName,
            severity: 'critical',
            issue: 'Nenhuma política RLS encontrada',
            recommendation: 'Implementar políticas RLS para proteger dados do usuário'
          });
        } else {
          // Verificar se tem políticas para todas as operações
          const commands = policies.map((p: any) => p.comando);
          const missingOps = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].filter(
            op => !commands.includes(op)
          );

          if (missingOps.length > 0) {
            foundIssues.push({
              table: tableName,
              severity: 'medium',
              issue: `Operações sem política RLS: ${missingOps.join(', ')}`,
              recommendation: 'Adicionar políticas RLS para todas as operações necessárias'
            });
          }
        }

        setProgress(((i + 1) / totalTables) * 100);
      } catch (error) {
        console.error(`Erro na auditoria da tabela ${tableName}:`, error);
        foundIssues.push({
          table: tableName,
          severity: 'high',
          issue: 'Erro inesperado durante auditoria',
          recommendation: 'Investigar logs de erro para mais detalhes'
        });
      }
    }

    setIssues(foundIssues);
    setIsAuditing(false);
  }, []);

  const getSeverityCount = useCallback((severity: SecurityIssue['severity']) => {
    return issues.filter(issue => issue.severity === severity).length;
  }, [issues]);

  const getSecurityScore = useCallback(() => {
    if (issues.length === 0) return 100;
    
    const weights = { critical: 10, high: 5, medium: 2, low: 1 };
    const totalWeight = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
    const maxPossibleWeight = TABLES_TO_AUDIT.length * weights.critical;
    
    return Math.max(0, Math.round(100 - (totalWeight / maxPossibleWeight) * 100));
  }, [issues]);

  return {
    isAuditing,
    issues,
    progress,
    runSecurityAudit,
    getSeverityCount,
    getSecurityScore
  };
};
