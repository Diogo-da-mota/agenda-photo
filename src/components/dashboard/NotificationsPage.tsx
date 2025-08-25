
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateSampleNotifications, 
  filterNotifications 
} from './notifications/notificationUtils';
import { Notification } from './notifications/types';
import NotificationFilters from './notifications/NotificationFilters';
import NotificationList from './notifications/NotificationList';
import NotificationStats from './notifications/NotificationStats';
import NotificationSearch from './notifications/NotificationSearch';

const NotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  
  // Carregar notificações de exemplo
  useEffect(() => {
    setNotifications(generateSampleNotifications());
  }, []);
  
  // Filtrar notificações baseado nos filtros atuais
  const filteredNotifications = filterNotifications(
    notifications,
    searchQuery,
    filterType,
    filterStatus,
    filterDate
  );
  
  // Contagens para estatísticas
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const eventCount = notifications.filter(n => n.type === 'event').length;
  const paymentCount = notifications.filter(n => n.type === 'payment').length;
  const systemCount = notifications.filter(n => 
    n.type === 'system' || n.type === 'reminder'
  ).length;
  const birthdayCount = notifications.filter(n => n.type === 'birthday').length;
  const dasmeiCount = notifications.filter(n => n.type === 'dasmei').length;
  
  // Marcar como lida
  const handleMarkAsRead = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );

  };
  
  // Excluir notificação
  const handleDelete = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );

  };
  
  // Redefinir filtros
  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterDate('all');

  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Centro de Notificações</h1>
      
      {/* Estatísticas */}
      <NotificationStats
        total={totalCount}
        unread={unreadCount}
        eventCount={eventCount}
        paymentCount={paymentCount}
        systemCount={systemCount}
        birthdayCount={birthdayCount}
        dasmeiCount={dasmeiCount}
      />
      
      {/* Filtros */}
      <NotificationFilters 
        totalCount={filteredNotifications.length}
        filterType={filterType}
        filterStatus={filterStatus}
        filterDate={filterDate}
        onFilterTypeChange={setFilterType}
        onFilterStatusChange={setFilterStatus}
        onFilterDateChange={setFilterDate}
        resetFilters={resetFilters}
      />
      
      {/* Pesquisa */}
      <NotificationSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Lista de notificações */}
      <NotificationList 
        notifications={filteredNotifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default NotificationsPage;
