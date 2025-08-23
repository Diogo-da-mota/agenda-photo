import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { ENTREGA_FOTOS_CONFIG } from './config';
import { ProcessResult, GaleriaExpirada } from './types';

/**
 * Módulo responsável pela verificação e marcação de galerias expiradas
 */
export class ExpiracaoService {
  /**
   * 🔄 Verificação de expiração
   * Verifica e marca galerias expiradas usando a view galerias_agrupadas
   */
  static async verificarExpiracao(): Promise<ProcessResult> {
    const result: ProcessResult = {
      success: true,
      processedCount: 0,
      errors: [],
      details: []
    };

    try {
      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Iniciando verificação de expiração`);

      const agora = new Date().toISOString();

      // ✅ CORREÇÃO: Usar a view galeria para evitar duplicatas
      const { data: galeriasExpiradas, error } = await supabase
        .from('galeria')
        .select('galeria_grupo_id, titulo, data_expiracao')
        .lt('data_expiracao', agora)
        .neq('status', ENTREGA_FOTOS_CONFIG.STATUS.EXPIRADA)
        .order('titulo')
        .limit(ENTREGA_FOTOS_CONFIG.LIMITE_GALERIAS_EXPIRACAO);

      if (error) {
        result.success = false;
        result.errors.push(`Erro ao buscar galerias expiradas: ${error.message}`);
        return result;
      }

      if (!galeriasExpiradas || galeriasExpiradas.length === 0) {
        result.details.push('Nenhuma galeria expirada encontrada');
        return result;
      }

      // Atualizar status das galerias expiradas
      for (const galeria of galeriasExpiradas) {
        try {
          await this.marcarGaleriaComoExpirada(galeria);
          result.processedCount++;
          result.details.push(`Galeria "${galeria.titulo}" marcada como expirada`);
        } catch (error) {
          result.errors.push(`Erro ao processar galeria ${galeria.titulo}: ${error}`);
        }
      }

      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Verificação de expiração concluída: ${result.processedCount} galerias processadas`);

    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral na verificação de expiração: ${error}`);
      logger.error(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Erro na verificação de expiração:`, error);
    }

    return result;
  }

  /**
   * Marca uma galeria específica como expirada
   */
  private static async marcarGaleriaComoExpirada(galeria: GaleriaExpirada): Promise<void> {
    const { error: updateError } = await supabase
      .from('entregar_imagens')
      .update({ 
        status: ENTREGA_FOTOS_CONFIG.STATUS.EXPIRADA,
        atualizado_em: new Date().toISOString()
      })
      .eq('galeria_grupo_id', galeria.galeria_grupo_id);

    if (updateError) {
      throw new Error(`Erro ao atualizar galeria ${galeria.titulo}: ${updateError.message}`);
    }
  }
}