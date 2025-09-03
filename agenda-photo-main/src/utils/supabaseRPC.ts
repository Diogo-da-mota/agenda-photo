
import { supabase } from '@/lib/supabase';
import { sanitizeTableName } from './validation';

/**
 * Executa SQL seguro usando RPC - removido por não estar disponível
 * IMPORTANTE: Esta função deve ser usada apenas para consultas de leitura
 */
export const executeSQL = async (query: string) => {
  console.warn('executeSQL: Função não implementada - usar query builder do Supabase');
  return { data: null, error: new Error('Função executeSQL não disponível') };
};

/**
 * Verifica se uma tabela existe no banco de dados
 * @param tableName Nome da tabela a ser verificada
 * @returns Resultado indicando se a tabela existe
 */
export const checkTableExists = async (tableName: string) => {
  const validTableName = sanitizeTableName(tableName);
  return supabase.rpc('pg_table_exists', { table_name: validTableName });
};

/**
 * Tipo para garantir que apenas tabelas conhecidas sejam acessadas
 */
export type SupabaseTableName = string;

/**
 * Helper para selecionar uma tabela com tipo correto
 */
export const supabaseTable = (tableName: SupabaseTableName) => {
  sanitizeTableName(tableName);
  return supabase.from(tableName as any);
};

// Interface para políticas RLS
export interface RLSPolicy {
  policyname: string;
  tablename: string;
  schemaname: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

/**
 * Executa consulta rpc para verificar políticas de segurança em uma tabela
 */
export const getPolicies = async (tableName: string) => {
  try {
    const validTableName = sanitizeTableName(tableName);
    
    const { data, error } = await supabase.rpc('verificar_politicas_rls', {
      nome_tabela: validTableName
    });
    
    if (error) {
      console.error('Erro ao buscar políticas:', error);
      throw new Error('Falha ao buscar políticas da tabela');
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Erro ao buscar políticas:', err);
    return { data: null, error: err };
  }
};

/**
 * Verifica políticas RLS usando a função segura em português
 */
export const verificarPoliticasRLS = async (nomeTabela: string) => {
  try {
    const validTableName = sanitizeTableName(nomeTabela);
    const { data, error } = await supabase.rpc('verificar_politicas_rls', { nome_tabela: validTableName });
    return { data, error };
  } catch (err) {
    console.error("Erro ao verificar políticas RLS:", err);
    return { data: null, error: err };
  }
};
