
import { useState, useEffect, useCallback } from 'react';
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
  const [initAttempts, setInitAttempts] = useState(0);
  const { toast } = useToast();

  // Função para verificar se a tabela mensagem_agenda existe
  const checkTableExists = useCallback(async () => {
    try {
      console.log('Verificando se a tabela mensagem_agenda existe...');
      const { data, error } = await supabase
        .from('mensagem_agenda')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar tabela:', error);
        return false;
      }
      console.log('Verificação de tabela bem-sucedida', data);
      return true;
    } catch (e) {
      console.error('Exceção ao verificar tabela:', e);
      return false;
    }
  }, []);

  // Função para buscar mensagens do Supabase
  const fetchMensagens = useCallback(async () => {
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
  }, [toast]);

  // Efeito inicial para inicializar o banco de dados e verificar as tabelas
  useEffect(() => {
    if (isAuthenticated) {
      // Inicializar o banco de dados
      const init = async () => {
        try {
          const tableExists = await checkTableExists();
          
          if (tableExists) {
            console.log('Tabela já existe, buscando mensagens...');
            setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
            fetchMensagens();
          } else if (initAttempts < 3) {
            console.log(`Tentativa ${initAttempts + 1} de inicializar o banco de dados...`);
            const initialized = await initializeDatabase();
            
            if (initialized) {
              const tableNowExists = await checkTableExists();
              
              if (tableNowExists) {
                setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
                fetchMensagens();
              } else {
                setTablesExist(prev => ({ ...prev, mensagemAgenda: false }));
                setIsLoading(false);
                toast({
                  title: "Tabela em processamento",
                  description: "A tabela foi criada mas ainda está sendo processada. Tente novamente em instantes.",
                  variant: "destructive",
                });
              }
            } else {
              setTablesExist(prev => ({ ...prev, mensagemAgenda: false }));
              setIsLoading(false);
            }
            
            setInitAttempts(prev => prev + 1);
          } else {
            setTablesExist(prev => ({ ...prev, mensagemAgenda: false }));
            setIsLoading(false);
            toast({
              title: "Problema na criação da tabela",
              description: "Não foi possível criar a tabela após várias tentativas.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Erro na inicialização:', error);
          setIsLoading(false);
          setTablesExist(prev => ({ ...prev, mensagemAgenda: false }));
        }
      };
      
      init();
    }
  }, [isAuthenticated, initAttempts, checkTableExists, fetchMensagens, toast]);

  // Configurar escuta de tempo real para atualizações na tabela
  useEffect(() => {
    if (isAuthenticated && tablesExist.mensagemAgenda) {
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
  }, [isAuthenticated, tablesExist.mensagemAgenda, toast]);

  // Função para atualizar manualmente as mensagens
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    if (!tablesExist.mensagemAgenda) {
      checkTableExists().then(exists => {
        if (exists) {
          setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
          fetchMensagens().finally(() => {
            setIsRefreshing(false);
            toast({
              title: "Tabela encontrada",
              description: "A tabela de mensagens foi encontrada e os dados foram carregados."
            });
          });
        } else {
          initializeDatabase().then(initialized => {
            if (initialized) {
              checkTableExists().then(tableExists => {
                if (tableExists) {
                  setTablesExist(prev => ({ ...prev, mensagemAgenda: true }));
                  fetchMensagens().finally(() => {
                    setIsRefreshing(false);
                  });
                } else {
                  setIsRefreshing(false);
                  toast({
                    title: "Tabela em processamento",
                    description: "A tabela foi criada mas ainda está sendo processada. Tente novamente em instantes.",
                    variant: "destructive",
                  });
                }
              });
            } else {
              setIsRefreshing(false);
              toast({
                title: "Erro na criação da tabela",
                description: "Não foi possível criar a tabela. Verifique o console para mais detalhes.",
                variant: "destructive",
              });
            }
          });
        }
      });
    } else {
      fetchMensagens().finally(() => {
        setIsRefreshing(false);
        toast({
          title: "Atualizado",
          description: "As mensagens foram atualizadas com sucesso"
        });
      });
    }
  }, [tablesExist.mensagemAgenda, checkTableExists, fetchMensagens, toast]);

  return {
    mensagens,
    isLoading,
    isRefreshing,
    tablesExist,
    handleRefresh
  };
};
