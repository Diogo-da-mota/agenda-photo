import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Transacao } from '@/services/financeiroService';
import { buscarEventosComValoresRestantes, buscarEventosComValoresEntradas } from '@/services/agendaService';
import { corrigirTransacoesDiogoGoncalves } from '@/utils/fixEventsFinancialData';
// REMOVIDO: import { migrarTransacoesExistentes, verificarInconsistenciasEventosFinanceiros } from '@/utils/migrateTransactions';
import { handleExportReport } from '../utils/exporters';
import { groupTransactionsByMonth } from '../utils/groupingUtils';
import { asyncRetry } from '@/utils/asyncRetry';
import { TransactionGroup } from '../types';

/**
 * Hook personalizado para gerenciar todas as ações/handlers financeiros
 */
export const useFinanceiroActions = (
  groupedTransactions: TransactionGroup[],
  setTransacaoParaEditar: (transacao: Transacao | null) => void,
  setIsTransactionModalOpen: (isOpen: boolean) => void,
  setMensagemCorrecao: (mensagem: string | null) => void,
  setTransacoesRestantes: (transacoes: Transacao[]) => void,
  setTransacoesEntradas: (transacoes: Transacao[]) => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMounted = useRef(true);
  
  const [isLoadingSecondaryData, setIsLoadingSecondaryData] = useState(true);

  // Função para editar uma transação
  const handleEditTransaction = (transaction: Transacao) => {
    // Definir a transação para editar
    setTransacaoParaEditar(transaction);
    
    // Abrir o modal de edição imediatamente
    setIsTransactionModalOpen(true);
  };
  
  // Função para lidar com o sucesso na criação/edição de transação
  const handleTransactionSuccess = (transaction: Transacao) => {
    // Atualizar a lista se for uma edição
    queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] });
    queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] });
    
    // Limpar estado
    setTransacaoParaEditar(null);
  };
  
  // Função para exportar relatório
  const handleExportClick = (format: 'pdf' | 'excel') => {
    // Converter o formato para o esperado pela função importada
    const exportGroups = groupedTransactions.map(group => ({
      transactions: group.transactions,
      despesas: group.despesas.map(d => ({
        data_transacao: d.data_transacao,
        descricao: d.descricao,
        categoria: d.categoria || '',
        valor: d.valor,
        status: d.status
      }))
    }));
    handleExportReport(format, exportGroups);
  };

  // Buscar cards individuais de valores restantes e entradas da agenda
  const buscarCardsIndividuais = async () => {
    if (!user?.id) {
        setIsLoadingSecondaryData(false);
        return;
    }
    
    if (isMounted.current) {
      setIsLoadingSecondaryData(true);
    }

    try {
      // Log removido para produção
      
      const [transacoesRestantes, transacoesEntradas] = await Promise.all([
        asyncRetry(() => buscarEventosComValoresRestantes(user.id)),
        asyncRetry(() => buscarEventosComValoresEntradas(user.id))
      ]);
      
      if (isMounted.current) {
        if (Array.isArray(transacoesRestantes)) {
          setTransacoesRestantes(transacoesRestantes);
        } else {
          // console.error('[FinanceiroActions] transacoesRestantes não é um array. Recebido:', transacoesRestantes);
          setTransacoesRestantes([]);
        }

        if (Array.isArray(transacoesEntradas)) {
          setTransacoesEntradas(transacoesEntradas);
        } else {
          // console.error('[FinanceiroActions] transacoesEntradas não é um array. Recebido:', transacoesEntradas);
          setTransacoesEntradas([]);
        }
      }
      
      // Log removido para produção
    } catch (error) {
      // console.error('Erro ao carregar cards individuais:', error);
      if (isMounted.current) {
        setTransacoesRestantes([]);
        setTransacoesEntradas([]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingSecondaryData(false);
      }
    }
  };

  // useEffect para carregar cards individuais e lidar com a montagem
  useEffect(() => {
    isMounted.current = true;
    buscarCardsIndividuais();
    
    return () => {
      isMounted.current = false;
    };
  }, [user?.id]);

  // Função para corrigir transações de Diogo gonçalves da mota
  const handleCorrigirTransacoesDiogo = async () => {
    if (!user?.id) return;
    
    try {
      setMensagemCorrecao("Executando correção...");
      const resultado = await corrigirTransacoesDiogoGoncalves(user.id);
      setMensagemCorrecao(resultado);
      
      // Atualizar os dados após a correção
      queryClient.invalidateQueries({ queryKey: ['financeiro-transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] });
      
      toast({
        title: "Correção concluída",
        description: resultado
      });
    } catch (error) {
      // console.error("Erro ao corrigir transações:", error);
      setMensagemCorrecao(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: "Erro",
        description: "Não foi possível corrigir as transações",
        variant: "destructive"
      });
    }
  };
  
  // DESABILITADO: Função para sincronizar eventos com transações financeiras
  // MOTIVO: Os valores financeiros são salvos corretamente na tabela agenda_eventos
  const handleSincronizarEventosFinanceiro = async () => {
    if (!user?.id) return;
    
    try {
      setMensagemCorrecao("FUNCIONALIDADE DESABILITADA: Os valores financeiros são salvos corretamente na tabela agenda_eventos. Não é necessária sincronização automática entre agenda e financeiro.");
      
      toast({
        title: "Funcionalidade Desabilitada",
        description: "Os valores financeiros já são salvos corretamente na agenda. Sincronização automática não é necessária.",
        variant: "default"
      });
    } catch (error) {
      // console.error("Erro inesperado:", error);
      setMensagemCorrecao(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    }
  };

  return {
    handleEditTransaction,
    handleTransactionSuccess,
    handleExportClick,
    handleCorrigirTransacoesDiogo,
    handleSincronizarEventosFinanceiro,
    buscarCardsIndividuais,
    isLoadingSecondaryData
  };
};