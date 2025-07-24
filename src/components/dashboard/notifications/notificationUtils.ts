
import { addDays, isAfter, isBefore, isToday, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns';
import { Notification } from './types';

// Função para gerar notificações de exemplo
export const generateSampleNotifications = (): Notification[] => {
  const today = new Date();
  
  return [
    {
      id: 1,
      type: 'event',
      title: 'Casamento hoje: João e Maria',
      description: 'O casamento acontecerá às 16h no Espaço Verde.',
      date: today,
      read: false
    },
    {
      id: 2,
      type: 'payment',
      title: 'Pagamento pendente',
      description: 'Carlos Oliveira ainda não realizou o pagamento do evento.',
      date: subDays(today, 2),
      read: false
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Confirmar horário',
      description: 'Lembre-se de confirmar o horário com o cliente para o ensaio de amanhã.',
      date: subDays(today, 1),
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'Backup realizado',
      description: 'O backup das suas fotos foi realizado com sucesso.',
      date: subDays(today, 3),
      read: true
    },
    {
      id: 5,
      type: 'event',
      title: 'Ensaio: Família Silva',
      description: 'Ensaio familiar agendado para amanhã às 10h no Parque Central.',
      date: addDays(today, 1),
      read: false
    },
    {
      id: 6,
      type: 'birthday',
      title: 'Aniversário de cliente',
      description: 'João Pereira faz aniversário hoje. Envie uma mensagem!',
      date: today,
      read: false
    },
    {
      id: 7,
      type: 'dasmei',
      title: 'DAS-MEI vencendo',
      description: 'Seu DAS-MEI vence em 5 dias. Não se esqueça de realizar o pagamento.',
      date: addDays(today, 5),
      read: false
    },
    {
      id: 8,
      type: 'system',
      title: 'Atualização disponível',
      description: 'Uma nova versão do sistema está disponível. Atualize quando puder.',
      date: subDays(today, 1),
      read: true
    },
    {
      id: 9,
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'O pagamento de R$ 850,00 de Ana Ferreira foi confirmado.',
      date: subDays(today, 4),
      read: true
    },
    {
      id: 10,
      type: 'event',
      title: 'Ensaio cancelado',
      description: 'O cliente Pedro Souza cancelou o ensaio agendado para amanhã.',
      date: today,
      read: false
    }
  ];
};

// Filtrar notificações baseado nos filtros selecionados
export const filterNotifications = (
  notifications: Notification[],
  searchQuery: string,
  filterType: string,
  filterStatus: string,
  filterDate: string
): Notification[] => {
  return notifications.filter(notification => {
    // Filtro de busca
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de tipo
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    // Filtro de status
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'read' && notification.read) || 
      (filterStatus === 'unread' && !notification.read);
    
    // Filtro de data
    let matchesDate = false;
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));
    const startWeek = startOfWeek(now);
    const startMonth = startOfMonth(now);
    
    if (filterDate === 'all') {
      matchesDate = true;
    } else if (filterDate === 'today') {
      matchesDate = isToday(notification.date);
    } else if (filterDate === 'yesterday') {
      matchesDate = 
        isAfter(notification.date, yesterday) && 
        isBefore(notification.date, today);
    } else if (filterDate === 'week') {
      matchesDate = isAfter(notification.date, startWeek);
    } else if (filterDate === 'month') {
      matchesDate = isAfter(notification.date, startMonth);
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });
};
