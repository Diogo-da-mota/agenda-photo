
import React from 'react';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  Cake,
  FileText,
  X
} from 'lucide-react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Notification } from './types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  // Definir ícone com base no tipo de notificação
  let Icon = Bell;
  let iconColor = "text-gray-600";
  
  switch (notification.type) {
    case 'event':
      Icon = Calendar;
      iconColor = "text-blue-500";
      break;
    case 'payment':
      Icon = DollarSign;
      iconColor = "text-green-500";
      break;
    case 'reminder':
      Icon = Clock;
      iconColor = "text-amber-500";
      break;
    case 'system':
      Icon = AlertTriangle;
      iconColor = "text-purple-500";
      break;
    case 'birthday':
      Icon = Cake;
      iconColor = "text-pink-500";
      break;
    case 'dasmei':
      Icon = FileText; 
      iconColor = "text-indigo-500";
      break;
  }

  return (
    <Card className={`mb-3 relative overflow-hidden ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
      <div className="p-4">
        <div className="flex gap-3">
          <div className={`mt-0.5 ${iconColor}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium">{notification.title}</h4>
              <span className="text-xs text-gray-500">
                {isToday(notification.date) 
                  ? `Hoje, ${format(notification.date, "HH:mm")}`
                  : format(notification.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.description}
            </p>
            
            <div className="flex justify-between items-center mt-3">
              <div>
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    Marcar como lida
                  </Button>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500"
                onClick={() => onDelete(notification.id)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationItem;
