import { logger } from '@/utils/logger';
import { ENTREGA_FOTOS_CONFIG } from '@/services/entregaFotos/config';
import { ProcessResult, GaleriaStats } from '@/services/entregaFotos/types';
import { ExpiracaoService } from '@/services/entregaFotos/expiracaoService';
import { LimpezaService } from '@/services/entregaFotos/limpezaService';
import { AcessoService } from '@/services/entregaFotos/acessoService';
import { RLSService } from '@/services/entregaFotos/rlsService';
import { BackupService, EstatisticasService } from '@/services/entregaFotos/backupService';

/**
 * 🤖 Serviço Automático de Entrega de Fotos
 * 
 * Responsável por:
 * - ⏰ Verificar e marcar galerias expiradas
 * - 🗑️ Limpar arquivos antigos (30+ dias)
 * - 📊 Registrar acessos às galerias
 * - 🔒 Aplicar políticas RLS
 * - 💾 Backup de segurança
 * - 📈 Estatísticas das galerias
 */
export class EntregaFotosAutomaticService {
  private static instance: EntregaFotosAutomaticService;
  private isProcessing = false;

  private constructor() {}

  static getInstance(): EntregaFotosAutomaticService {
    if (!EntregaFotosAutomaticService.instance) {
      EntregaFotosAutomaticService.instance = new EntregaFotosAutomaticService();
    }
    return EntregaFotosAutomaticService.instance;
  }

  /**
   * ⏰ Verificar e marcar galerias expiradas
   */
  async verificarExpiracao(): Promise<ProcessResult> {
    return ExpiracaoService.verificarExpiracao();
  }

  /**
   * 🗑️ Limpeza de arquivos antigos
   * Remove galerias e arquivos expirados há mais de 30 dias
   */
  async limpezaArquivosAntigos(): Promise<ProcessResult> {
    return LimpezaService.limpezaArquivosAntigos();
  }

  /**
   * 📊 Registrar acesso à galeria
   */
  async registrarAcesso(slug: string, ip?: string): Promise<boolean> {
    return AcessoService.registrarAcesso(slug, ip);
  }

  /**
   * 🔒 Aplicar políticas RLS
   */
  async aplicarPoliticasRLS(): Promise<ProcessResult> {
    return RLSService.aplicarPoliticasRLS();
  }

  /**
   * 💾 Backup de segurança
   */
  async backupSeguranca(): Promise<ProcessResult> {
    return BackupService.backupSeguranca();
  }

  /**
   * 📈 Obter estatísticas das galerias
   */
  async obterEstatisticas(): Promise<GaleriaStats[]> {
    return EstatisticasService.obterEstatisticas();
  }

  /**
   * 🚀 Executar todos os processos automáticos
   */
  async executarProcessosAutomaticos(): Promise<{
    verificacaoExpiracao: ProcessResult;
    limpezaArquivos: ProcessResult;
    politicasRLS: ProcessResult;
    backup: ProcessResult;
    resumo: {
      totalProcessado: number;
      totalErros: number;
      sucesso: boolean;
    };
  }> {
    if (this.isProcessing) {
      throw new Error('Processo automático já está em execução');
    }

    this.isProcessing = true;

    try {
      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Iniciando execução de processos automáticos`);

      const verificacaoExpiracao = await this.verificarExpiracao();
      const limpezaArquivos = await this.limpezaArquivosAntigos();
      const politicasRLS = await this.aplicarPoliticasRLS();
      const backup = await this.backupSeguranca();

      const totalProcessado = 
        verificacaoExpiracao.processedCount +
        limpezaArquivos.processedCount +
        politicasRLS.processedCount +
        backup.processedCount;

      const totalErros = 
        verificacaoExpiracao.errors.length +
        limpezaArquivos.errors.length +
        politicasRLS.errors.length +
        backup.errors.length;

      const sucesso = totalErros === 0;

      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Processos automáticos concluídos: ${totalProcessado} processados, ${totalErros} erros`);

      return {
        verificacaoExpiracao,
        limpezaArquivos,
        politicasRLS,
        backup,
        resumo: {
          totalProcessado,
          totalErros,
          sucesso
        }
      };

    } finally {
      this.isProcessing = false;
    }
  }
}

// Exportar instância singleton
export const entregaFotosAutomaticService = EntregaFotosAutomaticService.getInstance();