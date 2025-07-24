
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Loader2 } from 'lucide-react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClientDialog, ClientList } from '@/components/clients';
import { 
  getClientes, 
  createCliente, 
  updateCliente,
  deleteCliente,
  Cliente,
  ClienteFormData
} from '@/services/clientService';
import ClientForms from '@/components/clientes/ClientForms';

const SimpleClientes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const { 
    data: clientes = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: (data: ClienteFormData) => createCliente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsDialogOpen(false);
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClienteFormData> }) => 
      updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsDialogOpen(false);
      setEditingCliente(null);
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  });

  // Handle form submission for creating/updating a client
  const handleSubmit = async (data: ClienteFormData) => {
    if (editingCliente) {
      await updateMutation.mutateAsync({ id: editingCliente.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  // Handle opening the edit dialog
  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsDialogOpen(true);
  };

  // Handle client deletion
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Handle opening the new client dialog
  const handleAddNew = () => {
    setEditingCliente(null);
    setIsDialogOpen(true);
  };

  // Filter clients based on search query
  const filteredClientes = searchQuery && clientes
    ? clientes.filter(cliente => 
        (cliente.nome && cliente.nome.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cliente.telefone && cliente.telefone.includes(searchQuery))
      )
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
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      
      {/* Formulários adicionais abaixo */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Formulários de Cliente</h2>
        <ClientForms />
      </div>
    </ResponsiveContainer>
  );
};

export default SimpleClientes;
