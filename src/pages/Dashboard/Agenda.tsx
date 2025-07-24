import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from 'lucide-react';

const Agenda = () => {
  return (
    <div className="space-y-6 p-4 pt-0">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Seus Eventos
          </CardTitle>
          <CardDescription>
            Gerencie seus eventos e compromissos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Agenda em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;