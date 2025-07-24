
import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, X } from 'lucide-react';

interface ContractClientInfoProps {
  clientName: string;
  clientEmail: string;
  phoneNumber: string;
  eventType: string;
  eventDate: Date;
  eventLocation: string;
  status: string;
}

const ContractClientInfo = ({
  clientName,
  clientEmail,
  phoneNumber,
  eventType,
  eventDate,
  eventLocation,
  status
}: ContractClientInfoProps) => {
  // Status display helpers
  const getStatusBadge = () => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock size={12} className="mr-1" /> Pendente</Badge>;
      case 'assinado':
        return <Badge variant="outline" className="text-green-500 border-green-500"><Check size={12} className="mr-1" /> Assinado</Badge>;
      case 'expirado':
        return <Badge variant="outline" className="text-red-500 border-red-500"><X size={12} className="mr-1" /> Expirado</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">{clientName}</h2>
          <p className="text-muted-foreground">{eventType}</p>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Informações de Contato</h3>
          <div className="space-y-1 text-sm">
            {clientEmail && clientEmail !== 'N/A' && (
              <p><strong>Email:</strong> {clientEmail}</p>
            )}
            <p><strong>Telefone:</strong> {phoneNumber}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Detalhes do Evento</h3>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </p>
            <p><strong>Local:</strong> {eventLocation}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractClientInfo;
