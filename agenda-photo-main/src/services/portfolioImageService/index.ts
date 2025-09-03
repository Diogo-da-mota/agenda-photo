import { supabase } from '@/lib/supabase';

/**
 * Exclui uma imagem específica do portfólio, removendo-a primeiro do Storage
 * e depois do banco de dados.
 * @param imagemId - O ID da imagem a ser excluída.
 */
export const excluirImagemPortfolio = async (imagemId: string): Promise<void> => {
  // Primeiro, buscar a URL da imagem
  const { data: imagem, error: erroImagem } = await supabase
    .from('portfolio_imagens')
    .select('imagem_url')
    .eq('id', imagemId)
    .single();

  if (erroImagem) throw erroImagem;

  // Deletar o arquivo do Storage
  if (imagem && imagem.imagem_url) {
    let path: string | null = null;
    try {
      const url = new URL(imagem.imagem_url);
      const pathParts = url.pathname.split('/imagens/');
      path = pathParts.length > 1 ? pathParts[1] : null;
    } catch (e) {
      console.warn('URL de imagem inválida:', imagem.imagem_url);
    }
    
    if (path) {
      const { error: erroStorage } = await supabase.storage
        .from('imagens')
        .remove([path]);
      
      if (erroStorage) {
        console.error('Erro ao deletar arquivo do storage:', erroStorage);
      }
    }
  }

  // Depois deletar o registro do banco
  const { error } = await supabase
    .from('portfolio_imagens')
    .delete()
    .eq('id', imagemId);

  if (error) throw error;
};
