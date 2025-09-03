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
    console.log('🔍 [DEBUG-AUTH] Iniciando verificação do localStorage');
    console.log('🔍 [DEBUG-AUTH] Platform:', navigator.platform);
    console.log('🔍 [DEBUG-AUTH] UserAgent:', navigator.userAgent);
    console.log('🔍 [DEBUG-AUTH] isMac:', navigator.platform.toLowerCase().includes('mac'));
    
    const savedCliente = localStorage.getItem('cliente_auth');
    console.log('🔍 [DEBUG-AUTH] localStorage raw data:', savedCliente);
    console.log('🔍 [DEBUG-AUTH] localStorage length:', savedCliente?.length || 0);
    console.log('🔍 [DEBUG-AUTH] localStorage type:', typeof savedCliente);
    
    // Verificações adicionais de integridade
    if (savedCliente) {
      console.log('🔍 [DEBUG-AUTH] Data exists - running integrity checks');
      console.log('🔍 [DEBUG-AUTH] First 50 chars:', savedCliente.substring(0, 50));
      console.log('🔍 [DEBUG-AUTH] Last 50 chars:', savedCliente.substring(Math.max(0, savedCliente.length - 50)));
      console.log('🔍 [DEBUG-AUTH] Contains null bytes:', savedCliente.includes('\0'));
      console.log('🔍 [DEBUG-AUTH] Contains BOM:', savedCliente.charCodeAt(0) === 0xFEFF);
      
      try {
        const parsedCliente = JSON.parse(savedCliente);
        console.log('🔍 [DEBUG-AUTH] JSON parse successful');
        console.log('🔍 [DEBUG-AUTH] Parsed cliente data:', parsedCliente);
        console.log('🔍 [DEBUG-AUTH] Data type after parse:', typeof parsedCliente);
        console.log('🔍 [DEBUG-AUTH] Is object:', typeof parsedCliente === 'object' && parsedCliente !== null);
        console.log('🔍 [DEBUG-AUTH] Has titulo property:', 'titulo' in parsedCliente);
        console.log('🔍 [DEBUG-AUTH] Cliente titulo:', parsedCliente?.titulo);
        console.log('🔍 [DEBUG-AUTH] Cliente nome_completo:', parsedCliente?.nome_completo);
        console.log('🔍 [DEBUG-AUTH] All keys:', Object.keys(parsedCliente));
        
        // Verificar se os dados são válidos
        if (parsedCliente && typeof parsedCliente === 'object' && parsedCliente.titulo) {
          setCliente(parsedCliente);
          console.log('✅ [DEBUG-AUTH] Cliente state set successfully');
        } else {
          console.error('❌ [DEBUG-AUTH] Invalid cliente data structure');
          localStorage.removeItem('cliente_auth');
        }
      } catch (error) {
        console.error('❌ [DEBUG-AUTH] JSON parse error:', error);
        console.error('❌ [DEBUG-AUTH] Error name:', error.name);
        console.error('❌ [DEBUG-AUTH] Error message:', error.message);
        console.error('❌ [DEBUG-AUTH] Raw data that failed to parse:', savedCliente);
        console.error('❌ [DEBUG-AUTH] Raw data as array:', Array.from(savedCliente).map(c => c.charCodeAt(0)));
        localStorage.removeItem('cliente_auth');
      }
    } else {
      console.log('⚠️ [DEBUG-AUTH] Nenhum dado encontrado no localStorage');
      console.log('⚠️ [DEBUG-AUTH] localStorage keys:', Object.keys(localStorage));
    }
    // Definir loading como false após verificar o localStorage
    setIsLoading(false);
    console.log('🔍 [DEBUG-AUTH] Loading set to false');
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
      const jsonData = JSON.stringify(clienteData);
      localStorage.setItem('cliente_auth', jsonData);
      
      console.log('✅ [DEBUG-AUTH] Login successful - Data saved to localStorage');
      console.log('✅ [DEBUG-AUTH] Cliente data:', clienteData);
      console.log('✅ [DEBUG-AUTH] JSON stringified:', jsonData);
      console.log('✅ [DEBUG-AUTH] Verification - localStorage get:', localStorage.getItem('cliente_auth'));
      
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
    console.log('🚪 [DEBUG-AUTH] Logout initiated');
    console.log('🚪 [DEBUG-AUTH] Current cliente before logout:', cliente);
    setCliente(null);
    localStorage.removeItem('cliente_auth');
    console.log('🚪 [DEBUG-AUTH] localStorage cleared');
    console.log('🚪 [DEBUG-AUTH] Verification - localStorage after removal:', localStorage.getItem('cliente_auth'));
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