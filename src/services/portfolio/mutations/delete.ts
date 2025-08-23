import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { buscarTrabalhoPorId } from '../queries';
// N8N REMOVIDO - Sistema usa Amazon S3

// Excluir um trabalho
export const excluirTrabalhoPortfolio = async (trabalhoId: string, userId: string): Promise<void> => {
  try {
    logger.info(`[excluirTrabalhoPortfolio] Iniciando exclusão do trabalho ${trabalhoId}`);
    
    // Primeiro buscar dados do trabalho para enviar para N8N
    let tituloTrabalho = '';
    try {
      const trabalho = await buscarTrabalhoPorId(trabalhoId, userId);
      tituloTrabalho = trabalho?.titulo || 'Trabalho excluído';
    } catch (error) {
      logger.warn('[excluirTrabalhoPortfolio] Não foi possível buscar título do trabalho:', error);
    }
    
    const { error } = await supabase
      .from('portfolio_trabalhos')
      .delete()
      .eq('id', trabalhoId)
      .eq('user_id', userId);

    if (error) {
      logger.error(`[excluirTrabalhoPortfolio] Erro ao excluir trabalho do banco:`, error);
      throw new Error(`Erro ao excluir trabalho: ${error.message}`);
    }
    
    logger.info(`[excluirTrabalhoPortfolio] Trabalho ${trabalhoId} excluído com sucesso`);

    // Sistema agora usa Amazon S3 - exclusão automática via lifecycle
    // Log removido para produção - trabalho excluído
    
    /* CÓDIGO ORIGINAL N8N COMENTADO
    
    // Enviar dados para N8N (não bloqueia se falhar)
    try {
      await enviarExclusaoPortfolioParaN8N(trabalhoId, tituloTrabalho);
    } catch (error) {
      logger.warn('[excluirTrabalhoPortfolio] Falha ao enviar exclusão para N8N (não afeta operação local):', error);
    }
    
    */
  } catch (error) {
    logger.error(`[excluirTrabalhoPortfolio] Erro geral na exclusão:`, error);
    throw error;
  }
};

/**
 * Remove uma lista de imagens do Supabase Storage.
 * @param urls - Um array de URLs completas das imagens a serem removidas.
 */
export const removerImagensDoStorage = async (urls: string[]): Promise<void> => {
  if (!urls || urls.length === 0) {
    logger.info('[removerImagensDoStorage] Nenhuma URL fornecida para remoção.');
    return;
  }

  try {
    // Extrai o caminho do arquivo a partir da URL completa
    const caminhos = urls.map(url => {
      const parts = url.split('/imagens/');
      return parts[1] || '';
    }).filter(caminho => caminho);

    if (caminhos.length === 0) {
      logger.warn('[removerImagensDoStorage] Nenhuma caminho válido foi extraído das URLs fornecidas.');
      return;
    }

    logger.info(`[removerImagensDoStorage] Removendo ${caminhos.length} imagens do storage...`, { caminhos });

    const { data, error } = await supabase.storage
      .from('imagens')
      .remove(caminhos);

    if (error) {
      logger.error('[removerImagensDoStorage] Erro ao remover imagens:', error);
      throw new Error(`Erro ao remover imagens do storage: ${error.message}`);
    }

    logger.info('[removerImagensDoStorage] Imagens removidas com sucesso:', data);
  } catch (error) {
    logger.error('[removerImagensDoStorage] Erro geral na remoção de imagens:', error);
    throw error;
  }
};
