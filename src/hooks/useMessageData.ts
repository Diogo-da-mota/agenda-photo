
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MensagemAgenda {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

interface TablesExistState {
  mensagemAgenda: boolean;
}

export const useMessageData = (isAuthenticated: boolean) => {
  const [mensagens, setMensagens] = useState<MensagemAgenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tablesExist, setTablesExist] = useState<TablesExistState>({
    mensagemAgenda: false
  });
  const { toast } = useToast();

  // Function to check if the mensagem_agenda table exists
  const checkTableExists = async () => {
    try {
      console.log('Checking if mensagem_agenda table exists...');
      const { data, error } = await supabase
        .from('mensagem_agenda')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Error checking table:', error);
        return false;
      }
      console.log('Table check successful', data);
      return true;
    } catch (e) {
      console.error('Exception checking table:', e);
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Check if table exists first
      checkTableExists().then(exists => {
        if (exists) {
          setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
          fetchMensagens();
        } else {
          console.log('Table does not exist, showing message to user');
          setTablesExist(prev => ({ ...prev, mensagemAgenda: false }));
          setIsLoading(false);
          toast({
            title: "Tabela não encontrada",
            description: "A tabela de mensagens não foi encontrada no Supabase. Clique em 'Verificar novamente' para tentar novamente.",
            variant: "destructive",
          });
        }
      });
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    // Only set up realtime subscription if authenticated and table exists
    if (isAuthenticated && tablesExist.mensagemAgenda) {
      // Set up realtime subscription to mensagem_agenda table
      const channel = supabase
        .channel('mensagem-agenda-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensagem_agenda'
          },
          (payload) => {
            console.log('Nova mensagem recebida:', payload);
            const newMessage = payload.new as MensagemAgenda;
            setMensagens(prevMessages => [newMessage, ...prevMessages]);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição em mensagem_agenda:', status);
        });

      // Cleanup function
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, tablesExist.mensagemAgenda, toast]);

  const fetchMensagens = async () => {
    setIsLoading(true);
    try {
      console.log('Buscando mensagens...');
      const { data, error } = await supabase
        .from('mensagem_agenda')
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
  };

  const handleRefresh = () => {
    if (!tablesExist.mensagemAgenda) {
      // Re-check if table exists
      checkTableExists().then(exists => {
        if (exists) {
          setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
          fetchMensagens();
          toast({
            title: "Tabela encontrada",
            description: "A tabela de mensagens foi encontrada e os dados foram carregados."
          });
        } else {
          toast({
            title: "Tabela não encontrada",
            description: "A tabela de mensagens ainda não existe no Supabase. Ela foi criada com sucesso. Tente novamente."
          });
        }
      });
    } else {
      setIsRefreshing(true);
      fetchMensagens().finally(() => {
        setIsRefreshing(false);
        toast({
          title: "Atualizado",
          description: "As mensagens foram atualizadas com sucesso"
        });
      });
    }
  };

  return {
    mensagens,
    isLoading,
    isRefreshing,
    tablesExist,
    handleRefresh
  };
};
