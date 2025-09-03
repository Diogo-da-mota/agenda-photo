
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { SupabaseTableName } from '@/utils/supabaseRPC';
import { TableExistsResult } from '@/utils/supabaseTypes';

export type StatusType = 'loading' | 'success' | 'error';

interface TableTestResult {
  count?: number;
  exists?: boolean;
  table_found?: boolean;
}

export const useSupabaseTables = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<{ [key: string]: StatusType }>({});
  const [loading, setLoading] = useState(false);

  const tablesToTest = [
    'profiles',
    'clientes',
    'user_integrations',
    'audit_logs',
    'clientes_completo',
    'contratos',
    'empresa_config',
    'imagens',
    'mensagens',
    'notificacoes',
    'pagamentos',
    'perfis',
    'app_settings'
  ] as const;

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  const runTests = async () => {
    setLoading(true);
    const initialResults: { [key: string]: StatusType } = {};
    tablesToTest.forEach(table => {
      initialResults[table] = 'loading';
    });
    setResults(initialResults);

    const testResults: { [key: string]: StatusType } = {};
    for (const table of tablesToTest) {
      const result = await testSpecificTable(table);
      testResults[table] = result;
      setResults(prev => ({ ...prev, [table]: result }));
    }
    setLoading(false);
  };

  const testSpecificTable = async (tableName: typeof tablesToTest[number]) => {
    try {
      // Testando a existência da tabela com RPC corretamente tipado
      const { data, error } = await supabase.rpc('pg_table_exists', { 
        table_name: tableName 
      }) as { 
        data: TableExistsResult[] | null; 
        error: any 
      };

      if (error) {
        console.error(`Erro ao testar ${tableName}:`, error);
        return 'error';
      }

      // Verificando se a tabela existe
      if (data && data[0] && data[0].table_found) {
        // Se a tabela existir, tenta fazer uma consulta básica
        // Aqui fazemos uma verificação de tipo para garantir que o tableName é válido
        // Usando 'as any' apenas na chamada from() porque já validamos que a tabela existe
        const { error: selectError } = await supabase
          .from(tableName as any)
          .select('count')
          .limit(1);

        if (selectError) {
          console.error(`Erro ao consultar ${tableName}:`, selectError);
          return 'error';
        }

        return 'success';
      } else {
        console.error(`Tabela ${tableName} não encontrada`);
        return 'error';
      }
    } catch (error) {
      console.error(`Exceção ao testar ${tableName}:`, error);
      return 'error';
    }
  };

  return {
    tablesToTest,
    results,
    loading,
    runTests
  };
};
