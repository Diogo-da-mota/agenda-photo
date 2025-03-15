
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Message {
  id: number | string;
  user_id: string;
  content: string;
  created_at: string;
}

interface MessagesListProps {
  tableExists: boolean;
  messages: Message[];
  formatDate: (dateString: string) => string;
}

const MessagesList: React.FC<MessagesListProps> = ({
  tableExists,
  messages,
  formatDate
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mensagens em Tempo Real</h2>
      {!tableExists ? (
        <Card className="text-center py-8">
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A tabela de mensagens em tempo real não foi encontrada no Supabase.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p>Nenhuma mensagem em tempo real encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário ID</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.id}</TableCell>
                    <TableCell>{message.user_id}</TableCell>
                    <TableCell>{message.content}</TableCell>
                    <TableCell>{formatDate(message.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagesList;
