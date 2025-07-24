import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface EventDetailsSectionProps {
  eventDate: Date;
  setEventDate: (date: Date) => void;
  location: string;
  setLocation: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  sendReminder: boolean;
  setSendReminder: (value: boolean) => void;
}

export const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({
  eventDate,
  setEventDate,
  location,
  setLocation,
  notes,
  setNotes,
  sendReminder,
  setSendReminder
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Data e Hora do Evento</label>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !eventDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {eventDate ? (
                  format(eventDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={eventDate}
                onSelect={(date) => {
                  if (date) {
                    const newDate = new Date(date);
                    if (eventDate) {
                      newDate.setHours(eventDate.getHours(), eventDate.getMinutes());
                    }
                    setEventDate(newDate);
                  }
                }}
                initialFocus
                className="rounded-md border"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-4">
          <Input 
            type="time" 
            value={eventDate ? format(eventDate, "HH:mm") : ''} 
            onChange={(e) => {
              if (e.target.value) {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date(eventDate);
                newDate.setHours(hours, minutes);
                setEventDate(newDate);
              }
            }} 
            required 
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium">Local do Evento</label>
        <Input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          required 
          placeholder="Digite o local do evento"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium">Observações</label>
        <textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          className="w-full p-2 border rounded-md h-[200px] text-black dark:text-white bg-white dark:bg-gray-800"
          placeholder="Adicione observações sobre o evento"
          style={{ resize: 'none' }}
        />
      </div>

      <div className="flex items-center space-x-2 mt-2">
        <Switch 
          id="send-reminder" 
          checked={sendReminder}
          onCheckedChange={setSendReminder}
        />
        <Label htmlFor="send-reminder" className="text-sm">Lembrete 2 dias antes</Label>
      </div>
    </div>
  );
}; 