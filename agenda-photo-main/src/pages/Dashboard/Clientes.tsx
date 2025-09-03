import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2 } from 'lucide-react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClientDialog } from '@/components/clients';
import ClientList from '@/components/clients/ClientList';
import { DeleteClienteModal } from '@/components/clientes/DeleteClienteModal';
import { useSecurity } from '@/hooks/useSecurity';
import { 
  getClientesSecure, 
  createClienteSecure, 
  updateClienteSecure,
  deleteClienteSecure
} from '@/services/secureClientService';
import { Cliente, ClienteFormData } from '@/types/clients';
import { useDebounce } from '@/hooks/useDebounce';

const Clientes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { validateUser, validateClientData, rateLimiter } = useSecurity();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<{ id: string; nome: string } | null>(null);

  // Debounce para o campo de busca
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Query para buscar clientes
  const { 
    data: clientes = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientesSecure,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  });

  // Mutation para criar cliente
  const createMutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      // Validações de segurança
      const userValidation = validateUser();
      if (!userValidation.isValid) {
        throw new Error(userValidation.errors.join(', '));
      }

      const dataValidation = validateClientData(data);
      if (!dataValidation.isValid) {
        throw new Error(dataValidation.errors.join(', '));
      }

      // Rate limiting
      if (!rateLimiter.checkLimit('create-client', 10, 60000)) {
        throw new Error('Muitas tentativas. Tente novamente em 1 minuto.');
      }

      return createClienteSecure(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsDialogOpen(false);
      
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar cliente
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClienteFormData> }) => {
      // Rate limiting
      if (!rateLimiter.checkLimit(`update-client-${id}`, 5, 60000)) {
        throw new Error('Muitas tentativas de atualização. Tente novamente em 1 minuto.');
      }

      return updateClienteSecure(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsDialogOpen(false);
      setEditingCliente(null);
      
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Mutation para excluir cliente
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Rate limiting
      if (!rateLimiter.checkLimit(`delete-client-${id}`, 3, 60000)) {
        throw new Error('Muitas tentativas de exclusão. Tente novamente em 1 minuto.');
      }

      return deleteClienteSecure(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Handlers
  const handleSubmit = async (data: ClienteFormData) => {
    try {
      if (editingCliente) {
        await updateMutation.mutateAsync({ id: editingCliente.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      // Erro já tratado nas mutations
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, nome: string) => {
    setClienteToDelete({ id, nome });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clienteToDelete) {
      deleteMutation.mutate(clienteToDelete.id);
      setDeleteModalOpen(false);
      setClienteToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setClienteToDelete(null);
  };

  const handleAddNew = () => {
    setEditingCliente(null);
    setIsDialogOpen(true);
  };

  // Filtrar clientes
  const filteredClientes = searchQuery && clientes
    ? clientes.filter(cliente => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (cliente.nome && cliente.nome.toLowerCase().includes(searchLower)) ||
          (cliente.telefone && cliente.telefone.includes(searchQuery)) ||
          (cliente.evento && cliente.evento.toLowerCase().includes(searchLower))
        );
      })
    : clientes;

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-10">
          <p className="text-destructive">
            Erro ao carregar clientes. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center justify-center md:justify-start w-full">
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          </div>
          <Button onClick={handleAddNew} className="flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} />
            Novo Cliente
          </Button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-9"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            maxLength={100}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ClientList 
            clientes={filteredClientes} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <ClientDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCliente(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={editingCliente || undefined}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={editingCliente ? "Editar Cliente" : "Adicionar Cliente"}
        description={
          editingCliente
            ? "Edite as informações do cliente abaixo."
            : "Preencha os dados para adicionar um novo cliente."
        }
      />

      <DeleteClienteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        clienteNome={clienteToDelete?.nome || ''}
        isDeleting={deleteMutation.isPending}
      />
    </ResponsiveContainer>
  );
};

export default Clientes;
