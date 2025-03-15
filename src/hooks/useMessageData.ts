
import { useState, useEffect } from 'react';
import { supabase, initializeDatabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerMessage {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

interface Message {
  id: number | string;
  user_id: string;
  content: string;
  created_at: string;
}

interface TablesExistState {
  customerMessages: boolean;
  messages: boolean;
}

export const useMessageData = (isAuthenticated: boolean) => {
  const [customerMessages, setCustomerMessages] = useState<CustomerMessage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tablesExist, setTablesExist] = useState<TablesExistState>({
    customerMessages: false,
    messages: false
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize database tables if needed
      initializeDatabase().then(() => {
        checkTables();
      }).catch(error => {
        console.error('Error initializing database:', error);
        toast({
          title: "Erro",
          description: "Erro ao inicializar o banco de dados",
          variant: "destructive",
        });
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only set up realtime subscription if authenticated
    if (isAuthenticated) {
      // Set up realtime subscription to messages table
      const channel = supabase
        .channel('mensagens-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'  // Use the TypeScript-defined table name
          },
          (payload) => {
            console.log('Nova mensagem recebida:', payload);
            const newMessage = payload.new as Message;
            setMessages(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem: ${newMessage.content.substring(0, 30)}${newMessage.content.length > 30 ? '...' : ''}`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em mensagens:', status);
        });

      // Set up realtime subscription to customer_messages table
      const customerChannel = supabase
        .channel('mensagens-do-cliente-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'customer_messages'  // Use the TypeScript-defined table name
          },
          (payload) => {
            console.log('Nova mensagem de cliente recebida:', payload);
            const newMessage = payload.new as CustomerMessage;
            setCustomerMessages(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem de cliente recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em mensagens_do_cliente:', status);
        });

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(customerChannel);
      };
    }
  }, [isAuthenticated, toast]);

  const checkTables = async () => {
    setIsLoading(true);
    try {
      console.log('Verificando tabelas...');
      
      // Verificar tabela customer_messages tentando buscar dados diretamente
      const { data: customerData, error: customerError } = await supabase
        .from('customer_messages')  // Use the TypeScript-defined table name
        .select('*')
        .limit(1);
      
      console.log('Verificação de customer_messages:', { customerData, customerError });
      
      if (!customerError) {
        console.log('Tabela customer_messages existe e está acessível');
        setTablesExist(prev => ({ ...prev, customerMessages: true }));
        fetchCustomerMessages();
      } else {
        console.error('Erro ao acessar customer_messages:', customerError);
        setTablesExist(prev => ({ ...prev, customerMessages: false }));
      }

      // Verificar tabela messages tentando buscar dados diretamente
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')  // Use the TypeScript-defined table name
        .select('*')
        .limit(1);
      
      console.log('Verificação de messages:', { messagesData, messagesError });
      
      if (!messagesError) {
        console.log('Tabela messages existe e está acessível');
        setTablesExist(prev => ({ ...prev, messages: true }));
        fetchMessages();
      } else {
        console.error('Erro ao acessar messages:', messagesError);
        setTablesExist(prev => ({ ...prev, messages: false }));
      }
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar tabelas no Supabase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerMessages = async () => {
    try {
      console.log('Buscando mensagens de clientes...');
      const { data, error } = await supabase
        .from('customer_messages')  // Use the TypeScript-defined table name
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Mensagens de clientes recebidas:', data);
      setCustomerMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens de clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens dos clientes",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Buscando mensagens...');
      const { data, error } = await supabase
        .from('messages')  // Use the TypeScript-defined table name
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      console.log('Mensagens recebidas:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      tablesExist.customerMessages ? fetchCustomerMessages() : Promise.resolve(),
      tablesExist.messages ? fetchMessages() : Promise.resolve()
    ]).finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Atualizado",
        description: "As mensagens foram atualizadas com sucesso"
      });
    });
  };

  return {
    customerMessages,
    messages,
    isLoading,
    isRefreshing,
    tablesExist,
    checkTables,
    handleRefresh
  };
};
