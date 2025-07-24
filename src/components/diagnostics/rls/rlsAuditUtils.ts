
import { supabase } from '@/lib/supabase';
import { PolicyStatus, RLSPolicyResult } from './types';

export const TABLES_TO_AUDIT = [
  'clientes',
  'perfis',
  'profiles',
  'imagens',
  'empresa_config',
  'app_settings',
  'configuracoes_app',
  'contratos',
  'mensagens',
  'notificacoes',
  'pagamentos',
  'user_integrations',
  'fotos_drive'
];

// Verifica se uma tabela tem RLS habilitado
export const checkTableRLS = async (tableName: string): Promise<PolicyStatus> => {
  try {
    // Verificar se a tabela existe
    const { data: tableExists, error: tableError } = await supabase.rpc('pg_table_exists', {
      table_name: tableName
    });

    if (tableError || !tableExists?.[0]?.table_found) {
      console.error(`Erro ao verificar existência da tabela ${tableName}:`, tableError);
      return 'error';
    }

    // Verificar políticas RLS usando RPC diretamente
    const { data, error } = await supabase.rpc('verificar_politicas_rls', {
      nome_tabela: tableName
    });
      
    if (error) {
      console.error(`Erro ao verificar políticas RLS para ${tableName}:`, error);
      return 'error';
    }
    
    // Se não tiver políticas, retornar warning
    if (!data || data.length === 0) {
      return 'warning';
    }
    
    // Verificar se tem políticas para todas as operações necessárias
    const operations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    const policyOperations = data.map((p: any) => p.cmd || p.comando);
    
    const hasAllPolicies = operations.every(op => 
      policyOperations.includes(op)
    );
    
    return hasAllPolicies ? 'success' : 'warning';
  } catch (error) {
    console.error(`Erro ao verificar RLS para ${tableName}:`, error);
    return 'error';
  }
};

// Obter as políticas RLS de uma tabela
export const getTableRLSPolicies = async (tableName: string): Promise<RLSPolicyResult[]> => {
  try {
    // Usar RPC para obter políticas RLS
    const { data, error } = await supabase.rpc('verificar_politicas_rls', {
      nome_tabela: tableName
    });

    if (error) {
      console.error(`Erro ao obter políticas RLS para ${tableName}:`, error);
      return [];
    }

    // Converter para o formato esperado
    return (data || []).map((policy: any) => ({
      policyname: policy.nome_politica || policy.policyname || '',
      tablename: policy.tabela || policy.tablename || tableName,
      schemaname: policy.esquema || policy.schemaname || 'public',
      roles: policy.funcoes || policy.roles || [],
      cmd: policy.comando || policy.cmd || '',
      qual: policy.usando || policy.qual || '',
      with_check: policy.verificacao || policy.with_check || ''
    })) as RLSPolicyResult[];
  } catch (error) {
    console.error(`Erro ao processar políticas RLS para ${tableName}:`, error);
    return [];
  }
};

// Gerar sugestão para correção da tabela
export const getSuggestionForTable = (tableName: string): string => {
  return `
    -- Habilitar RLS na tabela
    ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
    
    -- Criar política para SELECT
    CREATE POLICY "Usuários podem ver seus próprios dados em ${tableName}" 
    ON public.${tableName} FOR SELECT USING (auth.uid() = user_id);
    
    -- Criar política para INSERT
    CREATE POLICY "Usuários podem inserir seus próprios dados em ${tableName}" 
    ON public.${tableName} FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Criar política para UPDATE
    CREATE POLICY "Usuários podem atualizar seus próprios dados em ${tableName}" 
    ON public.${tableName} FOR UPDATE USING (auth.uid() = user_id);
    
    -- Criar política para DELETE
    CREATE POLICY "Usuários podem excluir seus próprios dados em ${tableName}" 
    ON public.${tableName} FOR DELETE USING (auth.uid() = user_id);
  `;
};
