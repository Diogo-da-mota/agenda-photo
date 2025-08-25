
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ClienteForm from './ClienteForm';
import ClienteDialog from './ClienteDialog';
import { ClienteFormData } from '@/services/clientService';
import { useToast } from '@/hooks/use-toast';

export interface ClientFormsProps {
  // Não estamos recebendo userId neste componente principal
}

const ClientForms: React.FC<ClientFormsProps> = () => {
  const { toast } = useToast();
  
  // Handler para formulário direto
  const handleSaveCliente = async (data: ClienteFormData) => {
    
    console.log("Dados do cliente:", data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Formulário de Adição de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar novo cliente</CardTitle>
          <CardDescription>
            Preencha os dados para adicionar um novo cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClienteForm onSave={handleSaveCliente} />
        </CardContent>
      </Card>
      
      {/* Formulário de Cliente com Dialog */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar com Dialog</CardTitle>
          <CardDescription>
            Uso do componente Dialog para adição de cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center pt-6">
          <ClienteDialog />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientForms;
