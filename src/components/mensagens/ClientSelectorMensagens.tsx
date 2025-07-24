import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Cliente } from '@/services/clientService';

interface ClientSelectorMensagensProps {
  clientes: Cliente[];
  onSelect: (cliente: Cliente | null) => void;
  className?: string;
  selectedCliente?: Cliente | null;
}

export function ClientSelectorMensagens({ clientes, onSelect, className, selectedCliente }: ClientSelectorMensagensProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrar e ordenar clientes
  const filteredAndSortedClientes = React.useMemo(() => {
    let filtered = clientes;
    
    if (searchTerm) {
      filtered = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.evento && cliente.evento.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Ordenar por data do evento crescente (mesma lógica da agenda)
    // Clientes com eventos mais próximos aparecem primeiro
    return [...filtered].sort((a, b) => {
      // Se ambos têm data de evento, ordenar por data crescente
      if (a.data_evento && b.data_evento) {
        const dateA = new Date(a.data_evento).getTime();
        const dateB = new Date(b.data_evento).getTime();
        return dateA - dateB;
      }
      
      // Se apenas um tem data de evento, priorizar o que tem data
      if (a.data_evento && !b.data_evento) return -1;
      if (!a.data_evento && b.data_evento) return 1;
      
      // Se nenhum tem data de evento, ordenar alfabeticamente
      return a.nome.localeCompare(b.nome);
    });
  }, [clientes, searchTerm]);

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente);
    setOpen(false);
    setSearchTerm(""); // Limpar busca ao selecionar
  };

  // Limpar busca quando fechar o popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCliente ? selectedCliente.nome : "Selecione um cliente"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 min-w-[300px] max-w-[500px]"
        side="bottom"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="w-full px-3 py-2 text-sm border border-input rounded-md mb-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div 
            className="max-h-[300px] overflow-y-auto border rounded-md"
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              backgroundColor: '#0F1729'
            }}
            onWheel={(e) => {
              // Permitir scroll livre
              e.stopPropagation();
            }}
          >
            {filteredAndSortedClientes.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Nenhum cliente encontrado.
              </div>
            ) : (
              filteredAndSortedClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => handleSelect(cliente)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedCliente?.id === cliente.id && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCliente?.id === cliente.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{cliente.nome}</span>
                    {cliente.evento && (
                      <span className="text-xs text-muted-foreground">
                        {cliente.evento} {cliente.data_evento && `- ${new Date(cliente.data_evento).toLocaleDateString()}`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}