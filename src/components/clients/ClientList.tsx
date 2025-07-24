
import React from 'react';
import { Cliente } from '@/types/clients';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, Gift, Hash, DollarSign, Phone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

interface ClientListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string, nome: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clientes, onEdit, onDelete }) => {
  const isMobile = useIsMobile();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (isMobile) {
    // Visualização em Cards para Mobile
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {clientes.map(cliente => (
          <div key={cliente.id} className="bg-card p-5 rounded-lg border shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-card-foreground">{cliente.nome}</h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Phone size={12} className="mr-2" />
                  {cliente.telefone || 'Não informado'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cliente)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(cliente.id, cliente.nome)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar size={14} className="mr-2" />
                <span>Evento: {cliente.evento || 'Não informado'}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <DollarSign size={14} className="mr-2" />
                <span>Valor: {cliente.valor_evento ? `R$ ${cliente.valor_evento}` : 'N/A'}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar size={14} className="mr-2" />
                <span>Data Evento: {formatDate(cliente.data_evento)}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Gift size={14} className="mr-2" />
                <span>Nascimento: {formatDate(cliente.data_nascimento)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Visualização em Tabela para Desktop
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Tipo de Evento</TableHead>
            <TableHead>Valor do Evento</TableHead>
            <TableHead>Data do Evento</TableHead>
            <TableHead>Data de Nascimento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map(cliente => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.telefone || 'N/A'}</TableCell>
              <TableCell>
                {cliente.evento ? (
                  <Badge variant="outline">{cliente.evento}</Badge>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>{cliente.valor_evento ? `R$ ${cliente.valor_evento}` : '-'}</TableCell>
              <TableCell>{formatDate(cliente.data_evento)}</TableCell>
              <TableCell>{formatDate(cliente.data_nascimento)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cliente)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(cliente.id, cliente.nome)}>
                  <Trash2 size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientList;
