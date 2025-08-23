import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ptBR } from 'date-fns/locale';

interface AgendaCalendarProps {
  selectedDate: Date;
  onDateClick: (date: Date | undefined) => void;
  eventDates: { date: Date; color?: string }[];
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  selectedDate,
  onDateClick,
  eventDates,
  currentMonth,
  currentYear,
  onMonthChange
}) => {
  const handleMonthChange = (mes: Date) => {
    const novoMes = mes.getMonth();
    const novoAno = mes.getFullYear();
    if (novoMes !== currentMonth || novoAno !== currentYear) {
      onMonthChange(novoMes, novoAno);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Calendário
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateClick}
          className="border-0 pointer-events-auto w-full mobile-calendar"
          locale={ptBR}
          eventDates={eventDates}
          onMonthChange={handleMonthChange}
        />
      </CardContent>
    </Card>
  );
};

export default AgendaCalendar;