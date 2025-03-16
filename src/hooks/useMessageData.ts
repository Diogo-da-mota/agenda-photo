
import { useState, useEffect, useCallback } from 'react';
import { supabase, checkTableExists } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MensagemAgenda {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}

export const useMessageData = (isAuthenticated: boolean) => {
  const [mensagens, setMensagens] = useState<MensagemAgenda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tableExists, setTableExists] = useState(false);
  const { toast } = useToast();

  // Função para buscar mensagens do Supabase
  const fetchMensagens = useCallback(async () => {
    if (!tableExists) return;
    
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
  }, [tableExists, toast]);

  // Verificar se a tabela existe e buscar mensagens se existir
  const verifyTableAndFetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const exists = await checkTableExists('mensagem_agenda');
      setTableExists(exists);
      
      if (exists) {
        fetchMensagens();
      } else {
        setIsLoading(false);
        toast({
          title: "Tabela não encontrada",
          description: "A tabela de mensagens não foi encontrada. Certifique-se de que ela foi criada no Supabase.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar tabela:', error);
      setIsLoading(false);
    }
  }, [fetchMensagens, toast]);

  // Efeito inicial para verificar a tabela e buscar mensagens
  useEffect(() => {
    if (isAuthenticated) {
      verifyTableAndFetchData();
    }
  }, [isAuthenticated, verifyTableAndFetchData]);

  // Configurar escuta de tempo real para atualizações na tabela
  useEffect(() => {
    if (isAuthenticated && tableExists) {
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

      return () => {
        supabase.removeChannel(channel);
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
        description: tableExists ? "As mensagens foram atualizadas" : "A tabela ainda não está disponível"
      });
    });
  }, [verifyTableAndFetchData, tableExists, toast]);

  return {
    mensagens,
    isLoading,
    isRefreshing,
    tablesExist: { mensagemAgenda: tableExists },
    handleRefresh
  };
};
