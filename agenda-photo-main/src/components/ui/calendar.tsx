import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  eventDates?: {
    date: Date;
    color?: string;
  }[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  eventDates = [],
  ...props
}: CalendarProps) {
  // Função para verificar se um dia tem eventos
  const hasDayEvent = (day: Date) => {
    return eventDates.find(eventDate => 
      format(eventDate.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  // Função para personalizar a renderização dos dias
  const modifiersStyles: Record<string, React.CSSProperties> = {};
  
  // Criar um modificador para cada dia com evento
  const modifiers: Record<string, (date: Date) => boolean> = {};
  eventDates.forEach((eventDate, index) => {
    const key = `event-day-${index}`;
    modifiers[key] = (date) => 
      format(eventDate.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    
    // Definir o estilo para este modificador com ajustes para mobile
    modifiersStyles[key] = {
      color: 'white',
      backgroundColor: eventDate.color || '#1f2937', // Mudança de azul claro para cinza escuro
      borderRadius: '9999px', // Usando 9999px para garantir forma circular perfeita
      width: '32px', // Largura fixa
      height: '32px', // Altura fixa
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
    };
  });

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-white text-black",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
