
import { useState, useEffect, useCallback } from 'react';
import { checkTableExists } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StandardizedMessage } from "@/types/messages";
import { fetchAllMessagesFromTables } from "@/utils/messageUtils";
import { createMessagesTable } from "@/utils/tableManagement";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";

export const useMessageData = (isAuthenticated: boolean) => {
  const [mensagens, setMensagens] = useState<StandardizedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableExists, setTableExists] = useState(false);
  const { toast } = useToast();

  // Função para buscar mensagens de todas as tabelas disponíveis
  const fetchAllMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { messages, tableExists: tablesExist } = await fetchAllMessagesFromTables();
      
      setTableExists(tablesExist);
      setMensagens(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create table function
  const createTable = useCallback(async () => {
    setIsCreatingTable(true);
    try {
      await createMessagesTable(
        setTableExists,
        fetchAllMessages,
        toast
      );
    } finally {
      setIsCreatingTable(false);
    }
  }, [fetchAllMessages, toast]);

  // Verificar se a tabela existe e buscar mensagens
  const verifyTableAndFetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Verificando tabelas existentes...');
      
      // Check both tables
      const contactMessagesExists = await checkTableExists('contact_messages');
      const mensagensDeContatoExists = await checkTableExists('mensagens_de_contato');
      
      setTableExists(contactMessagesExists || mensagensDeContatoExists);
      
      if (contactMessagesExists || mensagensDeContatoExists) {
        fetchAllMessages();
      } else {
        setIsLoading(false);
        toast({
          title: "Tabela não encontrada",
          description: "Nenhuma tabela de mensagens foi encontrada. Clique em 'Criar tabela' para criar uma nova.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar tabela:', error);
      setIsLoading(false);
    }
  }, [fetchAllMessages, toast]);

  // Efeito inicial para verificar a tabela e buscar mensagens
  useEffect(() => {
    if (isAuthenticated) {
      verifyTableAndFetchData();
    }
  }, [isAuthenticated, verifyTableAndFetchData]);

  // Handle new message callback for realtime updates
  const handleNewMessage = useCallback((newMessage: StandardizedMessage) => {
    setMensagens(prevMessages => {
      // Verificar se a mensagem é uma atualização ou nova
      if (newMessage.isUpdate) {
        // Para atualizações, substituir a mensagem existente
        return prevMessages.map(msg => 
          (msg.id === newMessage.id) ? newMessage : 
          // Ou se tiver o mesmo email/telefone, remover (será substituído)
          ((newMessage.email && msg.email === newMessage.email) || 
           (newMessage.phone && msg.phone === newMessage.phone)) ? null : msg
        ).filter(Boolean) as StandardizedMessage[]; // Remove nulls
      }
      
      // Para mensagens novas, verificar se já existe um registro com mesmo email ou telefone
      const existingIndex = prevMessages.findIndex(msg => 
        (newMessage.email && msg.email === newMessage.email) || 
        (newMessage.phone && msg.phone === newMessage.phone)
      );
      
      if (existingIndex !== -1) {
        // Se existir, substituir o registro existente
        const updatedMessages = [...prevMessages];
        updatedMessages[existingIndex] = newMessage;
        return updatedMessages;
      }
      
      // Se não existir, adicionar no início
      return [newMessage, ...prevMessages];
    });
  }, []);

  // Configure real-time listeners for both tables
  useRealtimeMessages(isAuthenticated, tableExists, handleNewMessage);

  // Função para atualizar manualmente as mensagens
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    verifyTableAndFetchData().finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Verificação concluída",
        description: tableExists 
          ? "As mensagens foram atualizadas" 
          : "Nenhuma tabela de mensagens foi encontrada. Use a opção 'Criar tabela' para criar uma."
      });
    });
  }, [verifyTableAndFetchData, tableExists, toast]);

  return {
    mensagens,
    isLoading,
    isRefreshing,
    isCreatingTable,
    tableExists,
    handleRefresh,
    createTable
  };
};
