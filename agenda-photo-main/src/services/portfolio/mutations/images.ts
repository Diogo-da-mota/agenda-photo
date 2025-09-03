
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { monitorarOperacaoPortfolio } from '@/utils/performance/portfolioMonitoring';
import { TrabalhoPortfolio } from '../types';
import { buscarTrabalhoPorId } from '../queries';
import { atualizarTrabalhoPortfolio } from './update';

/**
 * Gerencia as imagens de um portfólio, adicionando novas imagens e removendo as especificadas.
 *
 * @param portfolioId O ID do portfólio a ser atualizado.
 * @param novasImagensUrls Um array de URLs de novas imagens a serem adicionadas.
 * @param imagensParaRemoverUrls Um array de URLs de imagens a serem removidas.
 * @param userId O ID do usuário que está realizando a operação.
 * @returns O trabalho de portfólio atualizado.
 */
export const gerenciarImagensPortfolio = async (
  portfolioId: string,
  novasImagensUrls: string[],
  imagensParaRemoverUrls: string[],
  userId: string
): Promise<TrabalhoPortfolio> => {
  return monitorarOperacaoPortfolio(
    'gerenciarImagensPortfolio',
    portfolioId,
    async () => {
      logger.info(`[gerenciarImagensPortfolio] Iniciando gerenciamento de imagens para o portfólio ${portfolioId}`, {
        novasImagensCount: novasImagensUrls.length,
        imagensParaRemoverCount: imagensParaRemoverUrls.length,
      });

      // 1. Buscar os dados atuais do portfólio
      const trabalhoAtual = await buscarTrabalhoPorId(portfolioId, userId);
      if (!trabalhoAtual) {
        throw new Error('Portfólio não encontrado.');
      }

      const imagensAtuais = trabalhoAtual.imagens || [];

      // 2. Filtrar as imagens a serem mantidas e adicionar as novas
      const imagensMantidas = imagensAtuais.filter(
        (img) => !imagensParaRemoverUrls.includes(img)
      );
      
      const imagensFinais = [...imagensMantidas, ...novasImagensUrls];

      // 3. Atualizar o portfólio no banco de dados com o novo array de imagens
      await atualizarTrabalhoPortfolio(portfolioId, { imagens: imagensFinais }, userId);

      logger.info(`[gerenciarImagensPortfolio] Portfólio ${portfolioId} atualizado no banco de dados.`);

      // 4. Remover as imagens do Supabase Storage
      if (imagensParaRemoverUrls.length > 0) {
        const pathsParaRemover = imagensParaRemoverUrls.map(url => {
            const urlObj = new URL(url);
            // O path no storage é o que vem depois do nome do bucket.
            // Ex: /public/images/uploads/16256789.jpg -> o path é 'uploads/16256789.jpg'
            // A estrutura do path pode variar, então é preciso cuidado aqui.
            // Assumindo que a URL é /public/images/ e o path é o resto.
            const pathParts = urlObj.pathname.split('/public/images/');
            return pathParts[1];
        }).filter(p => p); // Filtra paths nulos ou vazios

        if(pathsParaRemover.length > 0) {
            const { error: errorRemocao } = await supabase.storage
              .from('images') // ou o nome do seu bucket
              .remove(pathsParaRemover);

            if (errorRemocao) {
              logger.error(`[gerenciarImagensPortfolio] Erro ao remover imagens do Storage: ${errorRemocao.message}`);
              // Não lançar erro aqui para não reverter a atualização do DB,
              // mas logar para possível limpeza manual.
            } else {
              logger.info(`[gerenciarImagensPortfolio] Imagens removidas do Storage com sucesso.`);
            }
        }
      }

      // 5. Retornar o trabalho atualizado
      const trabalhoAtualizado = await buscarTrabalhoPorId(portfolioId, userId);
      if (!trabalhoAtualizado) {
        throw new Error('Falha ao buscar o portfólio após a atualização.');
      }

      return trabalhoAtualizado;
    },
    userId
  );
};
