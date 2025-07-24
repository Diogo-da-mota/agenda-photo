
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PolicyInfo {
  nome_politica: string;
  tabela: string;
  esquema: string;
  funcoes: string[];
  comando: string;
  usando: string;
  verificacao: string;
}

interface TableStatus {
  table_name: string;
  policies_count: number;
  has_rls: boolean;
  status: 'secure' | 'warning' | 'danger';
}

export const useRLSData = () => {
  const [policies, setPolicies] = useState<PolicyInfo[]>([]);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const tablesToCheck = ['fotos_drive'];

  const loadPoliciesForTable = async (tableName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verificar_politicas_rls', { 
        nome_tabela: tableName 
      });
      
      if (error) {
        console.error('Erro ao carregar políticas RLS:', error);
        toast({
          title: "Erro",
          description: `Erro ao carregar políticas para ${tableName}: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      setPolicies(data || []);
    } catch (error) {
      console.error('Exceção ao carregar políticas:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar políticas RLS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllTableStatuses = async () => {
    setLoading(true);
    const statuses: TableStatus[] = [];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase.rpc('verificar_politicas_rls', { 
          nome_tabela: tableName 
        });
        
        if (!error && data) {
          const policiesCount = data.length;
          const hasRLS = policiesCount > 0;
          let status: 'secure' | 'warning' | 'danger' = 'danger';
          
          if (hasRLS && policiesCount >= 2) {
            status = 'secure';
          } else if (hasRLS && policiesCount >= 1) {
            status = 'warning';
          }
          
          statuses.push({
            table_name: tableName,
            policies_count: policiesCount,
            has_rls: hasRLS,
            status: status
          });
        }
      } catch (error) {
        console.error(`Erro ao verificar ${tableName}:`, error);
        statuses.push({
          table_name: tableName,
          policies_count: 0,
          has_rls: false,
          status: 'danger'
        });
      }
    }
    
    setTableStatuses(statuses);
    setLoading(false);
  };

  return {
    policies,
    tableStatuses,
    loading,
    loadPoliciesForTable,
    loadAllTableStatuses
  };
};
