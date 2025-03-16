
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

interface CustomerMessagesListProps {
  tableExists: boolean;
  mensagens: ContactMessage[];
  formatDate: (dateString: string) => string;
  checkTables: () => void;
  createTable: () => Promise<void>;
  isCreatingTable: boolean;
}

const CustomerMessagesList: React.FC<CustomerMessagesListProps> = ({
  tableExists,
  mensagens,
  formatDate,
  checkTables,
  createTable,
  isCreatingTable
}) => {
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
          {mensagens.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <CardTitle>{message.name}</CardTitle>
                    <CardDescription>{message.email}</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                    {formatDate(message.created_at)}
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {message.phone && (
                    <div>
                      <h4 className="font-medium">Telefone:</h4>
                      <p>{message.phone}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">Mensagem:</h4>
                    <p className="whitespace-pre-line">{message.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerMessagesList;
