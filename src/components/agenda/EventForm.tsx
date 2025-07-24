import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { EventFormProps } from './types';
import { useEventForm } from '@/hooks/useEventForm';
import { ClientInfoSection } from './EventForm/ClientInfoSection';
import { EventDetailsSection } from './EventForm/EventDetailsSection';
import { FinancialSection } from './EventForm/FinancialSection';

const EventForm: React.FC<EventFormProps> = ({ onClose, event = null, onEventCreated }) => {
  const formState = useEventForm({ event, onClose, onEventCreated });
  
  const {
    clientName,
    setClientName,
    phone,
    handlePhoneChange,
    birthday,
    setBirthday,
    birthdayText,
    setBirthdayText,
    eventType,
    setEventType,
    eventDate,
    setEventDate,
    location,
    setLocation,
    totalValueString,
    setTotalValueString,
    downPaymentString,
    setDownPaymentString,
    remainingValueString,
    notes,
    setNotes,
    sendReminder,
    setSendReminder,
    cpfCliente,
    setCpfCliente,
    enderecoCliente,
    setEnderecoCliente,
    isLoading,
    handleSubmit
  } = formState;



  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[80vh] overflow-y-auto pr-6">
      <ClientInfoSection 
        clientName={clientName}
        setClientName={setClientName}
        phone={phone}
        handlePhoneChange={handlePhoneChange}
        birthdayText={birthdayText}
        setBirthdayText={setBirthdayText}
        setBirthday={setBirthday}
        eventType={eventType}
        setEventType={setEventType}
        cpfCliente={cpfCliente}
        setCpfCliente={setCpfCliente}
        enderecoCliente={enderecoCliente}
        setEnderecoCliente={setEnderecoCliente}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EventDetailsSection 
          eventDate={eventDate}
          setEventDate={setEventDate}
          location={location}
          setLocation={setLocation}
          notes={notes}
          setNotes={setNotes}
          sendReminder={sendReminder}
          setSendReminder={setSendReminder}
        />

        <FinancialSection 
          totalValueString={totalValueString}
          setTotalValueString={setTotalValueString}
          downPaymentString={downPaymentString}
          setDownPaymentString={setDownPaymentString}
          remainingValueString={remainingValueString}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" disabled={isLoading}>Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default EventForm;
