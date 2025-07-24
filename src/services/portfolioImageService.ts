import { supabase } from '@/lib/supabase';

/**
 * Exclui uma imagem específica do portfólio, removendo-a primeiro do Storage
 * e depois do banco de dados.
 * @param imagemId - O ID da imagem a ser excluída.
 * @returns O registro da imagem que foi excluída.
 */
export const excluirImagemPortfolio = async (imagemId: string) => {
  console.log(`Iniciando exclusão da imagem ID: ${imagemId}`);

  // 1. Buscar os metadados da imagem, incluindo sua URL, antes de apagar.
  const { data: imagem, error: erroBusca } = await supabase
    .from('portfolio_imagens')
    .select('id, url')
    .eq('id', imagemId)
    .single();

  if (erroBusca || !imagem) {
    console.error(`Erro ao buscar a imagem ${imagemId} para exclusão:`, erroBusca);
    throw new Error('Imagem não encontrada ou falha ao buscar dados para exclusão.');
  }

  // 2. Extrair o caminho do arquivo e excluí-lo do Supabase Storage.
  if (imagem.url) {
    try {
      const url = new URL(imagem.url);
      const caminhoParaExcluir = url.pathname.split('/imagens/')[1];
      
      if (caminhoParaExcluir) {
        console.log(`Excluindo arquivo do storage: ${caminhoParaExcluir}`);
        const { error: erroStorage } = await supabase.storage
          .from('imagens') // O nome do seu bucket
          .remove([caminhoParaExcluir]);

        if (erroStorage) {
          // Loga o erro mas não impede a exclusão do DB para evitar um estado inconsistente.
          console.error(`Erro ao excluir arquivo do storage:`, erroStorage);
        }
      }
    } catch (e) {
      console.warn(`URL de imagem inválida encontrada para a imagem ${imagemId}: ${imagem.url}`);
    }
  }

  // 3. Excluir o registro da imagem do banco de dados.
  console.log(`Excluindo registro da imagem ${imagemId} do banco de dados...`);
  const { data: imagemExcluida, error: erroExclusaoDB } = await supabase
    .from('portfolio_imagens')
    .delete()
    .eq('id', imagemId)
    .single();

  if (erroExclusaoDB) {
    console.error(`Erro ao excluir o registro da imagem ${imagemId}:`, erroExclusaoDB);
    throw new Error('Falha ao excluir o registro da imagem.');
  }

  console.log(`Imagem ${imagemId} foi completamente excluída com sucesso.`);
  return imagemExcluida;
};
