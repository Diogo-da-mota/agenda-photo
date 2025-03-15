
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

interface CustomerMessagesListProps {
  tableExists: boolean;
  customerMessages: CustomerMessage[];
  formatDate: (dateString: string) => string;
  checkTables: () => void;
}

const CustomerMessagesList: React.FC<CustomerMessagesListProps> = ({
  tableExists,
  customerMessages,
  formatDate,
  checkTables
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mensagens dos Clientes</h2>
      {!tableExists ? (
        <Card className="text-center py-8">
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A tabela de mensagens de clientes não foi encontrada no Supabase.
              </AlertDescription>
            </Alert>
            <Button onClick={checkTables}>Verificar novamente</Button>
          </CardContent>
        </Card>
      ) : customerMessages.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p>Nenhuma mensagem de cliente encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {customerMessages.map((message) => (
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
