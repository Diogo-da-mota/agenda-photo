import { ReactNode } from 'react';

// Event status colors
export const eventStatusColors = {
  past: "bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-800",
  upcoming: "bg-amber-100 border-amber-300 dark:bg-amber-900/20 dark:border-amber-800",
  confirmed: "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800",
  pending: "bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800",
  completed: "bg-purple-100 border-purple-300 dark:bg-purple-900/20 dark:border-purple-800",
  canceled: "bg-gray-100 border-gray-300 dark:bg-gray-900/20 dark:border-gray-800",
};

// Event types
export const eventTypes = ["Casamento", "Aniversário", "Ensaio", "Corporativo", "Outro"];

// Event status type
export type EventStatus = 'past' | 'upcoming' | 'confirmed' | 'pending' | 'completed' | 'canceled';

// Valores financeiros parciais para atualização
export interface PartialEventFinancials {
  totalValue?: number;
  downPayment?: number;
  remainingValue?: number;
}

// Event interface
export interface Event {
  id: string;
  clientName: string;
  phone: string;
  birthday: Date | null;
  eventType: string;
  date: Date;
  time: string;
  location: string;
  totalValue: number;
  downPayment: number;
  remainingValue: number;
  notes: string;
  status: EventStatus;
  reminderSent: boolean;
  cpf_cliente?: string;
  endereco_cliente?: string;
}

// Props for EventForm component
export interface EventFormProps {
  onClose: () => void;
  event?: Event | null;
  onEventCreated?: (event: Event) => void;
}

// Props for RescheduleForm component
export interface RescheduleFormProps {
  event: Event;
  onClose: () => void;
  onReschedule?: (eventId: string, newDate: Date) => void;
}

// Props for EventCard component
export interface EventCardProps {
  event: Event;
  onStatusChange: (eventId: string, newStatus: EventStatus, financials?: PartialEventFinancials) => void;
  onReschedule: (eventId: string, newDate: Date) => void;
  onSendReminder: (eventId: string) => void;
  onGenerateReceipt: (eventId: string) => void;
  onDelete?: (eventId: string) => Promise<void>;
  onEventUpdate?: (updatedEvent: Event) => void;
}
