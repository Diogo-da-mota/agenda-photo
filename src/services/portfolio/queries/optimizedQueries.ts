import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { TrabalhoPortfolioResumo } from '../types';
import { converterParaResumo } from '../converters';

// Buscar trabalhos otimizado - apenas campos essenciais para listagem
export const buscarTrabalhosPortfolioOtimizado = async (
  userId: string, 
  page: number = 1, 
  limit: number = 12,
  searchTerm?: string
): Promise<{ trabalhos: TrabalhoPortfolioResumo[]; total: number }> => {
  try {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('portfolio_trabalhos')
      .select(`
        id,
        titulo,
        categoria,
        local,
        descricao,
        imagens,
        imagem_capa,
        criado_em,
        tags
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('criado_em', { ascending: false });

    if (searchTerm && searchTerm.trim()) {
      const CsearchTerm = searchTerm.trim();
      query = query.or(
        `titulo.ilike.%${searchTerm}%,` +
        `descricao.ilike.%${searchTerm}%,` +
        `local.ilike.%${searchTerm}%,` +
        `categoria.ilike.%${searchTerm}%`
      );
    }
      
    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      logger.error('Erro ao buscar trabalhos otimizado:', error);
      throw error;
    }

    return {
      trabalhos: (data || []).map(converterParaResumo),
      total: count || 0
    };
  } catch (error) {
    logger.error('Erro ao buscar trabalhos otimizado:', error);
    throw error;
  }
};
