/**
 * 📊 MONITORAMENTO DE PERFORMANCE - PORTFOLIO TRABALHOS
 * 
 * Utilitário para detectar e prevenir timeouts nas operações UPDATE
 * Monitora tempo de execução e identifica queries lentas
 */

import { logger } from '@/utils/logger';

export interface PerformanceMetrics {
  operacao: string;
  tempo_execucao: number;
  portfolio_id: string;
  user_id?: string;
  timestamp: string;
  status: 'sucesso' | 'timeout' | 'erro';
  detalhes?: any;
}

export interface MonitoringThresholds {
  WARNING_THRESHOLD: number;    // ms - Alerta se operação > que este valor
  CRITICAL_THRESHOLD: number;   // ms - Crítico se operação > que este valor
  TIMEOUT_THRESHOLD: number;    // ms - Máximo antes de considerar timeout
}

// 🎯 CONFIGURAÇÕES DE MONITORAMENTO
const DEFAULT_THRESHOLDS: MonitoringThresholds = {
  WARNING_THRESHOLD: 3000,      // 3 segundos
  CRITICAL_THRESHOLD: 8000,     // 8 segundos
  TIMEOUT_THRESHOLD: 15000      // 15 segundos
};

class PortfolioPerformanceMonitor {
  private metricas: PerformanceMetrics[] = [];
  private thresholds: MonitoringThresholds;

  constructor(customThresholds?: Partial<MonitoringThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
  }

  /**
   * 🔍 MONITORAR OPERAÇÃO COM TIMEOUT DETECTION
   */
  async monitorarOperacao<T>(
    operacao: string,
    portfolioId: string,
    operation: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();
    
    try {
      logger.info(`[PortfolioMonitor] 🚀 Iniciando ${operacao}:`, { 
        portfolio_id: portfolioId,
        user_id: userId 
      });

      // Executar operação
      const resultado = await operation();
      
      const tempoExecucao = performance.now() - startTime;
      
      // Registrar métrica de sucesso
      this.registrarMetrica({
        operacao,
        tempo_execucao: tempoExecucao,
        portfolio_id: portfolioId,
        user_id: userId,
        timestamp,
        status: 'sucesso'
      });

      // Analisar performance
      this.analisarPerformance(operacao, tempoExecucao, portfolioId);
      
      return resultado;

    } catch (error: any) {
      const tempoExecucao = performance.now() - startTime;
      
      // Detectar tipo de erro
      const isTimeout = error.message?.includes('timeout') || 
                       error.message?.includes('57014') ||
                       error.code === '57014';
      
      const status = isTimeout ? 'timeout' : 'erro';
      
      // Registrar métrica de erro
      this.registrarMetrica({
        operacao,
        tempo_execucao: tempoExecucao,
        portfolio_id: portfolioId,
        user_id: userId,
        timestamp,
        status,
        detalhes: {
          erro: error.message,
          code: error.code
        }
      });

      logger.error(`[PortfolioMonitor] ❌ ${operacao} falhou:`, {
        portfolio_id: portfolioId,
        tempo_execucao: tempoExecucao,
        erro: error.message,
        is_timeout: isTimeout
      });

      throw error;
    }
  }

  /**
   * 📝 REGISTRAR MÉTRICA
   */
  private registrarMetrica(metrica: PerformanceMetrics): void {
    this.metricas.push(metrica);
    
    // Manter apenas últimas 100 métricas para evitar memory leak
    if (this.metricas.length > 100) {
      this.metricas = this.metricas.slice(-100);
    }
  }

  /**
   * 🚨 ANALISAR PERFORMANCE E GERAR ALERTAS
   */
  private analisarPerformance(operacao: string, tempo: number, portfolioId: string): void {
    if (tempo > this.thresholds.CRITICAL_THRESHOLD) {
      logger.error(`[PortfolioMonitor] 🔴 CRÍTICO: ${operacao} muito lenta`, {
        tempo_execucao: tempo,
        threshold_critical: this.thresholds.CRITICAL_THRESHOLD,
        portfolio_id: portfolioId,
        recomendacao: 'Verificar índices do banco de dados'
      });
    } else if (tempo > this.thresholds.WARNING_THRESHOLD) {
      logger.warn(`[PortfolioMonitor] 🟡 ATENÇÃO: ${operacao} lenta`, {
        tempo_execucao: tempo,
        threshold_warning: this.thresholds.WARNING_THRESHOLD,
        portfolio_id: portfolioId
      });
    } else {
      logger.info(`[PortfolioMonitor] ✅ ${operacao} rápida:`, {
        tempo_execucao: tempo,
        portfolio_id: portfolioId
      });
    }
  }

  /**
   * 📊 OBTER RELATÓRIO DE PERFORMANCE
   */
  obterRelatorio(): {
    total_operacoes: number;
    sucessos: number;
    timeouts: number;
    erros: number;
    tempo_medio: number;
    operacao_mais_lenta: PerformanceMetrics | null;
    ultimas_metricas: PerformanceMetrics[];
  } {
    const total = this.metricas.length;
    const sucessos = this.metricas.filter(m => m.status === 'sucesso').length;
    const timeouts = this.metricas.filter(m => m.status === 'timeout').length;
    const erros = this.metricas.filter(m => m.status === 'erro').length;
    
    const tempos = this.metricas.map(m => m.tempo_execucao);
    const tempoMedio = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0;
    
    const operacaoMaisLenta = this.metricas.length > 0 
      ? this.metricas.reduce((prev, current) => 
          prev.tempo_execucao > current.tempo_execucao ? prev : current
        )
      : null;

    return {
      total_operacoes: total,
      sucessos,
      timeouts,
      erros,
      tempo_medio: Number(tempoMedio.toFixed(2)),
      operacao_mais_lenta: operacaoMaisLenta,
      ultimas_metricas: this.metricas.slice(-10) // Últimas 10 operações
    };
  }

  /**
   * 🧹 LIMPAR MÉTRICAS ANTIGAS
   */
  limparMetricas(): void {
    this.metricas = [];
    logger.info('[PortfolioMonitor] Métricas limpas');
  }
}

// 🎯 INSTÂNCIA SINGLETON PARA USO GLOBAL
export const portfolioMonitor = new PortfolioPerformanceMonitor();

/**
 * 🚀 WRAPPER PARA OPERAÇÕES DE PORTFOLIO COM MONITORAMENTO
 */
export const monitorarOperacaoPortfolio = <T>(
  operacao: string,
  portfolioId: string,
  operation: () => Promise<T>,
  userId?: string
): Promise<T> => {
  return portfolioMonitor.monitorarOperacao(operacao, portfolioId, operation, userId);
};

/**
 * 📊 OBTER RELATÓRIO DE PERFORMANCE ATUAL
 */
export const obterRelatorioPerformance = () => {
  return portfolioMonitor.obterRelatorio();
};

/**
 * 🧹 LIMPAR MÉTRICAS PARA DEBUGGING
 */
export const limparMetricasPortfolio = () => {
  portfolioMonitor.limparMetricas();
}; 