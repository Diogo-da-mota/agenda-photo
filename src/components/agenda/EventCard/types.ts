import { EventCardProps } from '../types';

// Re-exportar tipos principais
export * from '../types';

// Estados internos do EventCard
export interface EventCardState {
  isRescheduleOpen: boolean;
  isDeleteDialogOpen: boolean;
  isPaymentDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleting: boolean;
  paymentAmount: string;
  isProcessingPayment: boolean;
  isLoading: boolean;
  selectedEvent: any;
  shouldShowRegisterPaymentModal: boolean;
}

// Props para os sub-componentes
export interface EventCardHeaderProps {
  event: EventCardProps['event'];
  onEdit: () => void;
  onDelete: () => void;
  onReschedule: () => void;
  onMarkAsCompleted: () => void;
  isDeleting: boolean;
}

export interface EventCardContentProps {
  event: EventCardProps['event'];
}

export interface EventCardActionsProps {
  event: EventCardProps['event'];
  hasPendingPayment: boolean;
  onSendReminder: () => void;
  onRegisterPayment: () => void;
  onGenerateReceipt: () => void;
  onStatusChange: (id: string, status: any) => void;
}

export interface EventCardDialogsProps {
  event: EventCardProps['event'];
  state: EventCardState;
  onStateChange: (updates: Partial<EventCardState>) => void;
  onEventUpdate?: EventCardProps['onEventUpdate'];
  onReschedule: EventCardProps['onReschedule'];
  onDelete: () => Promise<void>;
  paymentAmount: string;
  onPaymentAmountChange: (value: string) => void;
  onRegisterPayment: () => Promise<void>;
  isProcessingPayment: boolean;
}
