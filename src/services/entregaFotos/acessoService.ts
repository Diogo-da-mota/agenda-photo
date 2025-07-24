import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { ENTREGA_FOTOS_CONFIG } from './config';
import { ProcessResult } from './types';

/**
 * Módulo responsável pelo registro de acessos às galerias
 */
export class AcessoService {
  /**
   * 📊 Registrar acesso à galeria
   * Atualiza contadores de acesso usando galeria_grupo_id
   */
  static async registrarAcesso(slug: string, ip?: string): Promise<boolean> {
    try {
      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Registrando acesso à galeria: ${slug}`);

      const agora = new Date().toISOString();
      const galeria = await this.buscarGaleriaPorSlug(slug);
      
      if (!galeria) {
        logger.error(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Galeria não encontrada: ${slug}`);
        return false;
      }

      await this.atualizarContadoresAcesso(galeria, agora);
      await this.registrarLogAcesso(galeria.galeria_grupo_id, slug, ip, agora);

      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Acesso registrado com sucesso: ${slug}`);
      return true;

    } catch (error) {
      logger.error(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Erro ao registrar acesso:`, error);
      return false;
    }
  }

  /**
   * Busca galeria pelo slug
   */
  private static async buscarGaleriaPorSlug(slug: string) {
    const { data: galeria, error: selectError } = await supabase
      .from('galeria')
      .select('galeria_grupo_id, total_acessos')
      .eq('slug', slug)
      .single();

    if (selectError) {
      throw new Error(`Erro ao buscar galeria: ${selectError.message}`);
    }

    return galeria;
  }

  /**
   * Atualiza contadores de acesso
   */
  private static async atualizarContadoresAcesso(galeria: { galeria_grupo_id: string; total_acessos: number }, agora: string): Promise<void> {
    const { error: updateError } = await supabase
      .from('entregar_imagens')
      .update({
        total_acessos: galeria.total_acessos + 1,
        ultimo_acesso: agora
      })
      .eq('galeria_grupo_id', galeria.galeria_grupo_id);

    if (updateError) {
      throw new Error(`Erro ao atualizar acesso: ${updateError.message}`);
    }
  }

  /**
   * Registra log de acesso no sistema de atividades
   */
  private static async registrarLogAcesso(galeriaGrupoId: string, slug: string, ip?: string, timestamp?: string): Promise<void> {
    try {
      await supabase
        .from('sistema_atividades')
        .insert({
          table_name: 'entregar_imagens',
          operation: 'acesso_galeria',
          record_id: galeriaGrupoId,
          new_data: {
            slug,
            ip,
            timestamp: timestamp || new Date().toISOString()
          }
        });
    } catch (error) {
      // Log de acesso é opcional, não deve quebrar o fluxo principal
      logger.warn(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Erro ao registrar log de acesso:`, error);
    }
  }
}