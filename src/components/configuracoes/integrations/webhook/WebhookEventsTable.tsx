
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Versão simplificada que substitui o WebhookEventsList removido
const WebhookEventsTable: React.FC = () => {
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium mb-2">Eventos Suportados</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-xs">client.created</TableCell>
              <TableCell>Quando um novo cliente é cadastrado</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs">project.updated</TableCell>
              <TableCell>Quando um projeto é atualizado</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-xs">appointment.created</TableCell>
              <TableCell>Quando um agendamento é criado</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WebhookEventsTable;
