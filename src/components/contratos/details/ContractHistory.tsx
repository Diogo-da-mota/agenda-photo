
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Check, X, Ban, Send, Eye, Pen, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface HistoryItem {
  date: Date;
  action: string;
  type?: 'created' | 'sent' | 'viewed' | 'signed' | 'expired' | 'canceled' | 'reminder';
}

interface ContractHistoryProps {
  history: HistoryItem[];
  contractStatus?: string;
  contractCreatedAt?: Date;
  isLoading?: boolean;
}

const ContractHistory = ({ 
  history, 
  contractStatus = 'pendente', 
  contractCreatedAt, 
  isLoading = false 
}: ContractHistoryProps) => {
  
  const getIconForAction = (type: string | undefined) => {
    switch (type) {
      case 'created':
        return <Pen className="text-blue-500" size={16} />;
      case 'sent':
        return <Send className="text-blue-500" size={16} />;
      case 'viewed':
        return <Eye className="text-blue-500" size={16} />;
      case 'signed':
        return <Check className="text-green-500" size={16} />;
      case 'expired':
        return <X className="text-red-500" size={16} />;
      case 'canceled':
        return <Ban className="text-red-500" size={16} />;
      case 'reminder':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <Clock className="text-muted-foreground" size={16} />;
    }
  };
  
  // Gerar histórico de fallback baseado no status do contrato
  const generateFallbackHistory = (): HistoryItem[] => {
    const fallbackHistory: HistoryItem[] = [];
    const createdDate = contractCreatedAt || new Date();
    
    // Sempre adicionar criação do contrato
    fallbackHistory.push({
      date: createdDate,
      action: 'Contrato criado',
      type: 'created'
    });
    
    // Adicionar eventos baseados no status atual
    if (contractStatus === 'assinado') {
      fallbackHistory.push({
        date: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000), // +1 dia
        action: 'Contrato assinado pelo cliente',
        type: 'signed'
      });
    } else if (contractStatus === 'cancelado') {
      fallbackHistory.push({
        date: new Date(createdDate.getTime() + 12 * 60 * 60 * 1000), // +12 horas
        action: 'Contrato cancelado',
        type: 'canceled'
      });
    } else if (contractStatus === 'expirado') {
      fallbackHistory.push({
        date: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 dias
        action: 'Contrato expirado',
        type: 'expired'
      });
    }
    
    return fallbackHistory.sort((a, b) => b.date.getTime() - a.date.getTime());
  };
  
  // Usar histórico real se disponível, senão usar fallback
  const displayHistory = history && history.length > 0 ? history : generateFallbackHistory();
  const isUsingFallback = !history || history.length === 0;

  if (isLoading) {
    return (
      <div>
        <h3 className="font-medium mb-4">Histórico de Atividades</h3>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="animate-spin" size={16} />
            <span className="text-sm">Carregando histórico...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-4">Histórico de Atividades</h3>
      
      {isUsingFallback && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Histórico baseado no status atual do contrato. 
            Atividades detalhadas serão registradas automaticamente em futuras interações.
          </AlertDescription>
        </Alert>
      )}
      
      {displayHistory.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto mb-2" size={24} />
          <p className="text-sm">Nenhuma atividade registrada ainda</p>
        </div>
      ) : (
        <ol className="border-l border-muted space-y-6 pl-6 pt-2">
          {displayHistory.map((item, index) => (
            <li key={index} className="relative">
              <div className="absolute w-3 h-3 bg-primary rounded-full -left-[30px] mt-1.5"></div>
              <time className="text-xs text-muted-foreground">
                {format(item.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </time>
              <div className="flex items-center gap-2 mt-1">
                {getIconForAction(item.type)}
                <p className="text-sm">{item.action}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default ContractHistory;
