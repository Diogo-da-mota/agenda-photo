import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { TrabalhoPortfolio, CriarTrabalhoPortfolio, CriarTrabalhoComImagens, ResultadoTrabalhoComImagens } from '../types';
import { converterParaSupabase, converterDoSupabase } from '../converters';

const COLUMNS_TO_SELECT =
  'id, user_id, titulo, categoria, local, descricao, tags, imagens, imagem_capa, criado_em, atualizado_em';

// Criar um novo trabalho no portfólio
export const criarTrabalhoPortfolio = async (trabalho: CriarTrabalhoPortfolio, userId: string): Promise<TrabalhoPortfolio> => {
  try {
    if (!userId) {
      throw new Error('ID de usuário não fornecido. Impossível criar trabalho.');
    }

    console.log('🔍 [DIAGNÓSTICO PARTE 4] === INICIO criarTrabalhoPortfolio ===');
    logger.info('[criarTrabalhoPortfolio] Iniciando criação de trabalho:', { 
      titulo: trabalho.titulo, 
      categoria: trabalho.categoria,
      local: trabalho.local
    });

    const trabalhoParaSalvar = converterParaSupabase(trabalho, userId);
    
    console.log('🔍 [DIAGNÓSTICO PARTE 4] Dados preparados para Supabase INSERT:', trabalhoParaSalvar);
    logger.info('[criarTrabalhoPortfolio] Dados preparados para o Supabase:', trabalhoParaSalvar);

    const { data, error } = await supabase
      .from('portfolio_trabalhos')
      .insert([trabalhoParaSalvar])
      .select(COLUMNS_TO_SELECT)
      .single();
      
    if (error) {
      console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ ERRO SUPABASE INSERT:', error);
      logger.error('[criarTrabalhoPortfolio] Erro ao salvar trabalho no Supabase:', error);
      throw new Error(`Erro ao salvar trabalho: ${error.message}`);
    }

    console.log('🔍 [DIAGNÓSTICO PARTE 4] ✅ SUCESSO SUPABASE INSERT:', data);
    logger.info('[criarTrabalhoPortfolio] Trabalho salvo com sucesso:', data);
    
    const trabalhoConvertido = converterDoSupabase(data);

    console.log('🔍 [DIAGNÓSTICO] Trabalho criado no Supabase - upload B2 será usado se houver imagens');
    
    return trabalhoConvertido;
  } catch (error) {
    console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ ERRO GERAL criarTrabalhoPortfolio:', error);
    logger.error('[criarTrabalhoPortfolio] Erro geral ao criar trabalho:', error);
    throw error;
  }
};

/**
 * @deprecated O upload agora é feito no client-side. Esta função apenas cria o registro no banco.
 */
export const criarTrabalhoComImagens = async (
  trabalhoData: CriarTrabalhoComImagens,
  userId: string
): Promise<ResultadoTrabalhoComImagens> => {
  try {
    logger.info('[criarTrabalhoComImagens] Iniciando criação de trabalho com URLs já fornecidas:', {
      titulo: trabalhoData.trabalho.titulo,
      quantidadeImagens: trabalhoData.trabalho.imagens?.length || 0
    });

    // O upload já foi feito no client-side.
    // A propriedade `trabalhoData.trabalho` já contém as URLs das imagens.
    const trabalho = await criarTrabalhoPortfolio(trabalhoData.trabalho, userId);

    // O número de falhas é 0 porque o tratamento de erro do upload agora é no client.
    return {
      trabalho,
      imagens: trabalho.imagens || [],
      urlsDrive: trabalho.imagens || [], // Alias para compatibilidade
      sucessos: trabalho.imagens?.length || 0,
      falhas: 0
    };

  } catch (error) {
    logger.error('[criarTrabalhoComImagens] Erro geral ao criar trabalho:', error);
    throw error;
  }
};

/**
 * @deprecated Substituído pelo novo fluxo de upload no client-side.
 */
export const createPortfolioMutation = async (
  dadosTrabalho: any,
  arquivos: File[] = []
): Promise<any> => {
  logger.warn('[createPortfolioMutation] Esta função está obsoleta e não deve ser usada.');
  throw new Error('createPortfolioMutation está obsoleto.');
};

/**
 * @deprecated A atualização agora é feita diretamente no componente.
 */
export const atualizarTrabalhoComImagens = async (
  trabalhoId: string,
  trabalhoData: CriarTrabalhoComImagens,
  userId: string
): Promise<ResultadoTrabalhoComImagens> => {
  logger.warn('[atualizarTrabalhoComImagens] Esta função está obsoleta e não deve ser usada.');
  throw new Error('atualizarTrabalhoComImagens está obsoleto.');
};
