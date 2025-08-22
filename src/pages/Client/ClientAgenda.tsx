
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { CalendarIcon } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';

// Interface para eventos do cliente
interface ClientEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  photographer: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'upcoming' | 'past';
  totalValue: number;
  paidValue: number;
  remainingValue: number;
  notes?: string;
}

// Status color mapping para eventos
const statusColors = {
  completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  pending: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
  canceled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
};

// Status labels para eventos
const statusLabels = {
  completed: "Realizado",
  confirmed: "Confirmado",
  pending: "Aguardando",
  canceled: "Cancelado"
};



const ClientAgenda = () => {
  const { cliente, logout } = useClienteAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Função para lidar com cliques no calendário (calendário público simples)
  const handleDateClick = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };



  return (
    <div className="min-h-screen p-4" style={{backgroundColor: '#0f1729'}}>
      <div className="max-w-4xl mx-auto">
        {/* Calendário */}
        <div className="flex justify-center">
        <Card className="w-fit" style={{backgroundColor: '#0f1729'}}>
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateClick}
              className="border-0 pointer-events-auto text-white"
              locale={ptBR}
            />
            <div className="mt-4 text-xs text-gray-300">
              <p>• Calendário público para visualização</p>
              <p>• Selecione uma data para ver detalhes</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientAgenda;
