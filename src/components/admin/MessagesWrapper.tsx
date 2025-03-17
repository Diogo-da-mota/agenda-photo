
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomerMessagesList from './CustomerMessagesList';
import { useMessageData } from '@/hooks/useMessageData';
import { useToast } from '@/hooks/use-toast';

interface MessagesWrapperProps {
  isAuthenticated: boolean;
}

const MessagesWrapper: React.FC<MessagesWrapperProps> = ({ isAuthenticated }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  const { 
    mensagens, 
    isLoading, 
    isRefreshing, 
    tableExists, 
    isCreatingTable, 
    createTable, 
    handleRefresh,
    deleteMessage,
    updateMessage
  } = useMessageData(isAuthenticated);

  // Set initialized after first load to prevent flickering
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);

  useEffect(() => {
    if (isAuthenticated) {
      // Perform refresh when component mounts
      console.log("Forcing initial refresh of messages");
      try {
        handleRefresh();
      } catch (error) {
        console.error("Error refreshing messages:", error);
        toast({
          title: "Erro",
          description: "Houve um erro ao atualizar as mensagens. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  }, [isAuthenticated]); // Only run when authentication status changes

  // Function to format date strings to local format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Only render when authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state while initializing or still loading
  if ((!isInitialized && isLoading) || (!isInitialized && tableExists)) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p>Carregando mensagens...</p>
      </div>
    );
  }

  return (
    <CustomerMessagesList
      tableExists={tableExists}
      mensagens={mensagens}
      formatDate={formatDate}
      checkTables={handleRefresh}
      createTable={createTable}
      isCreatingTable={isCreatingTable}
      deleteMessage={deleteMessage}
      updateMessage={updateMessage}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
    />
  );
};

export default MessagesWrapper;
