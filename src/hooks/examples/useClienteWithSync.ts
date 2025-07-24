import { useCallback } from 'react';
import { useWithBackgroundSync } from '@/hooks/useWithBackgroundSync';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Exemplo de hook que integra Background Sync com operações de clientes
 * Demonstra como adaptar hooks existentes para funcionar offline
 */
export const useClienteWithSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    isOnline,
    pendingOperations,
    createWithSync,
    updateWithSync,
    deleteWithSync,
    executeWithSync
  } = useWithBackgroundSync();

  // Query para buscar clientes (com fallback offline)
  const { data: clientes, isLoading, error, refetch } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => executeWithSync(
      'buscar-clientes',
      async () => {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        return data || [];
      },
      [] // Array vazio como fallback
    ),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // Não tentar novamente se offline
      if (!navigator.onLine) return false;
      return failureCount < 3;
    }
  });

  // Mutation para criar cliente
  const createClienteMutation = useMutation({
    mutationFn: async (novoCliente: any) => {
      return await createWithSync(
        'clientes',
        novoCliente,
        async () => {
          const { data, error } = await supabase
            .from('clientes')
            .insert(novoCliente)
            .select()
            .single();
          
          if (error) throw error;
          return data;
        }
      );
    },
    onSuccess: (data) => {
      // Atualizar cache local
      queryClient.setQueryData(['clientes'], (old: any[] = []) => {
        return [...old, data];
      });

      toast({
        title: "Cliente criado",
        description: data._offline 
          ? "Cliente salvo offline. Será sincronizado quando a conexão retornar."
          : "Cliente criado com sucesso.",
        variant: data._offline ? "default" : "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar cliente
  const updateClienteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await updateWithSync(
        'clientes',
        id,
        data,
        async () => {
          const { data: updatedData, error } = await supabase
            .from('clientes')
            .update(data)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          return updatedData;
        }
      );
    },
    onSuccess: (data) => {
      // Atualizar cache local
      queryClient.setQueryData(['clientes'], (old: any[] = []) => {
        return old.map(cliente => 
          cliente.id === data.id ? data : cliente
        );
      });

      toast({
        title: "Cliente atualizado",
        description: data._offline 
          ? "Alterações salvas offline. Serão sincronizadas quando a conexão retornar."
          : "Cliente atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir cliente
  const deleteClienteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteWithSync(
        'clientes',
        id,
        async () => {
          const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          return { id };
        }
      );
    },
    onSuccess: (data) => {
      // Remover do cache local
      queryClient.setQueryData(['clientes'], (old: any[] = []) => {
        return old.filter(cliente => cliente.id !== data.id);
      });

      toast({
        title: "Cliente excluído",
        description: data._offline 
          ? "Cliente marcado para exclusão. Será removido quando a conexão retornar."
          : "Cliente excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Função para criar cliente
  const criarCliente = useCallback(async (dadosCliente: any) => {
    return createClienteMutation.mutateAsync(dadosCliente);
  }, [createClienteMutation]);

  // Função para atualizar cliente
  const atualizarCliente = useCallback(async (id: string, dadosCliente: any) => {
    return updateClienteMutation.mutateAsync({ id, data: dadosCliente });
  }, [updateClienteMutation]);

  // Função para excluir cliente
  const excluirCliente = useCallback(async (id: string) => {
    return deleteClienteMutation.mutateAsync(id);
  }, [deleteClienteMutation]);

  // Verificar se há dados offline
  const temDadosOffline = useCallback(() => {
    return clientes?.some((cliente: any) => cliente._offline) || false;
  }, [clientes]);

  return {
    // Dados
    clientes: clientes || [],
    isLoading,
    error,
    
    // Estado da conexão
    isOnline,
    pendingOperations,
    temDadosOffline: temDadosOffline(),
    
    // Ações
    criarCliente,
    atualizarCliente,
    excluirCliente,
    refetch,
    
    // Estados das mutations
    isCriando: createClienteMutation.isPending,
    isAtualizando: updateClienteMutation.isPending,
    isExcluindo: deleteClienteMutation.isPending,
  };
};
