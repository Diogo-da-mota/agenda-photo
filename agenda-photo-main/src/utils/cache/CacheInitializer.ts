/**
 * Inicializador de cache IndexedDB
 * Configura o sistema de cache offline sem alterar funcionalidades existentes
 */

import { indexedDBManager } from './IndexedDBManager';
import { offlineCacheStrategy } from './OfflineCacheStrategy';

export interface CacheInitConfig {
  enableLogging?: boolean;
  cleanupInterval?: number; // Intervalo em milissegundos para limpeza automática
  maxCacheAge?: number; // Idade máxima do cache em milissegundos
}

class CacheInitializer {
  private config: CacheInitConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(config: CacheInitConfig = {}) {
    this.config = {
      enableLogging: true,
      cleanupInterval: 30 * 60 * 1000, // 30 minutos
      maxCacheAge: 24 * 60 * 60 * 1000, // 24 horas
      ...config
    };
  }

  /**
   * Inicializar sistema de cache
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.log('Cache já inicializado');
      return;
    }

    try {
      this.log('Inicializando sistema de cache IndexedDB...');

      // Aguardar IndexedDB estar pronto
      await indexedDBManager.waitForReady();
      this.log('✅ IndexedDB pronto');

      // Configurar limpeza automática
      this.setupAutomaticCleanup();
      this.log('✅ Limpeza automática configurada');

      // Limpar cache expirado inicial
      const expiredCount = await this.cleanExpiredData();
      this.log(`✅ Removidos ${expiredCount} itens expirados`);

      // Obter estatísticas iniciais
      const stats = await offlineCacheStrategy.getCacheStats();
      this.log('📊 Estatísticas do cache:', stats);

      this.isInitialized = true;
      this.log('🚀 Sistema de cache inicializado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao inicializar cache:', error);
      throw error;
    }
  }

  /**
   * Configurar limpeza automática
   */
  private setupAutomaticCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(async () => {
      try {
        const cleanedCount = await this.cleanExpiredData();
        if (cleanedCount > 0) {
          this.log(`🧹 Limpeza automática: ${cleanedCount} itens removidos`);
        }
      } catch (error) {
        console.error('Erro na limpeza automática:', error);
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Limpar dados expirados
   */
  async cleanExpiredData(): Promise<number> {
    return await offlineCacheStrategy.cleanExpiredCache();
  }

  /**
   * Pré-popular cache com dados essenciais
   */
  async prepopulateCache(userId: string): Promise<void> {
    if (!userId) return;

    this.log(`📋 Pré-populando cache para usuário: ${userId}`);

    try {
      // Aqui você pode adicionar lógica para pré-popular
      // o cache com dados essenciais do usuário
      
      // Exemplo: dados de configuração do usuário
      const userConfig = await this.fetchUserConfig(userId);
      if (userConfig) {
        await indexedDBManager.setItem(
          'usuarios_config',
          `config_${userId}`,
          userConfig,
          this.config.maxCacheAge,
          userId
        );
      }

      this.log('✅ Cache pré-populado com sucesso');
    } catch (error) {
      this.log('⚠️ Erro ao pré-popular cache:', error);
    }
  }

  /**
   * Obter configuração do usuário (exemplo)
   */
  private async fetchUserConfig(userId: string): Promise<any> {
    // Esta função seria implementada para buscar
    // configurações específicas do usuário
    return null;
  }

  /**
   * Obter estatísticas detalhadas do cache
   */
  async getDetailedStats(): Promise<{
    indexedDB: any;
    offlineStrategy: any;
    performance: {
      initTime: number;
      isInitialized: boolean;
      cleanupInterval: number;
    };
  }> {
    const indexedDBStats = await indexedDBManager.getCacheSize();
    const offlineStats = await offlineCacheStrategy.getCacheStats();

    return {
      indexedDB: indexedDBStats,
      offlineStrategy: offlineStats,
      performance: {
        initTime: Date.now(),
        isInitialized: this.isInitialized,
        cleanupInterval: this.config.cleanupInterval || 0
      }
    };
  }

  /**
   * Resetar todo o cache
   */
  async resetCache(): Promise<void> {
    this.log('🔄 Resetando todo o cache...');
    
    const stores = [
      'financeiro_transacoes',
      'financeiro_categorias',
      'agenda_eventos',
      'clientes',
      'portfolio_trabalhos',
      'usuarios_config'
    ];

    for (const store of stores) {
      await indexedDBManager.clearStore(store);
    }

    this.log('✅ Cache resetado com sucesso');
  }

  /**
   * Verificar integridade do cache
   */
  async checkCacheIntegrity(): Promise<{
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Verificar se IndexedDB está funcionando
      await indexedDBManager.waitForReady();
      
      // Verificar tamanhos dos stores
      const sizes = await indexedDBManager.getCacheSize();
      
      // Verificar se há stores muito grandes
      Object.entries(sizes).forEach(([storeName, size]) => {
        if (size > 10000) {
          issues.push(`Store ${storeName} tem ${size} itens (pode estar muito grande)`);
          recommendations.push(`Considere limpar dados antigos do store ${storeName}`);
        }
      });

      // Verificar conectividade
      if (!offlineCacheStrategy.isNetworkOnline()) {
        issues.push('Aplicação está offline');
        recommendations.push('Verificar conexão de internet');
      }

    } catch (error) {
      issues.push(`Erro ao verificar cache: ${error}`);
      recommendations.push('Reinicializar sistema de cache');
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Finalizar sistema de cache
   */
  async shutdown(): Promise<void> {
    this.log('🔻 Finalizando sistema de cache...');

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    // Fechar conexão IndexedDB
    indexedDBManager.close();

    this.isInitialized = false;
    this.log('✅ Sistema de cache finalizado');
  }

  /**
   * Log com controle de visibilidade
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[CacheInit] ${message}`, ...args);
    }
  }

  /**
   * Verificar se está inicializado
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Instância singleton
export const cacheInitializer = new CacheInitializer();

/**
 * Hook para usar inicializador de cache
 */
export function useCacheInitializer() {
  return {
    initialize: cacheInitializer.initialize.bind(cacheInitializer),
    prepopulateCache: cacheInitializer.prepopulateCache.bind(cacheInitializer),
    getDetailedStats: cacheInitializer.getDetailedStats.bind(cacheInitializer),
    resetCache: cacheInitializer.resetCache.bind(cacheInitializer),
    checkCacheIntegrity: cacheInitializer.checkCacheIntegrity.bind(cacheInitializer),
    cleanExpiredData: cacheInitializer.cleanExpiredData.bind(cacheInitializer),
    shutdown: cacheInitializer.shutdown.bind(cacheInitializer),
    initialized: cacheInitializer.initialized
  };
}

/**
 * Inicializar cache automaticamente
 */
export async function initializeCache(config?: CacheInitConfig): Promise<void> {
  const initializer = new CacheInitializer(config);
  await initializer.initialize();
}

export default CacheInitializer; 