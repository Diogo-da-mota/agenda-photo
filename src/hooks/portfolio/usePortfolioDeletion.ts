import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletarCardCompleto, deletarImagemIndividual } from '@/services/portfolio/delete'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'
import { SecureLogger } from '@/utils/SecureLogger'

/**
 * Hook customizado para gerenciar a deleção de trabalhos e imagens do portfólio.
 * Fornece estados de carregamento e trata da invalidação de cache do React Query.
 */
export const usePortfolioDeletion = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Hook de mutação para deletar um card de trabalho completo
  const { mutateAsync: deleteCardMutation, isPending: isDeletingCard } = useMutation({
    mutationFn: async (cardId: string) => {
      if (!user) throw new Error('Usuário não autenticado.')
      const result = await deletarCardCompleto(cardId, user.id)
      if (!result.success) {
        throw new Error(result.errors.join(', '))
      }
      return result
    },
    onSuccess: () => {
      toast({
        title: 'Trabalho Removido',
        description: 'O card e todas as suas imagens foram removidos permanentemente.',
      })
      // Invalida a query principal do portfólio para forçar a atualização da lista
      queryClient.invalidateQueries({ queryKey: ['portfolio_trabalhos'] })
    },
    onError: (error) => {
      SecureLogger.error('Erro ao deletar o card do portfólio', error)
      toast({
        title: 'Erro ao Remover Trabalho',
        description: error.message || 'Não foi possível remover o trabalho. Tente novamente.',
        variant: 'destructive',
      })
    },
  })

  // Hook de mutação para deletar uma imagem individual de um trabalho
  const { mutateAsync: deleteImageMutation, isPending: isDeletingImage } = useMutation({
    mutationFn: async ({ cardId, imageUrl }: { cardId: string; imageUrl: string }) => {
      if (!user) throw new Error('Usuário não autenticado.')
      const result = await deletarImagemIndividual(cardId, imageUrl, user.id)
      if (!result.success) {
        throw new Error(result.errors.join(', '))
      }
      return result
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Imagem Removida',
        description: 'A imagem foi removida do seu trabalho.',
      })
      // Invalida a query do trabalho específico para atualizar suas imagens
      queryClient.invalidateQueries({ queryKey: ['portfolio_trabalho', variables.cardId] })
      // Também invalida a lista geral, caso a imagem de capa tenha mudado
      queryClient.invalidateQueries({ queryKey: ['portfolio_trabalhos'] })
    },
    onError: (error) => {
      SecureLogger.error('Erro ao deletar a imagem do portfólio', error)
      toast({
        title: 'Erro ao Remover Imagem',
        description: error.message || 'Não foi possível remover a imagem. Tente novamente.',
        variant: 'destructive',
      })
    },
  })

  // Combina os estados de "pending" para um único indicador de loading
  const isDeleting = isDeletingCard || isDeletingImage

  return {
    deleteCard: deleteCardMutation,
    deleteImage: deleteImageMutation,
    isDeleting,
  }
} 