import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AgendaCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  eventDates: { date: Date; color?: string }[];
}

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  selectedDate,
  onDateSelect,
  eventDates
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default AgendaCalendar;