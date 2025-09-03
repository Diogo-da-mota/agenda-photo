import { supabase } from '@/lib/supabase';
import { SecureLogger } from './SecureLogger';

export const checkMigrations = {
  // Verificar se as políticas RLS foram aplicadas
  async checkRLSPolicies() {
    SecureLogger.debug('[MIGRATION CHECK] Verificando políticas RLS...');
    
    try {
      // Verificar políticas da tabela portfolio_trabalhos
      const { data, error } = await supabase.rpc('check_rls_policies', {
        table_name: 'portfolio_trabalhos'
      });

      if (error) {
        SecureLogger.error('[MIGRATION CHECK] Erro ao verificar políticas:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.debug('[MIGRATION CHECK] Políticas RLS encontradas:', data);
      return { success: true, policies: data };
    } catch (error: any) {
      SecureLogger.error('[MIGRATION CHECK] Erro inesperado:', error);
      return { success: false, error: 'Erro ao verificar políticas RLS' };
    }
  },

  // Verificar se o bucket de imagens existe
  async checkStorageBucket() {
    SecureLogger.debug('[MIGRATION CHECK] Verificando bucket de imagens...');
    
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        SecureLogger.error('[MIGRATION CHECK] Erro ao listar buckets:', error);
        return { success: false, error: error.message };
      }

      const imagesBucket = data.find(bucket => bucket.name === 'imagens');
      
      if (!imagesBucket) {
        SecureLogger.warn('[MIGRATION CHECK] Bucket "imagens" não encontrado');
        return { success: false, error: 'Bucket "images" não encontrado' };
      }

      SecureLogger.debug('[MIGRATION CHECK] Bucket "images" encontrado:', imagesBucket);
      return { success: true, bucket: imagesBucket };
    } catch (error: any) {
      SecureLogger.error('[MIGRATION CHECK] Erro inesperado:', error);
      return { success: false, error: 'Erro ao verificar bucket de imagens' };
    }
  },

  // Verificar se as tabelas necessárias existem
  async checkTables() {
    SecureLogger.debug('[MIGRATION CHECK] Verificando tabelas...');
    
    const tables = ['portfolio_trabalhos', 'usuarios'];
    const results: { [key: string]: { success: boolean, error?: string } } = {};

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (error) {
          SecureLogger.warn(`[MIGRATION CHECK] Erro na tabela ${table}:`, error);
          results[table] = { success: false, error: error.message };
        } else {
          SecureLogger.debug(`[MIGRATION CHECK] Tabela ${table} acessível`);
          results[table] = { success: true };
        }
      } catch (error: any) {
        SecureLogger.error(`[MIGRATION CHECK] Erro inesperado na tabela ${table}:`, error);
        results[table] = { success: false, error: 'Erro inesperado' };
      }
    }

    return results;
  },

  // Executar verificação completa
  async runFullCheck() {
    SecureLogger.info('🚀 [MIGRATION CHECK] Iniciando verificação completa...');
    
    const results = {
      rls: await this.checkRLSPolicies(),
      storage: await this.checkStorageBucket(),
      tables: await this.checkTables()
    };

    SecureLogger.info('📊 [MIGRATION CHECK] Resultado completo:', results);

    // Verificar se há problemas críticos
    const criticalIssues = [];
    
    if (!results.rls.success) {
      criticalIssues.push('Políticas RLS não aplicadas ou falha na verificação');
    }
    
    if (!results.storage.success) {
      criticalIssues.push('Bucket de imagens não configurado ou falha na verificação');
    }

    const tablesWithIssues = Object.entries(results.tables)
      .filter(([_, result]) => !(result as any).success)
      .map(([table, _]) => table);

    if (tablesWithIssues.length > 0) {
      criticalIssues.push(`Tabelas com problemas: ${tablesWithIssues.join(', ')}`);
    }

    if (criticalIssues.length > 0) {
      console.warn('🚨 [MIGRATION CHECK] Problemas críticos encontrados:', criticalIssues);
      
      // Mostrar instruções para o usuário
      console.info('\n📋 [MIGRATION CHECK] INSTRUÇÕES PARA CORREÇÃO:');
      console.info('1. Acesse o Supabase Dashboard');
      console.info('2. Vá para SQL Editor');
      console.info('3. Execute as migrações em supabase/migrations/');
      console.info('4. Verifique se as políticas RLS foram criadas');
      console.info('5. Verifique se o bucket "imagens" foi criado');
      
      return { success: false, issues: criticalIssues, results };
    }

    SecureLogger.info('✅ [MIGRATION CHECK] Todas as verificações passaram!');
    return { success: true, results };
  }
};

// Tornar disponível globalmente para debug
(window as any).__checkMigrations = checkMigrations; 