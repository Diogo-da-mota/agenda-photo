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
    console.log('🔍 [DEBUG] Verificando localStorage ao inicializar...');
    const savedCliente = localStorage.getItem('cliente_auth');
    console.log('🔍 [DEBUG] Dados salvos no localStorage:', savedCliente);
    
    if (savedCliente) {
      try {
        const parsedCliente = JSON.parse(savedCliente);
        console.log('🔍 [DEBUG] Dados parseados do localStorage:', parsedCliente);
        console.log('🔍 [DEBUG] Campo titulo:', parsedCliente.titulo);
        setCliente(parsedCliente);
      } catch (error) {
        console.error('❌ [DEBUG] Erro ao carregar dados do cliente:', error);
        localStorage.removeItem('cliente_auth');
      }
    } else {
      console.log('🔍 [DEBUG] Nenhum dado encontrado no localStorage');
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

      console.log('✅ [DEBUG] Dados do cliente criados:', clienteData);
      console.log('✅ [DEBUG] Campo titulo no clienteData:', clienteData.titulo);
      
      setCliente(clienteData);
      const jsonString = JSON.stringify(clienteData);
      console.log('✅ [DEBUG] JSON a ser salvo no localStorage:', jsonString);
      localStorage.setItem('cliente_auth', jsonString);
      
      // Verificar se foi salvo corretamente
      const verificacao = localStorage.getItem('cliente_auth');
      console.log('✅ [DEBUG] Verificação após salvar:', verificacao);
      
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