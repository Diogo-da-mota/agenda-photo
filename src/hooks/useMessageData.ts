
import { useState, useEffect, useCallback } from 'react';
import { supabase, checkTableExists, createContactMessagesTable } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

export const useMessageData = (isAuthenticated: boolean) => {
  const [mensagens, setMensagens] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tablesExist, setTablesExist] = useState({
    mensagemAgenda: false,
    contactMessages: false
  });
  const { toast } = useToast();

  // Função para buscar mensagens do Supabase
  const fetchMensagens = useCallback(async () => {
    if (!tablesExist.contactMessages) return;
    
    setIsLoading(true);
    try {
      console.log('Buscando mensagens da tabela contact_messages...');
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Mensagens recebidas:', data);
      setMensagens(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tablesExist.contactMessages, toast]);

  // Nova função para criar a tabela diretamente
  const createTable = useCallback(async () => {
    setIsCreatingTable(true);
    try {
      const result = await createContactMessagesTable();
      
      if (result) {
        toast({
          title: "Sucesso",
          description: "Tabela criada com sucesso. Atualizando dados...",
        });
        
        // Verificamos novamente se a tabela agora existe
        const contactMessagesExists = await checkTableExists('contact_messages');
        
        setTablesExist(prev => ({
          ...prev,
          contactMessages: contactMessagesExists
        }));
        
        if (contactMessagesExists) {
          fetchMensagens();
        }
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar a tabela. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao criar tabela:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a tabela. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTable(false);
    }
  }, [fetchMensagens, toast]);

  // Verificar se as tabelas existem e buscar mensagens
  const verifyTableAndFetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Verificando se as tabelas existem...');
      
      // Verificar se as tabelas estão acessíveis
      const mensagemAgendaExists = await checkTableExists('mensagem_agenda');
      const contactMessagesExists = await checkTableExists('contact_messages');
      
      setTablesExist({
        mensagemAgenda: mensagemAgendaExists,
        contactMessages: contactMessagesExists
      });
      
      if (contactMessagesExists) {
        fetchMensagens();
      } else {
        setIsLoading(false);
        toast({
          title: "Tabela não encontrada",
          description: "A tabela de mensagens não foi encontrada. Clique em 'Criar tabela' para criá-la manualmente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      setIsLoading(false);
    }
  }, [fetchMensagens, toast]);

  // Efeito inicial para verificar a tabela e buscar mensagens
  useEffect(() => {
    if (isAuthenticated) {
      verifyTableAndFetchData();
    }
  }, [isAuthenticated, verifyTableAndFetchData]);

  // Configurar escuta de tempo real para atualizações na tabela contact_messages
  useEffect(() => {
    if (isAuthenticated && tablesExist.contactMessages) {
      const channel = supabase
        .channel('contact-messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'contact_messages'
          },
          (payload) => {
            console.log('Nova mensagem recebida:', payload);
            const newMessage = payload.new as ContactMessage;
            setMensagens(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em contact_messages:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, tablesExist.contactMessages, toast]);

  // Função para atualizar manualmente as mensagens
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    verifyTableAndFetchData().finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Verificação concluída",
        description: tablesExist.contactMessages 
          ? "As mensagens foram atualizadas" 
          : "A tabela ainda não existe. Use a opção 'Criar tabela' para criá-la manualmente."
      });
    });
  }, [verifyTableAndFetchData, tablesExist.contactMessages, toast]);

  return {
    mensagens,
    isLoading,
    isRefreshing,
    isCreatingTable,
    tablesExist,
    handleRefresh,
    createTable
  };
};
