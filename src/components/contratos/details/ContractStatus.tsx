
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Send, Ban, Pen, Files } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateContractUrl } from '@/utils/slugify';
import StatusSelector from '../StatusSelector';
import { useContractDetailsStatusUpdate } from '@/hooks/useStatusUpdate';

interface ContractStatusProps {
  status: string;
  sentDate: Date;
  onResend: () => void;
  onCancel: () => void;
  contractId: string;
  onCopyContract?: () => void;
  contractTitle?: string;
  clientName?: string;
}

const ContractStatus = ({ status, sentDate, onResend, onCancel, contractId, onCopyContract, contractTitle, clientName }: ContractStatusProps) => {
  const navigate = useNavigate();
  const { handleStatusChange, isUpdating } = useContractDetailsStatusUpdate();
  
  // Status display helpers
  const getStatusBadge = () => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock size={12} className="mr-1" /> Pendente</Badge>;
      case 'assinado':
        return <Badge variant="outline" className="text-green-500 border-green-500"><Check size={12} className="mr-1" /> Assinado</Badge>;
      case 'expirado':
        return <Badge variant="outline" className="text-red-500 border-red-500"><X size={12} className="mr-1" /> Expirado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="text-destructive border-destructive"><Ban size={12} className="mr-1" /> Cancelado</Badge>;
      default:
        return null;
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'pendente':
        return "O contrato foi enviado e está aguardando a assinatura do cliente.";
      case 'assinado':
        return "O contrato foi assinado digitalmente pelo cliente.";
      case 'expirado':
        return "O prazo para assinatura deste contrato expirou.";
      case 'cancelado':
        return "Este contrato foi cancelado.";
      default:
        return "";
    }
  };

  const handleSignDigitally = () => {
    // Para a assinatura digital, sempre usar o formato de contrato público
    const contractUrl = generateContractUrl(contractId, contractTitle || 'Contrato');
    // Navegar diretamente para a URL do contrato público
    window.open(`${window.location.origin}${contractUrl}`, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Status do Contrato</h3>
        {getStatusBadge()}
      </div>
      
      {/* Seletor de Status para Edição */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Alterar Status:</label>
        <StatusSelector
          currentStatus={status as 'pendente' | 'assinado' | 'expirado' | 'cancelado'}
          onStatusChange={(newStatus) => handleStatusChange(contractId, newStatus, clientName || 'Cliente')}
          disabled={isUpdating}
          size="default"
        />
      </div>
      
      <div className="space-y-3">
        <p className="text-sm">{getStatusDescription()}</p>
        <p className="text-sm"><strong>Enviado em:</strong> {format(sentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        
        <div className="space-y-2 mt-4">
          {status === 'pendente' && (
            <>
              <Button className="w-full gap-2" onClick={handleSignDigitally}>
                <Pen size={16} />
                Assinar Digitalmente
              </Button>
              
              <Button className="w-full gap-2" onClick={onResend}>
                <Send size={16} />
                Reenviar Contrato
              </Button>
              
              <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={onCancel}>
                <Ban size={16} />
                Cancelar Contrato
              </Button>
            </>
          )}
          
          {status === 'expirado' && (
            <Button className="w-full gap-2" onClick={onResend}>
              <Send size={16} />
              Reenviar Contrato
            </Button>
          )}
          
          {status === 'assinado' && onCopyContract && (
            <Button variant="outline" className="w-full gap-2" onClick={onCopyContract}>
              <Files size={16} />
              Copiar Contrato
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractStatus;
