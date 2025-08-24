// ❌ Potencialmente redundante com ClienteDialog.tsx. Avaliar para consolidação ou remoção.
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import ClientForm, { ClientFormValues } from './ClientForm';
import ExecutionReport from './ExecutionReport';
import { supabase } from '@/lib/supabase';

interface ClientModalProps {
  onSuccess?: () => Promise<void> | void;
}

const ClientModal: React.FC<ClientModalProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionReport, setExecutionReport] = useState<string[]>([]);

  const handleSubmit = async (data: ClientFormValues & { user_id?: string }) => {
    setIsSubmitting(true);
    // Reset the execution report
    setExecutionReport([]);

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar.",
        variant: "destructive"
      });
      setExecutionReport(["❌ Usuário não autenticado."]);
      setIsSubmitting(false);
      return;
    }

    if (!data.nome || !data.email) {
      toast({
        title: "Erro",
        description: "Preencha nome e email.",
        variant: "destructive"
      });
      setExecutionReport(["⚠️ Campos obrigatórios ausentes."]);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create client data object with user_id
      const clientData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || null,
        empresa: data.empresa || null,
        user_id: user.id  // Ensure user_id is always included
      };

      console.log("[DEBUG] Payload do cliente a ser enviado:", clientData);

      // Use direct supabase call for this table
      const { error } = await supabase
        .from('clientes_completo')
        .insert(clientData)
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cliente salvo com sucesso!"
      });
      
      setExecutionReport(["✅ Dados salvos em `clientes_completo`."]);
      
      // Close modal and reset form
      setIsOpen(false);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar.",
        variant: "destructive"
      });
      setExecutionReport([`❌ Erro Supabase: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Novo Cliente
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Adicione um novo cliente ao sistema
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ExecutionReport reportLines={executionReport} />
    </>
  );
};

export default ClientModal;
