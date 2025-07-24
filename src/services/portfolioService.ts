// Arquivo principal mantido para compatibilidade - re-exporta tudo dos módulos separados
export * from './portfolio/index';

// Manter algumas funções principais aqui por compatibilidade
export {
  buscarTrabalhosPortfolio,
  buscarTrabalhosPortfolioOtimizado,
  buscarTrabalhosPortfolioPublicos,
  buscarTrabalhoPublicoPorId,
  buscarTrabalhoPorId,
  criarTrabalhoPortfolio,
  criarTrabalhoComImagens,
  atualizarTrabalhoPortfolio,
  gerarPlaceholders
} from './portfolio/index';

import { supabase } from '@/lib/supabase';

/**
 * Exclui um trabalho do portfólio e todas as suas imagens associadas do storage.
 * @param trabalhoId - O ID do trabalho a ser excluído.
 */
export const excluirTrabalho = async (trabalhoId: string): Promise<void> => {
  // Primeiro, buscar todas as imagens associadas ao trabalho
  const { data: imagens, error: erroImagens } = await supabase
    .from('portfolio_imagens')
    .select('imagem_url')
    .eq('trabalho_id', trabalhoId);

  if (erroImagens) throw erroImagens;

  // Deletar cada arquivo do Storage
  if (imagens && imagens.length > 0) {
    const caminhos = imagens
      .map(img => {
        try {
          const url = new URL(img.imagem_url);
          const pathParts = url.pathname.split('/imagens/');
          return pathParts.length > 1 ? pathParts[1] : null;
        } catch (e) {
          console.warn('URL de imagem inválida:', img.imagem_url);
          return null;
        }
      })
      .filter(Boolean) as string[];

    if (caminhos.length > 0) {
      await supabase.storage
        .from('imagens')
        .remove(caminhos);
    }
  }

  // Agora sim, deletar o trabalho (cascade deletará as imagens do banco)
  const { error } = await supabase
    .from('portfolio_trabalhos')
    .delete()
    .eq('id', trabalhoId);

  if (error) throw error;
};
