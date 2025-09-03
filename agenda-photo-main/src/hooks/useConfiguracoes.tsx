
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Interface simplificada para configurações
export interface ConfiguracoesApp {
  id?: string;
  nome_empresa?: string;
  telefone?: string;
  email?: string;
  modo_escuro?: boolean;
  notificacoes?: boolean;
}

// Mock service para configurações
const configuracoesService = {
  async getConfiguracoes(userId: string): Promise<ConfiguracoesApp> {
    // Mock - retorna configurações padrão
    return {
      id: 'mock-id',
      nome_empresa: 'Minha Empresa',
      telefone: '',
      email: '',
      modo_escuro: false,
      notificacoes: true,
    };
  },

  async updateConfiguracoes(userId: string, config: Partial<ConfiguracoesApp>): Promise<boolean> {
    // Mock - simula sucesso
    
    return true;
  }
};

export const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesApp | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { toast } = useToast();

  // Carregar configurações ao inicializar
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  // Função para carregar as configurações
  const carregarConfiguracoes = async () => {
    try {
      setCarregando(true);
      const dados = await configuracoesService.getConfiguracoes('mock-user-id');
      setConfiguracoes(dados);
    } catch (erro) {
      console.error('Erro ao carregar configurações:', erro);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setCarregando(false);
    }
  };

  // Função para atualizar configurações
  const atualizarConfiguracoes = async (novasConfiguracoes: Partial<ConfiguracoesApp>) => {
    try {
      setCarregando(true);
      const sucesso = await configuracoesService.updateConfiguracoes('mock-user-id', novasConfiguracoes);
      
      if (sucesso) {
        // Atualizar estado local com as novas configurações
        setConfiguracoes(prev => prev ? { ...prev, ...novasConfiguracoes } : { ...novasConfiguracoes } as ConfiguracoesApp);
        
      }
      
      return sucesso;
    } catch (erro) {
      console.error('Erro ao atualizar configurações:', erro);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações',
        variant: 'destructive',
      });
      return false;
    } finally {
      setCarregando(false);
    }
  };

  return {
    configuracoes,
    carregando,
    atualizarConfiguracoes,
    recarregarConfiguracoes: carregarConfiguracoes,
  };
};
