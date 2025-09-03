import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContractStatus } from '@/services/contractService';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { registrarMudancaStatusContrato } from '@/services/atividadeService';

type ContractStatus = 'pendente' | 'assinado' | 'expirado' | 'cancelado';

interface UpdateStatusParams {
  contractId: string;
  newStatus: ContractStatus;
  clientName?: string;
}

interface UseStatusUpdateOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useStatusUpdate = (options?: UseStatusUpdateOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ contractId, newStatus, clientName }: UpdateStatusParams) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar o status do contrato
      const result = await updateContractStatus(contractId, newStatus, user);

      // Registrar atividade no histórico
      try {
        await registrarMudancaStatusContrato(
          user.id,
          contractId,
          result.statusAnterior || 'pendente',
          newStatus,
          clientName
        );
      } catch (error) {
        console.warn('Erro ao registrar atividade no histórico:', error);
        // Não falhar a operação principal por causa do histórico
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para sincronização automática
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['contract-history', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['atividades'] });

      // Mostrar toast de sucesso
      const statusLabels = {
        pendente: 'Pendente',
        assinado: 'Assinado',
        expirado: 'Expirado',
        cancelado: 'Cancelado'
      };

      toast({
        title: 'Status atualizado',
        description: `O status do contrato foi alterado para: ${statusLabels[variables.newStatus]}`,
        variant: 'default'
      });

      // Callback personalizado de sucesso
      options?.onSuccess?.(data);
    },
    onError: (error, variables) => {
      console.error('Erro ao atualizar status do contrato:', error);
      
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível alterar o status do contrato. Tente novamente.',
        variant: 'destructive'
      });

      // Callback personalizado de erro
      options?.onError?.(error);
    }
  });

  return {
    updateStatus: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
};

// Hook específico para uso em componentes de lista
export const useContractStatusUpdate = () => {
  const statusUpdate = useStatusUpdate();

  const handleStatusChange = (contractId: string, newStatus: ContractStatus, clientName?: string) => {
    statusUpdate.updateStatus({ contractId, newStatus, clientName });
  };

  return {
    handleStatusChange,
    isUpdating: statusUpdate.isUpdating,
    error: statusUpdate.error
  };
};

// Hook para uso em páginas de detalhes com callbacks específicos
export const useContractDetailsStatusUpdate = (contractId: string) => {
  const statusUpdate = useStatusUpdate({
    onSuccess: () => {
      // Pode adicionar lógica específica para páginas de detalhes
    }
  });

  const handleStatusChange = (newStatus: ContractStatus, clientName?: string) => {
    statusUpdate.updateStatus({ contractId, newStatus, clientName });
  };

  return {
    handleStatusChange,
    isUpdating: statusUpdate.isUpdating,
    error: statusUpdate.error,
    isSuccess: statusUpdate.isSuccess
  };
};