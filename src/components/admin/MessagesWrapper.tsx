
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomerMessagesList from './CustomerMessagesList';
import { useMessageData } from '@/hooks/useMessageData';

interface MessagesWrapperProps {
  isAuthenticated: boolean;
}

const MessagesWrapper: React.FC<MessagesWrapperProps> = ({ isAuthenticated }) => {
  const { 
    mensagens, 
    isLoading, 
    isRefreshing, 
    tableExists, 
    isCreatingTable, 
    createTable, 
    handleRefresh,
    deleteMessage
  } = useMessageData(isAuthenticated);

  // Function to format date strings to local format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <CustomerMessagesList
      tableExists={tableExists}
      mensagens={mensagens}
      formatDate={formatDate}
      checkTables={handleRefresh}
      createTable={createTable}
      isCreatingTable={isCreatingTable}
      deleteMessage={deleteMessage}
    />
  );
};

export default MessagesWrapper;
