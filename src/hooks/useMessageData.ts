
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

interface MensagemDeContato {
  id: string;
  criado_em: string;
  nome: string;
  e_mail: string;
  telefone: string;
  mensagem: string;
}

// Union type for all message types
type Message = ContactMessage | MensagemDeContato;

export const useMessageData = (isAuthenticated: boolean) => {
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableExists, setTableExists] = useState(false);
  const { toast } = useToast();

  // Função para buscar mensagens de todas as tabelas disponíveis
  const fetchAllMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      let allMessages: Message[] = [];
      let contactMessagesExists = false;
      let mensagensDeContatoExists = false;

      // Check which tables exist
      contactMessagesExists = await checkTableExists('contact_messages');
      mensagensDeContatoExists = await checkTableExists('mensagens_de_contato');

      console.log('Tables status:', { contactMessagesExists, mensagensDeContatoExists });
      
      // Set tableExists to true if either table exists
      setTableExists(contactMessagesExists || mensagensDeContatoExists);
      
      if (!contactMessagesExists && !mensagensDeContatoExists) {
        setIsLoading(false);
        return;
      }
      
      // Fetch from contact_messages if it exists
      if (contactMessagesExists) {
        console.log('Fetching from contact_messages...');
        const { data: contactData, error: contactError } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (contactError) {
          console.error('Error fetching from contact_messages:', contactError);
        } else if (contactData) {
          console.log(`Received ${contactData.length} messages from contact_messages`);
          allMessages = [...allMessages, ...contactData];
        }
      }
      
      // Fetch from mensagens_de_contato if it exists
      if (mensagensDeContatoExists) {
        console.log('Fetching from mensagens_de_contato...');
        const { data: mensagensData, error: mensagensError } = await supabase
          .from('mensagens_de_contato')
          .select('*')
          .order('criado_em', { ascending: false });
          
        if (mensagensError) {
          console.error('Error fetching from mensagens_de_contato:', mensagensError);
        } else if (mensagensData) {
          console.log(`Received ${mensagensData.length} messages from mensagens_de_contato`);
          
          // Map the mensagens_de_contato fields to match contact_messages format for display
          const mappedMensagens = mensagensData.map(msg => ({
            id: msg.id,
            created_at: msg.criado_em,
            name: msg.nome,
            email: msg.e_mail,
            phone: msg.telefone,
            message: msg.mensagem
          })) as ContactMessage[];
          
          allMessages = [...allMessages, ...mappedMensagens];
        }
      }
      
      // Sort all messages by date (newest first)
      allMessages.sort((a, b) => {
        const dateA = a.hasOwnProperty('created_at') 
          ? (a as ContactMessage).created_at 
          : (a as MensagemDeContato).criado_em;
        const dateB = b.hasOwnProperty('created_at') 
          ? (b as ContactMessage).created_at 
          : (b as MensagemDeContato).criado_em;
        
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      console.log('All messages sorted:', allMessages);
      setMensagens(allMessages);
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

  // Create table function remains the same
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
        
        setTableExists(contactMessagesExists);
        
        if (contactMessagesExists) {
          fetchAllMessages();
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

  // Configure real-time listeners for both tables
  useEffect(() => {
    if (isAuthenticated && tableExists) {
      // Listen for changes on contact_messages
      const contactMessagesChannel = supabase
        .channel('contact-messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'contact_messages'
          },
          (payload) => {
            console.log('Nova mensagem em contact_messages recebida:', payload);
            const newMessage = payload.new as ContactMessage;
            setMensagens(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe();

      // Listen for changes on mensagens_de_contato
      const mensagensDeContatoChannel = supabase
        .channel('mensagens-contato-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensagens_de_contato'
          },
          (payload) => {
            console.log('Nova mensagem em mensagens_de_contato recebida:', payload);
            const newMessage = payload.new as MensagemDeContato;
            
            // Convert to the standard format
            const mappedMessage = {
              id: newMessage.id,
              created_at: newMessage.criado_em,
              name: newMessage.nome,
              email: newMessage.e_mail,
              phone: newMessage.telefone,
              message: newMessage.mensagem
            };
            
            setMensagens(prevMessages => [mappedMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem de ${newMessage.nome}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(contactMessagesChannel);
        supabase.removeChannel(mensagensDeContatoChannel);
      };
    }
  }, [isAuthenticated, tableExists, toast]);

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
