import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  getConfiguracoesEmpresa,
  atualizarConfiguracoesEmpresa,
  criarConfiguracoesEmpresa 
} from '@/services/empresaService';
import { ConfiguracaoEmpresa } from '@/services/configuracaoEmpresaService';

/**
 * Hook para gerenciar as configurações da empresa
 */
export const useEmpresa = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoEmpresa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);

  // Carrega as configurações da empresa para o usuário autenticado
  const carregarConfiguracoes = useCallback(async (showToastOnError = true) => {
    if (!user) {
      setCarregando(false);
      setInitialLoadCompleted(true);
      return;
    }

    setCarregando(true);
    try {

      const dados = await getConfiguracoesEmpresa();
      setConfiguracoes(dados);
      setErro(null);
      
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao carregar configurações da empresa:', error);
      }
      setErro('Não foi possível carregar as configurações da empresa.');
      
      // Só mostrar toast de erro se for solicitado (evita no carregamento inicial)
      if (showToastOnError) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações da empresa.',
          variant: 'destructive',
        });
      }
    } finally {
      setCarregando(false);
      setInitialLoadCompleted(true);
    }
  }, [user, toast]);

  // Carrega as configurações quando o usuário autenticado mudar
  useEffect(() => {
    if (user && !initialLoadCompleted) {
      carregarConfiguracoes(false); // Não mostrar toast de erro no carregamento inicial
    }
  }, [user?.id, initialLoadCompleted]);

  // Função para atualizar as configurações da empresa
  const atualizarConfiguracoes = useCallback(async (dadosAtualizados: Partial<ConfiguracaoEmpresa>): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return false;
    }

    try {

      let sucesso = false;

      if (configuracoes) {
        
        // Atualiza configurações existentes
        sucesso = await atualizarConfiguracoesEmpresa({
          ...dadosAtualizados,
          user_id: user.id
        });
      } else {
        
        // Cria novas configurações se não existirem
        sucesso = await criarConfiguracoesEmpresa({
          ...dadosAtualizados,
          user_id: user.id
        });
      }

      if (sucesso) {

        await carregarConfiguracoes(false); // Não mostrar toast de erro, pois já tratamos o sucesso
        // Não mostrar toast de sucesso aqui, deixar para o componente
        return true;
      }

      if (import.meta.env.MODE === 'development') {
        console.error('Falha na atualização - sucesso = false');
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive',
      });
      return false;
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.error('Erro capturado no hook useEmpresa:', error);
      }
      setErro('Não foi possível atualizar as configurações da empresa.');
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar as configurações.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, configuracoes, toast, carregarConfiguracoes]);

  return {
    configuracoes,
    carregando,
    erro,
    initialLoadCompleted,
    carregarConfiguracoes,
    atualizarConfiguracoes
  };
}; 