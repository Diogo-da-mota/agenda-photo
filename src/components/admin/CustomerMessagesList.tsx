
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Database, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StandardizedMessage } from "@/types/messages";

interface CustomerMessagesListProps {
  tableExists: boolean;
  mensagens: StandardizedMessage[];
  formatDate: (dateString: string) => string;
  checkTables: () => void;
  createTable: () => Promise<void>;
  isCreatingTable: boolean;
  deleteMessage?: (id: string) => Promise<void>;
}

const CustomerMessagesList: React.FC<CustomerMessagesListProps> = ({
  tableExists,
  mensagens,
  formatDate,
  checkTables,
  createTable,
  isCreatingTable,
  deleteMessage
}) => {
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!messageToDelete || !deleteMessage) return;
    
    setIsDeleting(true);
    try {
      await deleteMessage(messageToDelete);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null);
    }
  };

  // Helper function to format message content
  const formatMessageContent = (message: string): { [key: string]: string | null } => {
    const data: { [key: string]: string | null } = {
      evento: null,
      usaAgenda: null,
      gosta: null,
      naoGosta: null,
      valorMes: null,
      portfolio: null,
      outrasFerramentas: null,
      siteIdeal: null,
      valorSugerido: null
    };
    
    // Extract structured data from the message
    if (message.includes("Qual o tipo de evento que você mais fotografa atualmente?")) {
      const match = message.match(/Qual o tipo de evento que você mais fotografa atualmente\?:\s*(.*?)(?:\n|$)/);
      if (match) data.evento = match[1];
    }
    
    if (message.includes("Você utiliza uma agenda online para organizar seus compromissos?")) {
      const match = message.match(/Você utiliza uma agenda online para organizar seus compromissos\?:\s*(.*?)(?:\n|$)/);
      if (match) data.usaAgenda = match[1];
      
      // If user uses agenda, get additional details
      if (data.usaAgenda === "Sim") {
        const qualAgendaMatch = message.match(/Qual agenda online você usa\?:\s*(.*?)(?:;|\n|$)/);
        if (qualAgendaMatch) data.usaAgenda = `Sim, ${qualAgendaMatch[1]}`;
        
        const gostaMatch = message.match(/O que você mais gosta na agenda que usa\?:\s*(.*?)(?:;|\n|$)/);
        if (gostaMatch) data.gosta = gostaMatch[1];
        
        const naoGostaMatch = message.match(/O que você não gosta na agenda que usa\?:\s*(.*?)(?:;|\n|$)/);
        if (naoGostaMatch) data.naoGosta = naoGostaMatch[1];
        
        const valorMatch = message.match(/Quanto você paga por mês por essa ferramenta\?:\s*(R\$\s*[\d.,]+)/);
        if (valorMatch) data.valorMes = valorMatch[1];
      }
    }
    
    if (message.includes("Você tem um portfólio online em uma plataforma de terceiros?")) {
      const match = message.match(/Você tem um portfólio online em uma plataforma de terceiros\?:\s*(.*?)(?:\n|$)/);
      if (match) data.portfolio = match[1];
    }
    
    if (message.includes("Além da agenda e do site, você usa outros aplicativos ou ferramentas online pagas para o seu trabalho?")) {
      const match = message.match(/Além da agenda e do site, você usa outros aplicativos ou ferramentas online pagas para o seu trabalho\?:\s*(.*?)(?:\n|$)/);
      if (match) data.outrasFerramentas = match[1];
    }
    
    if (message.includes("Se você pudesse ter um único site que integrasse todas as ferramentas")) {
      const match = message.match(/Se você pudesse ter um único site que integrasse todas as ferramentas.*?:\s*(.*?)(?:\n|$)/s);
      if (match) data.siteIdeal = match[1].substring(0, 100) + (match[1].length > 100 ? "..." : "");
    }
    
    if (message.includes("Valor sugerido para a solução:")) {
      const match = message.match(/Valor sugerido para a solução:\s*(R\$\s*[\d.,]+)/);
      if (match) data.valorSugerido = match[1];
    }
    
    return data;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mensagens de Contato</h2>
      {!tableExists ? (
        <Card className="text-center py-8">
          <CardContent>
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                A tabela de mensagens não foi encontrada.
                <p className="mt-2 text-sm">
                  Você pode tentar criar a tabela manualmente clicando no botão abaixo.
                </p>
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={createTable} 
                disabled={isCreatingTable}
                className="flex items-center gap-2"
              >
                {isCreatingTable ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando tabela...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Criar tabela manualmente
                  </>
                )}
              </Button>
              <Button 
                onClick={checkTables} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Verificar novamente
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>A tabela será criada com as colunas: id, created_at, name, email, phone, message.</p>
              <p className="mt-2 font-medium">Se o problema persistir após várias tentativas, tente atualizar a página inteira.</p>
            </div>
          </CardContent>
        </Card>
      ) : mensagens.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p>Nenhuma mensagem encontrada</p>
            <div className="mt-4">
              <Button onClick={checkTables} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {mensagens.map((message) => {
            const formattedData = formatMessageContent(message.message);
            
            return (
              <Card key={message.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">{message.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {message.email && <div>E-mail: {message.email}</div>}
                        {message.phone && <div>Telefone: {message.phone}</div>}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.created_at)}
                      </span>
                      {deleteMessage && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setMessageToDelete(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {formattedData.evento && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Evento:</span>
                        <span>{formattedData.evento}</span>
                      </div>
                    )}
                    
                    {formattedData.usaAgenda && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Agenda:</span>
                        <span>{formattedData.usaAgenda}</span>
                      </div>
                    )}
                    
                    {formattedData.gosta && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Gosta:</span>
                        <span>{formattedData.gosta}</span>
                      </div>
                    )}
                    
                    {formattedData.naoGosta && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Não gosta:</span>
                        <span>{formattedData.naoGosta}</span>
                      </div>
                    )}
                    
                    {formattedData.valorMes && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Valor/mês:</span>
                        <span>{formattedData.valorMes}</span>
                      </div>
                    )}
                    
                    {formattedData.portfolio && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Portfólio:</span>
                        <span>{formattedData.portfolio}</span>
                      </div>
                    )}
                    
                    {formattedData.outrasFerramentas && (
                      <div className="flex items-start">
                        <span className="font-semibold w-24">Outras:</span>
                        <span>{formattedData.outrasFerramentas}</span>
                      </div>
                    )}
                    
                    {formattedData.siteIdeal && (
                      <div className="flex items-start sm:col-span-2">
                        <span className="font-semibold w-24">Site ideal:</span>
                        <span>{formattedData.siteIdeal}</span>
                      </div>
                    )}
                    
                    {formattedData.valorSugerido && (
                      <div className="flex items-start mt-2">
                        <span className="font-semibold w-24">Valor sugerido:</span>
                        <span className="font-medium text-green-600">{formattedData.valorSugerido}</span>
                      </div>
                    )}
                  </div>

                  {/* If no structured data was parsed, show the raw message */}
                  {!Object.values(formattedData).some(val => val !== null) && (
                    <div className="whitespace-pre-line mt-2">{message.message}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation dialog for message deletion */}
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerMessagesList;
