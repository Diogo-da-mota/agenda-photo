import { supabase } from '@/lib/supabase';
import { SecureLogger } from './SecureLogger';

// Utilitário para diagnosticar problemas de RLS
export const diagnosticRLS = {
  // Verificar se o usuário está autenticado
  async checkAuth() {
    SecureLogger.debug('[RLS DIAGNOSTIC] Verificando autenticação...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        SecureLogger.error('[RLS DIAGNOSTIC] Erro ao obter sessão:', error);
        return { success: false, error: error.message };
      }

      if (!session?.user) {
        SecureLogger.warn('[RLS DIAGNOSTIC] Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      SecureLogger.debug('[RLS DIAGNOSTIC] Usuário autenticado:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      });

      return { success: true, user: session.user };
    } catch (error: any) {
      SecureLogger.error('[RLS DIAGNOSTIC] Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado na verificação de autenticação' };
    }
  },

  // Verificar se a tabela usuarios existe e tem dados
  async checkUsuariosTable() {
    SecureLogger.debug('[RLS DIAGNOSTIC] Verificando tabela usuarios...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Tentar buscar o usuário na tabela usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, papel, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        SecureLogger.error('[RLS DIAGNOSTIC] Erro ao buscar na tabela usuarios:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        SecureLogger.warn('[RLS DIAGNOSTIC] Usuário não encontrado na tabela usuarios');
        return { success: false, error: 'Usuário não encontrado na tabela usuarios' };
      }

      SecureLogger.debug('[RLS DIAGNOSTIC] Usuário encontrado na tabela usuarios:', data);
      return { success: true, userData: data };
    } catch (error: any) {
      SecureLogger.error('[RLS DIAGNOSTIC] Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado na verificação da tabela usuarios' };
    }
  },

  // Verificar políticas RLS da tabela portfolio_trabalhos
  async checkPortfolioRLS() {
    SecureLogger.debug('[RLS DIAGNOSTIC] Verificando RLS portfolio_trabalhos...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Tentar fazer uma query simples na tabela portfolio_trabalhos
      const { data, error, count } = await supabase
        .from('portfolio_trabalhos')
        .select('id, titulo, user_id', { count: 'exact' })
        .limit(1);

      if (error) {
        SecureLogger.error('[RLS DIAGNOSTIC] Erro RLS portfolio_trabalhos:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.debug('[RLS DIAGNOSTIC] RLS portfolio_trabalhos funcionando:', {
        totalItems: count,
        sampleData: data
      });

      return { success: true, count, data };
    } catch (error: any) {
      SecureLogger.error('[RLS DIAGNOSTIC] Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado na verificação RLS' };
    }
  },

  // Verificar políticas de Storage
  async checkStorageRLS() {
    SecureLogger.debug('[RLS DIAGNOSTIC] Verificando RLS Storage...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Tentar listar arquivos no bucket imagens
      const { data, error } = await supabase.storage
        .from('imagens')
        .list('', { limit: 5 });

      if (error) {
        SecureLogger.error('[RLS DIAGNOSTIC] Erro RLS Storage:', error);
        return { success: false, error: error.message };
      }

      SecureLogger.debug('[RLS DIAGNOSTIC] RLS Storage funcionando:', {
        filesCount: data?.length || 0,
        sampleFiles: data?.slice(0, 3)
      });

      return { success: true, files: data };
    } catch (error: any) {
      SecureLogger.error('[RLS DIAGNOSTIC] Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado na verificação Storage' };
    }
  },

  // Executar diagnóstico completo
  async runFullDiagnostic() {
    SecureLogger.info('🚀 [RLS DIAGNOSTIC] Iniciando diagnóstico completo...');
    
    const results = {
      auth: await this.checkAuth(),
      usuarios: await this.checkUsuariosTable(),
      portfolio: await this.checkPortfolioRLS(),
      storage: await this.checkStorageRLS()
    };

    SecureLogger.info('📊 [RLS DIAGNOSTIC] Resultado completo:', results);

    const allSuccessful = Object.values(results).every(result => result.success);
    
    if (allSuccessful) {
      SecureLogger.info('✅ [RLS DIAGNOSTIC] Todos os testes passaram!');
    } else {
      SecureLogger.warn('⚠️ [RLS DIAGNOSTIC] Alguns testes falharam - verifique os logs acima');
    }

    return results;
  }
};

// Tornar disponível globalmente para debug
(window as any).__diagnosticRLS = diagnosticRLS; 