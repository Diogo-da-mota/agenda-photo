
import { supabase } from '@/lib/supabase';
import { sanitizeTableName } from './validation';

/**
 * Interface para resultados de consultas seguras
 */
interface SecureQueryResult<T = any> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}

/**
 * Executa consultas SQL de forma segura usando o query builder do Supabase
 * IMPORTANTE: Só deve ser usado para consultas de leitura
 */
export const executeSecureSelect = async <T = any>(
  tableName: string,
  columns: string = '*',
  conditions?: Record<string, any>
): Promise<SecureQueryResult<T>> => {
  try {
    // Validar nome da tabela
    const safeTableName = sanitizeTableName(tableName);
    
    // Construir query usando o query builder do Supabase (mais seguro)
    let query = supabase.from(safeTableName as any).select(columns);
    
    // Aplicar condições de forma segura
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        // Sanitizar chave da coluna
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
        query = query.eq(safeKey, value);
      });
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error(`Erro na consulta segura para ${safeTableName}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    
    return { data: data as T[], error: null, count };
  } catch (error) {
    console.error('Erro na execução de consulta segura:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Erro desconhecido') 
    };
  }
};

/**
 * Busca dados com filtros seguros
 */
export const secureSearch = async <T = any>(
  tableName: string,
  searchColumn: string,
  searchValue: string,
  additionalColumns: string = '*'
): Promise<SecureQueryResult<T>> => {
  try {
    const safeTableName = sanitizeTableName(tableName);
    const safeColumn = searchColumn.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Sanitizar valor de busca
    const safeSearchValue = searchValue.replace(/[%_]/g, '\\$&'); // Escapar wildcards
    
    const { data, error } = await supabase
      .from(safeTableName as any)
      .select(additionalColumns)
      .ilike(safeColumn, `%${safeSearchValue}%`);
    
    if (error) {
      console.error(`Erro na busca segura em ${safeTableName}:`, error);
      return { data: null, error: new Error(error.message) };
    }
    
    return { data: data as T[], error: null };
  } catch (error) {
    console.error('Erro na busca segura:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Erro desconhecido') 
    };
  }
};

/**
 * Verifica políticas RLS de uma tabela de forma segura
 */
export const checkTablePolicies = async (tableName: string) => {
  try {
    const safeTableName = sanitizeTableName(tableName);
    
    // Usar função RPC existente que já é segura
    const { data, error } = await supabase.rpc('verificar_politicas_rls', {
      nome_tabela: safeTableName
    });
    
    if (error) {
      console.error(`Erro ao verificar políticas de ${safeTableName}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Erro ao verificar políticas:', error);
    return { data: null, error };
  }
};
