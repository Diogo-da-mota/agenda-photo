
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { StandardizedMessage } from "@/types/messages";

interface MessageCardProps {
  message: StandardizedMessage;
  formatDate: (dateString: string) => string;
  onDelete: (id: string) => void;
  onEdit: (message: StandardizedMessage) => void;
  extractedData: Record<string, string | null>;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  formatDate,
  onDelete,
  onEdit,
  extractedData
}) => {
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onEdit(message)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(message.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
};

export default MessageCard;
