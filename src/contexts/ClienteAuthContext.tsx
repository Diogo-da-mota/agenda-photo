import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

  // Verificar se há dados do cliente no localStorage ao inicializar
  useEffect(() => {
    const savedCliente = localStorage.getItem('cliente_auth');
    if (savedCliente) {
      try {
        setCliente(JSON.parse(savedCliente));
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
        localStorage.removeItem('cliente_auth');
      }
    }
    // Definir loading como false após verificar o localStorage
    setIsLoading(false);
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
      localStorage.setItem('cliente_auth', JSON.stringify(clienteData));
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro interno. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCliente(null);
    localStorage.removeItem('cliente_auth');
    toast.success('Logout realizado com sucesso!');
  };

  const isAuthenticated = !!cliente;

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