import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { TrabalhoPortfolio } from '../types';
import { converterDoSupabase } from '../converters';

const COLUMNS_TO_SELECT =
  'id, user_id, titulo, categoria, local, descricao, tags, imagens, imagem_capa, criado_em, atualizado_em';

// Buscar todos os trabalhos do portfólio de um usuário
export const buscarTrabalhosPortfolio = async (userId: string): Promise<TrabalhoPortfolio[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select(COLUMNS_TO_SELECT)
      .eq('user_id', userId)
      .order('criado_em', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar trabalhos do portfólio:', error);
      throw error;
    }

    return (data || []).map(converterDoSupabase);
  } catch (error) {
    logger.error('Erro ao buscar trabalhos do portfólio:', error);
    throw error;
  }
};

// Buscar um trabalho específico por ID
export const buscarTrabalhoPorId = async (trabalhoId: string, userId: string): Promise<TrabalhoPortfolio | null> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select(COLUMNS_TO_SELECT)
      .eq('id', trabalhoId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Erro ao buscar trabalho por ID:', error);
      throw error;
    }

    return converterDoSupabase(data);
  } catch (error) {
    logger.error('Erro ao buscar trabalho por ID:', error);
    throw error;
  }
};

// Buscar trabalho por título (para área administrativa)
export const buscarTrabalhoPorTitulo = async (titulo: string, userId: string): Promise<TrabalhoPortfolio | null> => {
  try {
    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .select(COLUMNS_TO_SELECT)
      .eq('titulo', titulo)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Erro ao buscar trabalho por título:', error);
      throw error;
    }

    return converterDoSupabase(data);
  } catch (error) {
    logger.error('Erro ao buscar trabalho por título:', error);
    throw error;
  }
};

// Buscar trabalhos do portfólio com paginação otimizada
