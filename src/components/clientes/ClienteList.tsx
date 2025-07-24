
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Phone, Calendar, Cake, PartyPopper, DollarSign } from "lucide-react";
import { Cliente } from '@/services/clientService';
import { Card } from '@/components/ui/card';

interface ClienteListProps {
  clientes: Cliente[];
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (id: string, nome: string) => void;
}

const ClienteList: React.FC<ClienteListProps> = ({ clientes, onEdit, onDelete }) => {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
      </div>
    );
  }

  // Layout para dispositivos móveis
  const MobileLayout = () => (
    <div className="space-y-4">
      {clientes.map((cliente) => (
        <Card key={cliente.id} className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">{cliente.nome}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="px-1"
            >
              •••
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna Esquerda */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span className="text-sm">{cliente.telefone || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span className="text-sm">
                  {cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR') : "-"}
                </span>
              </div>
            </div>
            {/* Coluna Direita */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span>🎉</span>
                <span className="text-sm">{cliente.evento || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="text-sm">
                  {cliente.valor_evento ? 
                    new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(cliente.valor_evento) : 
                    "-"
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span className="text-sm">
                  {cliente.data_evento ? new Date(cliente.data_evento).toLocaleDateString('pt-BR') : "-"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Layout para desktop (mantido sem alterações)
  const DesktopLayout = () => (
    <div className="border rounded-md">
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
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nome}</TableCell>
              <TableCell>{cliente.telefone || "-"}</TableCell>
              <TableCell>{cliente.evento || "-"}</TableCell>
              <TableCell>
                {cliente.valor_evento ? 
                  new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(cliente.valor_evento) : 
                  "-"
                }
              </TableCell>
              <TableCell>{cliente.data_evento ? new Date(cliente.data_evento).toLocaleDateString('pt-BR') : "-"}</TableCell>
              <TableCell>{cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR') : "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(cliente)}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(cliente.id, cliente.nome)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout />
      </div>
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </>
  );
};

export default ClienteList;
