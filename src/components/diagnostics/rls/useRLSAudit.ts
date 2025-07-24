
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkTableRLS } from './rlsAuditUtils';
import { PolicyStatus, AuditResult } from './types';
import { TABLES_TO_AUDIT } from './rlsAuditUtils';

export const useRLSAudit = () => {
  const [tableStatus, setTableStatus] = useState<Record<string, PolicyStatus>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const auditTables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lista de tabelas a serem auditadas
      setTables(TABLES_TO_AUDIT);
      
      const statusMap: Record<string, PolicyStatus> = {};
      const results: AuditResult[] = [];
      
      // Para cada tabela, verificar o status RLS
      for (const table of TABLES_TO_AUDIT) {
        const status = await checkTableRLS(table);
        statusMap[table] = status;
        results.push({
          tableName: table,
          status: status
        });
      }
      
      setTableStatus(statusMap);
      setAuditResults(results);
    } catch (err) {
      console.error("Erro ao auditar tabelas:", err);
      setError("Falha ao verificar políticas RLS");
    } finally {
      setLoading(false);
    }
  };

  // Ao montar o componente, executar a auditoria
  useEffect(() => {
    auditTables();
  }, []);

  // Função para calcular estatísticas dos resultados
  const getStats = () => {
    const total = auditResults.length;
    const success = auditResults.filter(r => r.status === 'success').length;
    const warning = auditResults.filter(r => r.status === 'warning').length;
    const error = auditResults.filter(r => r.status === 'error').length;
    
    return {
      total,
      success,
      warning,
      error
    };
  };

  return {
    tableStatus,
    loading,
    error,
    tables,
    refreshAudit: auditTables,
    auditResults,
    showDetails,
    setShowDetails,
    auditTables,
    getStats
  };
};
