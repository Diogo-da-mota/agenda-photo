
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Database, Loader2, Trash2, Edit } from "lucide-react";
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
import { MessageEditDialog } from "./MessageEditDialog";

interface CustomerMessagesListProps {
  tableExists: boolean;
  mensagens: StandardizedMessage[];
  formatDate: (dateString: string) => string;
  checkTables: () => void;
  createTable: () => Promise<void>;
  isCreatingTable: boolean;
  deleteMessage?: (id: string) => Promise<void>;
  updateMessage?: (id: string, data: Partial<StandardizedMessage>) => Promise<void>;
}

const CustomerMessagesList: React.FC<CustomerMessagesListProps> = ({
  tableExists,
  mensagens,
  formatDate,
  checkTables,
  createTable,
  isCreatingTable,
  deleteMessage,
  updateMessage
}) => {
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState<StandardizedMessage | null>(null);

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

  // Function to extract structured data from message content
  const extractMessageData = (message: string): Record<string, string | null> => {
    const data: Record<string, string | null> = {};
    
    // Extract event type
    const eventoMatch = message.match(/Qual o tipo de evento que você mais fotografa atualmente\?:\s*(.*?)(?:\n|$)/);
    if (eventoMatch) data.evento = eventoMatch[1];
    
    // Extract agenda usage
    const agendaMatch = message.match(/Você utiliza uma agenda online para organizar seus compromissos\?:\s*(.*?)(?:\n|$)/);
    if (agendaMatch) {
      data.usaAgenda = agendaMatch[1];
      
      // Get agenda details if user uses one
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
    
    // Extract portfolio info
    const portfolioMatch = message.match(/Você tem um portfólio online em uma plataforma de terceiros\?:\s*(.*?)(?:\n|$)/);
    if (portfolioMatch) data.portfolio = portfolioMatch[1];
    
    // Extract other tools info
    const toolsMatch = message.match(/Além da agenda e do site, você usa outros aplicativos ou ferramentas online pagas para o seu trabalho\?:\s*(.*?)(?:\n|$)/);
    if (toolsMatch) data.outrasFerramentas = toolsMatch[1];
    
    // Extract ideal site description
    const siteIdealMatch = message.match(/Se você pudesse ter um único site que integrasse todas as ferramentas.*?:\s*(.*?)(?:\n|$)/s);
    if (siteIdealMatch) data.siteIdeal = siteIdealMatch[1].substring(0, 100) + (siteIdealMatch[1].length > 100 ? "..." : "");
    
    // Extract suggested value
    const valorSugeridoMatch = message.match(/Valor sugerido para a solução:\s*(R\$\s*[\d.,]+)/);
    if (valorSugeridoMatch) data.valorSugerido = valorSugeridoMatch[1];
    
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
            const extractedData = extractMessageData(message.message);
            
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
                      {updateMessage && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => setMessageToEdit(message)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
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
                  <dl className="grid gap-y-2 text-sm">
                    {extractedData.evento && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Evento:</dt>
                        <dd>{extractedData.evento}</dd>
                      </div>
                    )}
                    
                    {extractedData.usaAgenda && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Usa agenda online:</dt>
                        <dd>{extractedData.usaAgenda}</dd>
                      </div>
                    )}
                    
                    {extractedData.gosta && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Gosta:</dt>
                        <dd>{extractedData.gosta}</dd>
                      </div>
                    )}
                    
                    {extractedData.naoGosta && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Não gosta:</dt>
                        <dd>{extractedData.naoGosta}</dd>
                      </div>
                    )}
                    
                    {extractedData.valorMes && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Valor pago/mês:</dt>
                        <dd>{extractedData.valorMes}</dd>
                      </div>
                    )}
                    
                    {extractedData.portfolio && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Portfólio online:</dt>
                        <dd>{extractedData.portfolio}</dd>
                      </div>
                    )}
                    
                    {extractedData.outrasFerramentas && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Outras ferramentas:</dt>
                        <dd>{extractedData.outrasFerramentas}</dd>
                      </div>
                    )}
                    
                    {extractedData.siteIdeal && (
                      <div className="flex flex-col">
                        <dt className="font-semibold">Site ideal:</dt>
                        <dd>{extractedData.siteIdeal}</dd>
                      </div>
                    )}
                    
                    {extractedData.valorSugerido && (
                      <div className="flex flex-col mt-2">
                        <dt className="font-semibold">Valor sugerido:</dt>
                        <dd className="font-medium text-green-600">{extractedData.valorSugerido}</dd>
                      </div>
                    )}
                  </dl>

                  {/* If no structured data was parsed, show the raw message */}
                  {!Object.values(extractedData).some(val => val !== null) && (
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

      {/* Edit message dialog */}
      {updateMessage && (
        <MessageEditDialog 
          message={messageToEdit} 
          onClose={() => setMessageToEdit(null)}
          onSave={async (updatedMessage) => {
            if (messageToEdit && updateMessage) {
              await updateMessage(messageToEdit.id, updatedMessage);
              setMessageToEdit(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default CustomerMessagesList;
