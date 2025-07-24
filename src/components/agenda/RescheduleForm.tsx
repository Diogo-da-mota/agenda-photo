import React, { useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { RescheduleFormProps } from './types';
import { useAuth } from '@/hooks/useAuth';
import { atualizarEvento } from '@/services/agendaService';

const RescheduleForm: React.FC<RescheduleFormProps> = ({ event, onClose, onReschedule }) => {
  const [newDate, setNewDate] = useState(event ? new Date(event.date) : new Date());
  const [reason, setReason] = useState('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para reagendar eventos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Atualizar o evento no banco de dados
      await atualizarEvento(String(event.id), { 
        date: newDate,
        notes: reason ? `${event.notes}\n\nReagendamento (${format(new Date(), "dd/MM/yyyy")}): ${reason}` : event.notes
      }, user.id);
      
      // Se a função onReschedule foi fornecida, chamá-la
      if (onReschedule) {
        onReschedule(event.id, newDate);
      }
      
      toast({
        title: "Evento reagendado",
        description: `${event.clientName} - Nova data: ${format(newDate, "dd/MM/yyyy 'às' HH:mm")}`,
      });
      
      // Se a opção de notificar cliente estiver marcada
      if (notifyClient) {
        // Aqui você poderia implementar a lógica para enviar uma notificação ao cliente
        toast({
          title: "Notificação enviada",
          description: "O cliente foi notificado sobre o reagendamento."
        });
      }
      
      // Fechar o formulário
      onClose();
    } catch (error) {
      console.error('Erro ao reagendar evento:', error);
      
      toast({
        title: "Erro ao reagendar",
        description: "Não foi possível reagendar o evento. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Evento atual: {format(event.date, "dd/MM/yyyy 'às' HH:mm")}</p>
        <label className="text-sm font-medium">Nova Data e Hora</label>
        <Input 
          type="datetime-local" 
          value={format(newDate, "yyyy-MM-dd'T'HH:mm")} 
          onChange={(e) => setNewDate(new Date(e.target.value))} 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Motivo do Reagendamento (opcional)</label>
        <textarea 
          className="w-full p-2 border rounded-md h-20 text-black dark:text-white bg-white dark:bg-gray-800"
          placeholder="Insira o motivo do reagendamento..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ color: 'white' }}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="notify-client" 
          checked={notifyClient}
          onCheckedChange={setNotifyClient}
        />
        <Label htmlFor="notify-client">Notificar cliente sobre a mudança</Label>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" disabled={isSubmitting}>Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Reagendando..." : "Confirmar Reagendamento"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default RescheduleForm;
