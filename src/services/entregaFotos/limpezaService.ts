import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { ENTREGA_FOTOS_CONFIG } from './config';
import { ProcessResult, GaleriaAntiga, ImagemGaleria } from './types';

/**
 * Módulo responsável pela limpeza de arquivos antigos
 */
export class LimpezaService {
  /**
   * 🧹 Limpeza de arquivos antigos
   * Remove galerias e arquivos expirados há mais de 30 dias
   */
  static async limpezaArquivosAntigos(): Promise<ProcessResult> {
    const result: ProcessResult = {
      success: true,
      processedCount: 0,
      errors: [],
      details: []
    };

    try {
      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Iniciando limpeza de arquivos antigos`);

      const dataLimite = this.calcularDataLimite();
      const galeriasAntigas = await this.buscarGaleriasAntigas(dataLimite);

      if (!galeriasAntigas || galeriasAntigas.length === 0) {
        result.details.push('Nenhuma galeria antiga encontrada para limpeza');
        return result;
      }

      // Processar cada galeria antiga
      for (const galeria of galeriasAntigas) {
        try {
          await this.processarGaleriaAntiga(galeria);
          result.processedCount++;
          result.details.push(`Galeria "${galeria.titulo}" removida (${galeria.total_fotos} imagens)`);
        } catch (error) {
          result.errors.push(`Erro ao processar galeria ${galeria.titulo}: ${error}`);
        }
      }

      logger.info(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Limpeza concluída: ${result.processedCount} galerias removidas`);

    } catch (error) {
      result.success = false;
      result.errors.push(`Erro geral na limpeza de arquivos: ${error}`);
      logger.error(`${ENTREGA_FOTOS_CONFIG.LOG_PREFIX} Erro na limpeza de arquivos:`, error);
    }

    return result;
  }

  /**
   * Calcula a data limite para limpeza (30 dias atrás)
   */
  private static calcularDataLimite(): Date {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - ENTREGA_FOTOS_CONFIG.DIAS_PARA_LIMPEZA);
    return dataLimite;
  }

  /**
   * Busca galerias antigas que devem ser removidas
   */
  private static async buscarGaleriasAntigas(dataLimite: Date): Promise<GaleriaAntiga[]> {
    const { data: galeriasAntigas, error } = await supabase
      .from('galeria')
      .select('galeria_grupo_id, titulo, total_fotos')
      .lt('data_expiracao', dataLimite.toISOString())
      .eq('status', ENTREGA_FOTOS_CONFIG.STATUS.EXPIRADA)
      .order('titulo')
      .limit(ENTREGA_FOTOS_CONFIG.LIMITE_GALERIAS_LIMPEZA);

    if (error) {
      throw new Error(`Erro ao buscar galerias antigas: ${error.message}`);
    }

    return galeriasAntigas || [];
  }

  /**
   * Processa uma galeria antiga removendo arquivos e registros
   */
  private static async processarGaleriaAntiga(galeria: GaleriaAntiga): Promise<void> {
    // Buscar todas as imagens da galeria
    const imagens = await this.buscarImagensGaleria(galeria.galeria_grupo_id);
    
    // Remover arquivos do storage
    if (imagens && imagens.length > 0) {
      await this.removerArquivosStorage(imagens, galeria.titulo);
    }

    // Remover registros do banco
    await this.removerRegistrosBanco(galeria.galeria_grupo_id, galeria.titulo);
  }

  /**
   * Busca todas as imagens de uma galeria
   */
  private static async buscarImagensGaleria(galeriaGrupoId: string): Promise<ImagemGaleria[]> {
    const { data: imagens, error: imagensError } = await supabase
      .from('entregar_imagens')
      .select('url_imagem, nome_arquivo')
      .eq('galeria_grupo_id', galeriaGrupoId);

    if (imagensError) {
      throw new Error(`Erro ao buscar imagens: ${imagensError.message}`);
    }

    return imagens || [];
  }

  /**
   * Remove arquivos do storage
   */
  private static async removerArquivosStorage(imagens: ImagemGaleria[], tituloGaleria: string): Promise<void> {
    const caminhos = imagens.map(img => {
      // Extrair caminho do storage da URL
      const url = new URL(img.url_imagem);
      const pathParts = url.pathname.split('/');
      return pathParts.slice(-2).join('/'); // Pega user_id/nome_arquivo
    });

    const { error: storageError } = await supabase.storage
      .from(ENTREGA_FOTOS_CONFIG.STORAGE_BUCKET)
      .remove(caminhos);

    if (storageError) {
      throw new Error(`Erro ao remover arquivos: ${storageError.message}`);
    }
  }

  /**
   * Remove registros do banco de dados
   */
  private static async removerRegistrosBanco(galeriaGrupoId: string, tituloGaleria: string): Promise<void> {
    const { error: deleteError } = await supabase
      .from('entregar_imagens')
      .delete()
      .eq('galeria_grupo_id', galeriaGrupoId);

    if (deleteError) {
      throw new Error(`Erro ao remover registros: ${deleteError.message}`);
    }
  }
}