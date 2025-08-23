import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { ENTREGA_FOTOS_CONFIG } from './config';
import { ProcessResult, GaleriaStats } from './types';

/**
 * Módulo responsável pelo backup de segurança das galerias
 */
export class BackupService {
  /**
   * 💾 Backup de segurança
   * Cria backup das galerias ativas
   */
  static async backupSeguranca(): Promise<ProcessResult> {
    const result: ProcessResult = {
      success: true,
      processedCount: 0,
      errors: [],
      details: []
    };

    try {
      // Log removido para produção - backup desabilitado temporariamente
      result.details.push('Backup desabilitado temporariamente para evitar erros de tabelas não existentes');
      return result;

      // TODO: Reabilitar quando as tabelas de backup estiverem configuradas
      /*
      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Iniciando backup de segurança`);

      const galeriasAtivas = await this.buscarGaleriasAtivas();
      
      if (!galeriasAtivas || galeriasAtivas.length === 0) {
        result.details.push('Nenhuma galeria ativa encontrada para backup');
        return result;
      }

      await this.processarBackupGalerias(galeriasAtivas, result);

      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Backup concluído: ${result.processedCount} galerias processadas`);
      */

    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral no backup: ${error}`);
      logger.error(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Erro no backup:`, error);
    }

    return result;
  }

  /**
   * Busca galerias ativas para backup
   */
  private static async buscarGaleriasAtivas() {
    const { data: galeriasAtivas, error } = await supabase
      .from('galeria')
      .select('*')
      .eq('status', ENTREGA_FOTOS_CONFIG.STATUS.ATIVA)
      .order('criado_em', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Erro ao buscar galerias para backup: ${error.message}`);
    }

    return galeriasAtivas;
  }

  /**
   * Processa backup das galerias
   */
  private static async processarBackupGalerias(galerias: unknown[], result: ProcessResult): Promise<void> {
    for (const galeria of galerias) {
      try {
        const imagens = await this.buscarImagensGaleria(galeria.galeria_grupo_id);
        await this.criarBackupGaleria(galeria, imagens);
        
        result.processedCount++;
        result.details.push(`Backup criado para galeria "${galeria.titulo}"`);

      } catch (error) {
        result.errors.push(`Erro ao processar backup da galeria ${galeria.titulo}: ${error}`);
      }
    }
  }

  /**
   * Busca imagens de uma galeria
   */
  private static async buscarImagensGaleria(galeriaGrupoId: string) {
    const { data: imagens, error: imagensError } = await supabase
      .from('entregar_imagens')
      .select('*')
      .eq('galeria_grupo_id', galeriaGrupoId);

    if (imagensError) {
      throw new Error(`Erro ao buscar imagens: ${imagensError.message}`);
    }

    return imagens || [];
  }

  /**
   * Cria backup de uma galeria
   */
  private static async criarBackupGaleria(galeria: unknown, imagens: unknown[]): Promise<void> {
    const { error: backupError } = await supabase
      .from('sistema_backups')
      .insert({
        tipo: 'entregar_imagens',
        dados: {
          galeria: galeria,
          imagens: imagens,
          data_backup: new Date().toISOString()
        },
        status: 'concluido',
        user_id: galeria.user_id
      });

    if (backupError) {
      throw new Error(`Erro ao criar backup: ${backupError.message}`);
    }
  }
}

/**
 * Módulo responsável pelas estatísticas das galerias
 */
export class EstatisticasService {
  /**
   * 📈 Obter estatísticas das galerias
   */
  static async obterEstatisticas(): Promise<GaleriaStats[]> {
    try {
      // Log removido para produção - obtendo estatísticas das galerias

      const { data: estatisticas, error } = await supabase
        .from('galeria')
        .select(`
          galeria_grupo_id,
          slug,
          titulo,
          data_expiracao,
          total_acessos,
          ultimo_acesso,
          status,
          criado_em,
          total_fotos
        `)
        .order('total_acessos', { ascending: false })
        .limit(100);

      if (error) {
        // Log de erro removido para produção
        return [];
      }

      return estatisticas || [];

    } catch (error) {
      // Log de erro removido para produção
      return [];
    }
  }
}