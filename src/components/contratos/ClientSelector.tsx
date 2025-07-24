import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ClientSelectorProps {
  events: any[];
  onSelect: (event: any) => void;
  className?: string;
  resetSelection?: boolean;
}

export function ClientSelector({ events, onSelect, className, resetSelection = false }: ClientSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Resetar seleção quando resetSelection mudar
  React.useEffect(() => {
    if (resetSelection) {
      setSelectedEvent(null);
    }
  }, [resetSelection]);

  // Filtrar e ordenar eventos
  const filteredAndSortedEvents = React.useMemo(() => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = events.filter(event => 
        event.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return [...filtered].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, searchTerm]);

  const handleSelect = (event: any) => {
    setSelectedEvent(event);
    setOpen(false);
    setSearchTerm(""); // Limpar busca ao selecionar
    onSelect(event);
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
          {selectedEvent ? selectedEvent.clientName : "Selecione um cliente"}
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
            {filteredAndSortedEvents.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                Nenhum cliente encontrado.
              </div>
            ) : (
              filteredAndSortedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleSelect(event)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedEvent?.id === event.id && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedEvent?.id === event.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{event.clientName}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.eventType} - {new Date(event.date).toLocaleDateString()}
                    </span>
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