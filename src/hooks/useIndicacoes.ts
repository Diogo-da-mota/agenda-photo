import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { indicacoesService, Indicacao } from '@/services/indicacoesService';
import { useToast } from './use-toast';

interface IndicacoesStats {
  total: number;
  convertidas: number;
  pendentes: number;
  nivel: number;
  proximoNivel: number;
  faltamParaProximo: number;
}

export function useIndicacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [stats, setStats] = useState<IndicacoesStats>({
    total: 0,
    convertidas: 0,
    pendentes: 0,
    nivel: 1,
    proximoNivel: 3,
    faltamParaProximo: 3
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega as indicações e estatísticas
  const carregarDados = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [indicacoesData, statsData] = await Promise.all([
        indicacoesService.listarIndicacoes(user.id),
        indicacoesService.buscarEstatisticas(user.id)
      ]);

      setIndicacoes(indicacoesData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados quando o usuário mudar
  useEffect(() => {
    carregarDados();
  }, [user]);

  // Cria uma nova indicação
  const criarIndicacao = async (dados: {
    nome_indicado: string;
    email_indicado: string;
    telefone_indicado: string;
  }) => {
    if (!user) return null;

    try {
      const novaIndicacao = await indicacoesService.criarIndicacao({
        ...dados,
        user_id: user.id,
        status: 'pendente',
        data_indicacao: new Date().toISOString(),
        cliente_indicador_id: null,
        cliente_indicado_id: null,
        data_conversao: null,
        observacoes: null
      });

      setIndicacoes(prev => [novaIndicacao, ...prev]);
      await carregarDados(); // Recarrega os dados para atualizar as estatísticas

      toast({
        title: "Indicação criada",
        description: "Sua indicação foi registrada com sucesso!",
      });

      return novaIndicacao;
    } catch (err) {
      console.error('Erro ao criar indicação:', err);
      toast({
        title: "Erro",
        description: "Não foi possível criar a indicação. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Atualiza uma indicação
  const atualizarIndicacao = async (id: string, dados: Partial<Indicacao>) => {
    try {
      const indicacaoAtualizada = await indicacoesService.atualizarIndicacao(id, dados);
      
      setIndicacoes(prev => prev.map(i => 
        i.id === id ? indicacaoAtualizada : i
      ));

      await carregarDados(); // Recarrega os dados para atualizar as estatísticas

      toast({
        title: "Indicação atualizada",
        description: "As alterações foram salvas com sucesso!",
      });

      return true;
    } catch (err) {
      console.error('Erro ao atualizar indicação:', err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a indicação. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Retorna os benefícios baseado no nível
  const getBeneficios = () => {
    const beneficios = [
      { nivel: 1, requisito: '1 indicação', beneficio: 'Teste grátis de 7 dias', cor: 'bg-blue-500' },
      { nivel: 2, requisito: '3 indicações', beneficio: '10% de desconto na assinatura', cor: 'bg-green-500' },
      { nivel: 3, requisito: '5 indicações', beneficio: '1 mês grátis', cor: 'bg-purple-500' },
      { nivel: 4, requisito: '30 indicações', beneficio: 'Acesso vitalício', cor: 'bg-yellow-500' }
    ];

    return {
      todos: beneficios,
      atual: beneficios[stats.nivel - 1],
      proximo: stats.nivel < 4 ? beneficios[stats.nivel] : null
    };
  };

  return {
    indicacoes,
    stats,
    loading,
    error,
    criarIndicacao,
    atualizarIndicacao,
    carregarDados,
    getBeneficios
  };
} 