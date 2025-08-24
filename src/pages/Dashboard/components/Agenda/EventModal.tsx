import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EventForm from '@/components/agenda/EventForm';
import { Event } from '@/components/agenda/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: Event) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <EventForm onClose={onClose} onEventCreated={onEventCreated} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;