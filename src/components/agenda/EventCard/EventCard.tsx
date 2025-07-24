import React from 'react';
import { Card } from '@/components/ui/card';
import { EventCardProps, eventStatusColors } from './types';
import { hasPendingPayment } from './utils';
import { useEventCardLogic } from './useEventCardLogic';
import EventCardHeader from './EventCardHeader';
import EventCardContent from './EventCardContent';
import EventCardActions from './EventCardActions';
import EventCardDialogs from './EventCardDialogs';

/**
 * Componente principal do EventCard refatorado
 * Coordena todos os sub-componentes e a lógica de negócio
 */
const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onStatusChange, 
  onReschedule, 
  onSendReminder, 
  onGenerateReceipt,
  onDelete,
  onEventUpdate
}) => {
  const {
    state,
    updateState,
    handleDeleteEvent,
    handleEventUpdated,
    handleRegisterPayment,
    handleProcessPayment,
    handleGenerateReceipt,
  } = useEventCardLogic(event, onEventUpdate);

  // Determinar a cor com base no status
  const statusColorClass = eventStatusColors[event.status];
  
  // Verificar se o evento tem pagamento pendente
  const eventHasPendingPayment = hasPendingPayment(event);

  // Handlers para os sub-componentes
  const handleSendReminder = () => {
    onSendReminder(event.id);
  };

  const handleMarkAsCompleted = () => {
    onStatusChange(event.id, 'completed');
  };

  const handlePaymentAmountChange = (value: string) => {
    updateState({ paymentAmount: value });
  };
  const handleDeleteConfirm = async () => {
    await handleDeleteEvent(onDelete);
  };

  return (
    <>
      <Card className={`mb-4 border-l-4 ${statusColorClass}`}>
        <EventCardHeader
          event={event}
          onEdit={() => updateState({ isEditDialogOpen: true })}
          onDelete={() => updateState({ isDeleteDialogOpen: true })}
          onReschedule={() => updateState({ isRescheduleOpen: true })}
          onMarkAsCompleted={handleMarkAsCompleted}
          isDeleting={state.isDeleting}
        />
        
        <EventCardContent event={event} />
        
        <EventCardActions
          event={event}
          hasPendingPayment={eventHasPendingPayment}
          onSendReminder={handleSendReminder}
          onRegisterPayment={handleRegisterPayment}
          onGenerateReceipt={handleGenerateReceipt}
          onStatusChange={onStatusChange}
        />
      </Card>

      <EventCardDialogs
        event={event}
        state={state}
        onStateChange={updateState}
        onEventUpdate={handleEventUpdated}
        onReschedule={onReschedule}
        onDelete={handleDeleteConfirm}
        paymentAmount={state.paymentAmount}
        onPaymentAmountChange={handlePaymentAmountChange}
        onRegisterPayment={handleProcessPayment}
        isProcessingPayment={state.isProcessingPayment}
      />
    </>
  );
};

export default EventCard;
