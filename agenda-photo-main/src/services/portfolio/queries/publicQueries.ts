import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { TrabalhoPortfolio, TrabalhoPortfolioResumo } from '../types';
import { converterDoSupabase, converterParaResumo } from '../converters';

const COLUMNS_TO_SELECT =
  'id, user_id, titulo, categoria, local, descricao, tags, imagens, imagem_capa, criado_em, atualizado_em';

// Buscar trabalho público por ID
export const buscarTrabalhoPublicoPorId = async (trabalhoId: string): Promise<TrabalhoPortfolio | null> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select(COLUMNS_TO_SELECT)
      .eq('id', trabalhoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Erro ao buscar trabalho público por ID:', error);
      throw error;
    }

    return converterDoSupabase(data);
  } catch (error) {
    logger.error('Erro ao buscar trabalho público por ID:', error);
    throw error;
  }
};

// Buscar trabalho público por título (para galeria pública)
export const buscarTrabalhoPublicoPorTitulo = async (titulo: string): Promise<TrabalhoPortfolio | null> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select(COLUMNS_TO_SELECT)
      .ilike('titulo', titulo) // Usar ilike para ser case-insensitive
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum resultado encontrado, o que é um estado válido
        return null;
      }
      logger.error('Erro ao buscar trabalho público por título:', error);
      throw error;
    }

    return converterDoSupabase(data);
  } catch (error) {
    logger.error('Erro ao buscar trabalho público por título:', error);
    throw error;
  }
};

// Fallback para consulta simplificada em caso de timeout
export const buscarTrabalhosPublicosSimplificado = async (
  page: number = 1,
  limit: number = 12
): Promise<{ trabalhos: TrabalhoPortfolioResumo[]; total: number }> => {
  const offset = (page - 1) * limit;
  
  try {
    // Consulta com campos reduzidos
    const { data, error, count } = await supabase
      .from('portfolio_trabalhos')
      .select(`
        id,
        titulo,
        categoria,
        local,
        imagem_capa,
        criado_em
      `, { count: 'exact' })
      .order('criado_em', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Erro em consulta simplificada:', error);
      throw error;
    }

    // Converter para formato resumido com valores padrão
    const trabalhos: TrabalhoPortfolioResumo[] = (data || []).map(item => ({
      id: item.id,
      titulo: item.titulo,
      categoria: item.categoria || 'Sem categoria',
      local: item.local || '',
      descricao: '',
      imagem_principal: item.imagem_capa,
      criado_em: item.criado_em,
      tags_preview: []
    }));

    return {
      trabalhos,
      total: count || 0
    };
  } catch (error) {
    logger.error('Erro em consulta simplificada:', error);
    
    // Fallback extremo para caso de erro persistente
    const estimatedTotal = 10; // Valor arbitrário para tentar continuar a paginação
    return {
      trabalhos: [],
      total: estimatedTotal
    };
  }
};

// Buscar trabalhos públicos otimizado - para visitantes não autenticados
export const buscarTrabalhosPortfolioPublicos = async (
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
      `, { 
        count: 'exact',
        head: false
      })
      .order('criado_em', { ascending: false })
      .order('id', { ascending: true });

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
      logger.error('Erro ao buscar trabalhos públicos:', error);
      
      if (error.code === '57014' || error.message?.includes('timeout')) {
        logger.warn('Timeout detectado, tentando consulta simplificada...');
        return await buscarTrabalhosPublicosSimplificado(page, limit);
      }
      
      throw error;
    }

    return {
      trabalhos: (data || []).map(converterParaResumo),
      total: count || 0
    };
  } catch (error) {
    logger.error('Erro ao buscar trabalhos públicos:', error);
    
    if (error.code === '57014' || error.message?.includes('timeout')) {
      logger.warn('Timeout detectado, usando fallback...');
      return await buscarTrabalhosPublicosSimplificado(page, limit);
    }
    
    throw error;
  }
};
