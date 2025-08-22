import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AgendaCalendarProps {
  selectedDate: Date;
  onDateClick?: (date: Date | undefined) => void;
  onDateSelect?: (date: Date | undefined) => void;
  eventDates: { date: Date; color?: string }[];
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onDateClick,
  eventDates,
  currentMonth,
  currentYear,
  onMonthChange
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
          onSelect={onDateClick || onDateSelect}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
};

export default AgendaCalendar;