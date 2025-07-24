
import React from 'react';
import { Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { Notification } from './types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onDelete 
}) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Bell className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-1">Nenhuma notificação encontrada</h3>
        <p className="text-sm">Não existem notificações com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NotificationList;
