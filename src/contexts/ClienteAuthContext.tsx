import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { hybridStorage } from '@/utils/storageUtils';

interface ClienteData {
  id: string;
  titulo: string;
  cpf_cliente: string;
  telefone?: string;
  endereco_cliente?: string;
  nome_completo: string; // Nome completo para busca de contratos
}

interface ClienteAuthContextType {
  cliente: ClienteData | null;
  isLoading: boolean;
  login: (nome: string, cpf: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const ClienteAuthContext = createContext<ClienteAuthContextType | undefined>(undefined);

export const useClienteAuth = () => {
  const context = useContext(ClienteAuthContext);
  if (context === undefined) {
    throw new Error('useClienteAuth deve ser usado dentro de um ClienteAuthProvider');
  }
  return context;
};

interface ClienteAuthProviderProps {
  children: ReactNode;
}

export const ClienteAuthProvider: React.FC<ClienteAuthProviderProps> = ({ children }) => {
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Iniciar como true para evitar logout no refresh

  // Carregar dados do storage ao inicializar
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadStoredAuth = async () => {
      try {
        // ✅ CORREÇÃO: Detectar Safari/macOS e aguardar inicialização
        const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
        const isMacOS = navigator.platform.includes('Mac');
        
        // ✅ CORREÇÃO: Delay específico para Safari
        if (isSafari || isMacOS) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const storedCliente = hybridStorage.getItem('cliente_auth');
        const storedLogado = hybridStorage.getItem('cliente_logado');

        if (storedCliente && storedLogado === 'true' && isMounted) {
          const clienteData = JSON.parse(storedCliente);
          
          // ✅ CORREÇÃO: Validar dados antes de definir
          if (clienteData.nome_completo && clienteData.cpf_cliente) {
            setCliente(clienteData);
          } else {
            // Limpar dados inválidos
            hybridStorage.removeItem('cliente_auth');
            hybridStorage.removeItem('cliente_logado');
          }
        }

      } catch (error) {
        console.error('[ClienteAuth] Erro ao carregar dados:', error);
        hybridStorage.removeItem('cliente_auth');
        hybridStorage.removeItem('cliente_logado');
      } finally {
        // ✅ CORREÇÃO CRÍTICA: Só definir loading false APÓS processamento completo
        if (isMounted) {
          const finalDelay = navigator.userAgent.includes('Safari') ? 50 : 0;
          
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          }, finalDelay);
        }
      }
    };

    loadStoredAuth();

    // Debug específico para macOS
    if (navigator.platform.includes('Mac')) {
      console.log('[macOS Debug] Auth carregado:', {
        cliente: !!cliente,
        nome: cliente?.nome_completo,
        timestamp: new Date().toISOString()
      });
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const login = async (nome: string, cpf: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Buscar EXCLUSIVAMENTE na tabela agenda_eventos para autenticação
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('id, titulo, cpf_cliente, telefone, endereco_cliente')
        .eq('cpf_cliente', cpf)
        .eq('titulo', nome) // Busca exata pelo nome
        .single();

      if (error || !data) {
        toast.error('Credenciais inválidas. Verifique o nome e CPF.');
        return false;
      }

      const clienteData: ClienteData = {
        id: data.id,
        titulo: data.titulo,
        cpf_cliente: data.cpf_cliente,
        telefone: data.telefone,
        endereco_cliente: data.endereco_cliente,
        nome_completo: nome // Armazenar o nome completo para busca de contratos
      };

      setCliente(clienteData);
      // Salvar no storage
      hybridStorage.setItem('cliente_auth', JSON.stringify(clienteData));
      hybridStorage.setItem('cliente_logado', 'true');
      
      console.log('[DEBUG ClienteAuth] Cliente definido após login:', {
        clienteData,
        storageSet: true
      });
      
      console.log('[ClienteAuth] Login realizado com sucesso:', {
        titulo: clienteData.titulo,
        nome: clienteData.nome_completo,
        strategy: hybridStorage.getStorageInfo().strategy,
        isSafari: hybridStorage.getStorageInfo().isSafari
      });
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      // Erro no login - logs removidos para produção
      toast.error('Erro interno. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCliente(null);
    // Limpar storage
    hybridStorage.removeItem('cliente_auth');
    hybridStorage.removeItem('cliente_logado');
    
    console.log('[ClienteAuth] Logout realizado:', {
      strategy: hybridStorage.getStorageInfo().strategy,
      isSafari: hybridStorage.getStorageInfo().isSafari
    });
    toast.success('Logout realizado com sucesso!');
  };

  const isAuthenticated = useMemo(() => {
    const loggedStatus = hybridStorage.getItem('cliente_logado');
    const hasValidClient = cliente && cliente.nome_completo && cliente.cpf_cliente;
    
    return loggedStatus === 'true' && !!hasValidClient;
  }, [cliente]);

  const value: ClienteAuthContextType = {
    cliente,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <ClienteAuthContext.Provider value={value}>
      {children}
    </ClienteAuthContext.Provider>
  );
};