import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, DollarSign, Receipt, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Event, EventStatus } from '@/components/agenda/types';
import { formatarTelefoneExibicao } from '@/utils/formatters';
import { useUserRole } from '@/hooks/useUserRole';

interface EventCardActionsProps {
  event: Event;
  hasPendingPayment: boolean;
  onSendReminder: () => void;
  onRegisterPayment: () => void;
  onGenerateReceipt: () => void;
  onStatusChange: (eventId: string, status: EventStatus) => void;
}

const G_CAL_URL = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

const generateGoogleCalendarUrl = (event: Event): string => {
  const startTime = new Date(`${format(event.date, 'yyyy-MM-dd')}T${event.time}`);
  // Adiciona 2 horas como duração padrão
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  const formatTimeForGoogle = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss");
  };

  const statusMap: { [key in EventStatus]: string } = {
    past: 'Passado',
    upcoming: 'Próximo',
    confirmed: 'Confirmado',
    pending: 'Aguardando',
    completed: 'Concluído',
    canceled: 'Cancelado',
  };

  const detailsParts: string[] = [
    `🗓️ EVENTO: ${event.eventType} - ${event.clientName}`,
    `--------------------------------------`,
  ];

  // Dados do Cliente
  if (event.phone) detailsParts.push(`📞 Telefone: ${formatarTelefoneExibicao(event.phone)}`);
  if (event.birthday) detailsParts.push(`🎂 Aniversário: ${format(new Date(event.birthday), 'dd/MM/yyyy')}`);
  if (event.cpf_cliente) detailsParts.push(`📄 CPF: ${event.cpf_cliente}`);
  if (event.endereco_cliente) detailsParts.push(`🏠 Endereço: ${event.endereco_cliente}`);
  if (event.status) detailsParts.push(`Status: ${statusMap[event.status] || event.status}`);

  // Financeiro
  detailsParts.push(`\n--- Detalhes Financeiros ---`);
  detailsParts.push(`💰 Valor Total: R$ ${event.totalValue?.toFixed(2) ?? '0.00'}`);
  detailsParts.push(`💵 Entrada: R$ ${event.downPayment?.toFixed(2) ?? '0.00'}`);
  detailsParts.push(`⏳ Restante: R$ ${event.remainingValue?.toFixed(2) ?? '0.00'}`);

  // Notas
  if (event.notes) {
    detailsParts.push(`\n--- Observações ---`);
    detailsParts.push(event.notes);
  }

  const params = new URLSearchParams({
    text: `${event.clientName} - ${event.eventType}`,
    dates: `${formatTimeForGoogle(startTime)}/${formatTimeForGoogle(endTime)}`,
    location: event.location,
    details: detailsParts.join('\n')
  });

  return `${G_CAL_URL}&${params.toString()}`;
};


const EventCardActions: React.FC<EventCardActionsProps> = React.memo(({
  event,
  hasPendingPayment,
  onSendReminder,
  onRegisterPayment,
  onGenerateReceipt,
  onStatusChange
}) => {
  const { isAdmin } = useUserRole(); // Usar o hook para obter a role
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // A verificação navigator.share deve estar dentro de um useEffect
    // para garantir que o código do lado do cliente seja executado.
    if (typeof window !== 'undefined' && navigator.share) {
      setCanShare(true);
    }
  }, []);

  const handleShare = async () => {
    if (!navigator.share) {
      console.error("A API de compartilhamento não é suportada neste navegador.");
      return;
    }

    const shareData = {
      title: `Evento: ${event.eventType} - ${event.clientName}`,
      text: `Detalhes do evento de ${event.clientName} (${event.eventType}) no dia ${format(event.date, 'dd/MM/yyyy')} às ${event.time}. Local: ${event.location || 'A definir'}.`,
      url: window.location.href, // Idealmente, esta seria uma URL pública para o evento
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      // O erro AbortError é comum se o usuário fechar a caixa de diálogo de compartilhamento
      if ((err as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
    }
  };

  return (
    <div className="mt-0 pt-0 sm:mt-3 sm:pt-3 border-t event-card-actions">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        {/* Botão de enviar lembrete - Visível apenas para admins */}
        {isAdmin && !event.reminderSent && event.status !== 'completed' && event.status !== 'canceled' && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onSendReminder} 
            className="action-button w-full sm:w-auto"
            style={{ backgroundColor: '#DC2626', color: 'white' }} // Estilo para admin
          >
            <Bell className="mr-1 h-4 w-4" /> Enviar Lembrete
          </Button>
        )}
        
        {/* Botão de registrar pagamento */}
        {hasPendingPayment && event.status !== 'canceled' && (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-amber-600 action-button w-full sm:w-auto"
            onClick={onRegisterPayment}
          >
            <DollarSign className="mr-1 h-4 w-4" /> Registrar Pagamento
          </Button>
        )}
        
        {/* Botão de gerar recibo */}
        <Button size="sm" variant="outline" onClick={onGenerateReceipt} className="action-button w-full sm:w-auto">
          <Receipt className="mr-1 h-4 w-4" /> Gerar Recibo
        </Button>

        {/* Botão de compartilhar */}
        {canShare && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleShare} 
            className="action-button w-full sm:w-auto"
          >
            <Share2 className="mr-1 h-4 w-4" /> Compartilhar
          </Button>
        )}

        {/* Botão de adicionar ao Google Agenda */}
        <a 
          href={generateGoogleCalendarUrl(event)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full sm:w-auto"
        >
          <Button size="sm" variant="outline" className="action-button w-full">
            <img 
              src="https://img.icons8.com/color/48/google-calendar--v2.png" 
              alt="Adicionar ao Google Agenda" 
              className="mr-2 h-5 w-5" 
            />
            Google Agenda
          </Button>
        </a>
        
        {/* Seletor de status */}
        <select 
          className="h-9 rounded-md border border-input text-white bg-[#3c83f6] hover:bg-[#3371d6] px-3 py-1 text-sm shadow-sm w-full sm:w-auto"
          value={event.status}
          onChange={(e) => onStatusChange(event.id, e.target.value as EventStatus)}
        >
          <option value="upcoming">Próximo</option>
          <option value="confirmed">Confirmado</option>
          <option value="pending">Aguardando</option>
          <option value="completed">Concluído</option>
          <option value="canceled">Cancelado</option>
        </select>
      </div>
    </div>
  );
});

// Função de comparação customizada para EventCardActions
const areActionsPropsEqual = (prevProps: EventCardActionsProps, nextProps: EventCardActionsProps): boolean => {
  const prevEvent = prevProps.event;
  const nextEvent = nextProps.event;
  
  return (
    prevEvent.id === nextEvent.id &&
    prevEvent.status === nextEvent.status &&
    prevEvent.reminderSent === nextEvent.reminderSent &&
    prevEvent.clientName === nextEvent.clientName &&
    prevEvent.eventType === nextEvent.eventType &&
    prevEvent.date === nextEvent.date &&
    prevEvent.time === nextEvent.time &&
    prevEvent.location === nextEvent.location &&
    prevEvent.phone === nextEvent.phone &&
    prevEvent.totalValue === nextEvent.totalValue &&
    prevEvent.downPayment === nextEvent.downPayment &&
    prevEvent.remainingValue === nextEvent.remainingValue &&
    prevEvent.notes === nextEvent.notes &&
    prevProps.hasPendingPayment === nextProps.hasPendingPayment &&
    prevProps.onSendReminder === nextProps.onSendReminder &&
    prevProps.onRegisterPayment === nextProps.onRegisterPayment &&
    prevProps.onGenerateReceipt === nextProps.onGenerateReceipt &&
    prevProps.onStatusChange === nextProps.onStatusChange
  );
};

export default React.memo(EventCardActions, areActionsPropsEqual);