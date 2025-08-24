import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EventCardDialogsProps } from './types';
import RescheduleForm from '../RescheduleForm';
import EventForm from '../EventForm';

const EventCardDialogs: React.FC<EventCardDialogsProps> = ({
  event,
  state,
  onStateChange,
  onEventUpdate,
  onReschedule,
  onDelete,
  paymentAmount,
  onPaymentAmountChange,
  onRegisterPayment,
  isProcessingPayment
}) => {
  return (
    <>
      {/* Diálogo de edição */}
      <Dialog 
        open={state.isEditDialogOpen} 
        onOpenChange={(open) => onStateChange({ isEditDialogOpen: open })}
      >
        <DialogContent className="sm:max-w-[600px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Modifique as informações do evento selecionado
            </DialogDescription>
          </DialogHeader>
          <EventForm 
            event={event} 
            onClose={() => onStateChange({ isEditDialogOpen: false })} 
            onEventCreated={onEventUpdate}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog 
        open={state.isDeleteDialogOpen} 
        onOpenChange={(open) => onStateChange({ isDeleteDialogOpen: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogDescription className="sr-only">
              Confirme a exclusão do evento
            </DialogDescription>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o evento "<strong>{event.clientName}</strong>"? 
              <br />
              Esta ação não pode ser desfeita e removerá também todas as transações financeiras relacionadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onStateChange({ isDeleteDialogOpen: false })} 
              disabled={state.isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDelete} 
              disabled={state.isDeleting}
            >
              {state.isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de reagendamento */}
      <Dialog 
        open={state.isRescheduleOpen} 
        onOpenChange={(open) => onStateChange({ isRescheduleOpen: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Evento</DialogTitle>
            <DialogDescription>
              Selecione uma nova data e horário para o evento
            </DialogDescription>
          </DialogHeader>
          <RescheduleForm 
            event={event} 
            onClose={() => onStateChange({ isRescheduleOpen: false })}
            onReschedule={onReschedule}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de pagamento */}
      <Dialog 
        open={state.isPaymentDialogOpen} 
        onOpenChange={(open) => onStateChange({ isPaymentDialogOpen: open })}
      >
        <DialogContent>
          <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
              <DialogDescription>
                Informe o valor do pagamento recebido. Valor restante atual: R$ {event.remainingValue.toFixed(2).replace('.', ',')}
              </DialogDescription>
            </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Valor do Pagamento</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                max={event.remainingValue}
                placeholder={`R$ ${event.remainingValue.toFixed(2).replace('.', ',')}`}
                value={paymentAmount}
                onChange={(e) => onPaymentAmountChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Digite o valor que o cliente está pagando agora
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onStateChange({ isPaymentDialogOpen: false })} 
              disabled={isProcessingPayment}
            >
              Cancelar
            </Button>
            <Button 
              onClick={onRegisterPayment} 
              disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              {isProcessingPayment ? "Processando..." : "Registrar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCardDialogs;
