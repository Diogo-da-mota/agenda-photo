import { supabase } from '@/lib/supabase'
import { SecureLogger } from '@/utils/SecureLogger'
import type { TrabalhoPortfolio } from './types'

/**
 * Extrai o caminho do arquivo de uma URL do Supabase Storage.
 * @param url - A URL completa da imagem.
 * @returns O caminho do arquivo para ser usado com a API de storage, ou null se a URL for inválida.
 */
const getPathFromUrl = (url: string): string | null => {
  try {
    const urlObject = new URL(url)
    const pathSegments = urlObject.pathname.split('/')
    // Para URLs do Supabase Storage, buscar 'storage/v1/object/public/BUCKET_NAME/'
    const publicIndex = pathSegments.indexOf('public')
    if (publicIndex === -1 || publicIndex + 2 > pathSegments.length) {
      SecureLogger.warn(
        'Formato de URL do Supabase Storage inesperado. Não foi possível extrair o caminho do arquivo.',
        { url },
      )
      return null
    }

    // O caminho do arquivo é o que vem depois de /public/BUCKET_NAME/
    // Para bucket 'images': /storage/v1/object/public/images/uploads/filename.jpg
    const bucketName = pathSegments[publicIndex + 1]
    if (bucketName !== 'imagens') {
      SecureLogger.warn(
        'URL não pertence ao bucket esperado "imagens".',
        { url, bucketName },
      )
      return null
    }
    
    const filePath = pathSegments.slice(publicIndex + 2).join('/')
    return filePath
  } catch (error) {
    SecureLogger.error('URL inválida fornecida para getPathFromUrl', error as Error, { url })
    return null
  }
}

/**
 * Remove uma ou mais imagens do Supabase Storage.
 * @param imageUrls - Um array de URLs de imagem a serem removidas.
 * @returns Um objeto com os dados da operação ou um erro.
 */
export const removerImagensDoStorage = async (imageUrls: string[]) => {
  if (!imageUrls || imageUrls.length === 0) {
    return { data: [], error: null }
  }

  const imagePaths = imageUrls.map(getPathFromUrl).filter((path): path is string => path !== null)

  if (imagePaths.length === 0) {
    SecureLogger.warn('Nenhum caminho de imagem válido encontrado para deletar.', { imageUrls })
    return { data: [], error: { name: 'NoValidPaths', message: 'Nenhum caminho de imagem válido encontrado para deletar.' } }
  }

  const { data, error } = await supabase.storage.from('imagens').remove(imagePaths)

  if (error) {
    SecureLogger.error('Erro ao remover imagens do Storage', error, { imagePaths })
  }

  return { data, error }
}

/**
 * Deleta um card de trabalho completo, incluindo o registro no banco de dados e todas as imagens associadas no Storage.
 * @param cardId - O ID do card a ser deletado.
 * @param userId - O ID do usuário para verificação de propriedade.
 * @returns Um objeto indicando o sucesso da operação, com detalhes sobre o que foi deletado.
 */
export const deletarCardCompleto = async (cardId: string, userId: string) => {
  const errors: string[] = []

  // 1. Buscar o card para garantir a propriedade e obter as URLs das imagens
  const { data: card, error: fetchError } = await supabase
    .from('portfolio_trabalhos')
    .select('id, user_id, imagens')
    .eq('id', cardId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !card) {
    errors.push('Trabalho não encontrado ou o usuário não tem permissão.')
    SecureLogger.warn('Tentativa de deletar card não existente ou sem permissão', { cardId, userId }, fetchError)
    return { success: false, deletedRecord: false, deletedImages: 0, errors }
  }

  // 2. Deletar todas as imagens do Storage
  if (card.imagens && card.imagens.length > 0) {
    const { error: storageError } = await removerImagensDoStorage(card.imagens)

    if (storageError) {
      // Falha crítica: não foi possível remover as imagens. Abortar a operação.
      errors.push(`Falha ao remover as imagens do Storage: ${storageError.message}`)
      SecureLogger.error('Falha ao deletar imagens no processo de deleção de card', storageError, { cardId })
      return { success: false, deletedRecord: false, deletedImages: 0, errors }
    }
  }

  // 3. Deletar o registro do trabalho no banco de dados
  const { error: dbError } = await supabase.from('portfolio_trabalhos').delete().eq('id', cardId)

  if (dbError) {
    // Falha parcial grave: as imagens foram deletadas, mas o registro no DB não.
    // Isso deve ser logado como um erro crítico para intervenção manual.
    errors.push(`Imagens removidas, mas falha ao deletar o registro do trabalho: ${dbError.message}`)
    SecureLogger.error(
      'INCONSISTÊNCIA DE DADOS: Imagens do card deletadas, mas o registro do DB falhou ao ser removido.',
      dbError,
      {
        cardId,
        imageUrls: card.imagens,
      },
    )
    return { success: false, deletedRecord: false, deletedImages: card.imagens.length, errors }
  }

  // 4. Sucesso total
  return { success: true, deletedRecord: true, deletedImages: card.imagens?.length ?? 0, errors: [] }
}

/**
 * Deleta uma imagem individual de um card de trabalho.
 * @param cardId - O ID do card.
 * @param imageUrl - A URL da imagem a ser deletada.
 * @param userId - O ID do usuário para verificação de propriedade.
 * @returns Um objeto com o status da operação e os dados do card atualizado.
 */
export const deletarImagemIndividual = async (cardId: string, imageUrl: string, userId: string) => {
  const errors: string[] = []

  // 1. Buscar o card, garantindo a propriedade
  const { data: card, error: fetchError } = await supabase
    .from('portfolio_trabalhos')
    .select('id, user_id, imagens, imagem_capa')
    .eq('id', cardId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !card) {
    errors.push('Trabalho não encontrado ou o usuário não tem permissão.')
    SecureLogger.warn('Tentativa de deletar imagem individual não existente ou sem permissão', { cardId, userId, imageUrl }, fetchError)
    return { success: false, errors }
  }

  const { imagens, imagem_capa } = card
  if (!imagens.includes(imageUrl)) {
    errors.push('URL da imagem não encontrada no trabalho.')
    return { success: false, errors }
  }

  // 2. Deletar o arquivo físico do Storage
  const { error: storageError } = await removerImagensDoStorage([imageUrl])
  if (storageError) {
    errors.push(`Falha ao remover a imagem do Storage: ${storageError.message}`)
    SecureLogger.error('Falha ao remover imagem individual do Storage', storageError, { cardId, imageUrl })
    return { success: false, errors, deletedFromStorage: false }
  }

  // 3. Remover a URL do array `imagens`
  const novasImagens = imagens.filter((url: string) => url !== imageUrl)
  let novaImagemCapa = imagem_capa

  // 4. Se a imagem deletada era a capa, definir uma nova
  if (imagem_capa === imageUrl) {
    novaImagemCapa = novasImagens.length > 0 ? novasImagens[0] : null
  }

  // 5. Atualizar o registro no banco de dados
  const { data: updatedRecord, error: updateError } = await supabase
    .from('portfolio_trabalhos')
    .update({
      imagens: novasImagens,
      imagem_capa: novaImagemCapa,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select()
    .single()

  if (updateError) {
    errors.push(`Imagem removida do Storage, mas falha ao atualizar o trabalho: ${updateError.message}`)
    SecureLogger.error(
      'INCONSISTÊNCIA DE DADOS: Imagem individual deletada, mas o registro do DB falhou ao ser atualizado.',
      updateError,
      {
        cardId,
        imageUrl,
      },
    )
    return { success: false, errors, deletedFromStorage: true }
  }

  return {
    success: true,
    updatedRecord: updatedRecord as TrabalhoPortfolio,
    deletedFromStorage: true,
    newImageCover: novaImagemCapa,
    errors: [],
  }
} 