
import { useState, useEffect } from 'react';
import { supabase, initializeDatabase } from "@/integrations/supabase/client";
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
  }, [isAuthenticated, toast]);

  const checkTables = async () => {
    setIsLoading(true);
    try {
      console.log('Verificando tabelas...');
      
      // Verificar tabela mensagem_agenda tentando buscar dados diretamente
      const { data: mensagemData, error: mensagemError } = await supabase
        .from('mensagem_agenda')
        .select('*')
        .limit(1);
      
      console.log('Verificação de mensagem_agenda:', { mensagemData, mensagemError });
      
      if (!mensagemError) {
        console.log('Tabela mensagem_agenda existe e está acessível');
        setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
        fetchMensagens();
      } else {
        console.error('Erro ao acessar mensagem_agenda:', mensagemError);
        setTablesExist(prev => ({ ...prev, mensagemAgenda: false }));
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

  const fetchMensagens = async () => {
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
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      tablesExist.mensagemAgenda ? fetchMensagens() : Promise.resolve()
    ]).finally(() => {
      setIsRefreshing(false);
      toast({
        title: "Atualizado",
        description: "As mensagens foram atualizadas com sucesso"
      });
    });
  };

  return {
    mensagens,
    isLoading,
    isRefreshing,
    tablesExist,
    checkTables,
    handleRefresh
  };
};
