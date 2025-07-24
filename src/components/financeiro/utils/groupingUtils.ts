import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transacao } from '@/services/financeiroService';
import { Despesa } from '@/services/financeiroDespesasService';
import { TransactionGroup } from '../types';

/**
 * Agrupa transações e despesas por mês e ano para exibição organizada
 */
export const groupTransactionsByMonth = (
  transactions: Transacao[], 
  despesas: Despesa[], 
  transacoesRestantes: any[] = [], 
  transacoesEntradas: any[] = []
) => {
  const grouped: Record<string, TransactionGroup> = {};
  
  // Função auxiliar para obter a chave do mês-ano e garantir datas consistentes
  const getMonthYearKey = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      // Usar ano e mês para agrupar (independente do dia)
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // +1 pois getMonth retorna 0-11
      return `${year}-${month.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Erro ao processar data:', error, dateString);
      // Em caso de erro, usar o mês atual como fallback
      const now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
  };
  
  // Função para criar um rótulo no formato "Mês de Ano" a partir da data
  const createMonthLabel = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      // Garantir que usamos o dia 15 para evitar problemas de fuso horário
      const year = date.getFullYear();
      const month = date.getMonth();
      // Usar dia 15 do mês para evitar problemas de fuso horário nas bordas do mês
      const safeDate = new Date(year, month, 15);
      return format(safeDate, "MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao criar rótulo do mês:', error, dateString);
      return 'Mês desconhecido';
    }
  };
  
  // Agrupar transações regulares
  transactions.forEach(transaction => {
    const monthYear = getMonthYearKey(transaction.data_transacao);
    if (!grouped[monthYear]) {
      grouped[monthYear] = {
        label: createMonthLabel(transaction.data_transacao),
        transactions: [],
        despesas: [],
        transacoesRestantes: [],
        transacoesEntradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        totalRestantes: 0,
        totalEntradas: 0
      };
    }
    grouped[monthYear].transactions.push(transaction);
    if (transaction.tipo === 'receita') {
      grouped[monthYear].totalReceitas += transaction.valor;
    } else {
      grouped[monthYear].totalDespesas += transaction.valor;
    }
  });
  
  // Agrupar despesas específicas
  despesas.forEach(despesa => {
    const monthYear = getMonthYearKey(despesa.data_transacao);
    if (!grouped[monthYear]) {
      grouped[monthYear] = {
        label: createMonthLabel(despesa.data_transacao),
        transactions: [],
        despesas: [],
        transacoesRestantes: [],
        transacoesEntradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        totalRestantes: 0,
        totalEntradas: 0
      };
    }
    grouped[monthYear].despesas.push(despesa);
    grouped[monthYear].totalDespesas += despesa.valor;
  });
  
  // Agrupar valores restantes da agenda
  transacoesRestantes.forEach(transacao => {
    const monthYear = getMonthYearKey(transacao.data_transacao);
    if (!grouped[monthYear]) {
      grouped[monthYear] = {
        label: createMonthLabel(transacao.data_transacao),
        transactions: [],
        despesas: [],
        transacoesRestantes: [],
        transacoesEntradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        totalRestantes: 0,
        totalEntradas: 0
      };
    }
    grouped[monthYear].transacoesRestantes.push(transacao);
    grouped[monthYear].totalRestantes += transacao.valor;
  });
  
  // Agrupar valores de entrada da agenda
  transacoesEntradas.forEach(transacao => {
    const monthYear = getMonthYearKey(transacao.data_transacao);
    if (!grouped[monthYear]) {
      grouped[monthYear] = {
        label: createMonthLabel(transacao.data_transacao),
        transactions: [],
        despesas: [],
        transacoesRestantes: [],
        transacoesEntradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        totalRestantes: 0,
        totalEntradas: 0
      };
    }
    grouped[monthYear].transacoesEntradas.push(transacao);
    grouped[monthYear].totalEntradas += transacao.valor;
  });
  
  // Ordenar por mês-ano (mais recente primeiro, em ordem cronológica inversa)
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(key => grouped[key]);
}; 