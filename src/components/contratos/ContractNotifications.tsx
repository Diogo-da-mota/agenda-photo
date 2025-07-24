import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContractNotificationsProps {
  pendingCount: number;
  onSendReminders: () => void;
}

export const ContractNotifications: React.FC<ContractNotificationsProps> = ({ 
  pendingCount, 
  onSendReminders 
}) => {
  if (pendingCount === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Bell size={16} />
          <span>Notificações</span>
          <Badge className="absolute -top-2 -right-2 px-1.5 h-5 bg-red-500">
            {pendingCount}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onSendReminders}>
          Enviar lembretes automáticos
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          {pendingCount} contratos pendentes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
