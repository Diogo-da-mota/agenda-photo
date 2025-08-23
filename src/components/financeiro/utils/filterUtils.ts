import { TransactionGroup } from '../types';
import { isDateInRange } from './dateUtils';

/**
 * Aplica todos os filtros (data, tipo, categoria) nos grupos de transações
 */
export const applyAllFilters = (
  groups: TransactionGroup[], 
  filters: {
    dateRange: { start: Date | null; end: Date | null };
    typeFilter: string;
    categoryFilter: string[];
  }
) => {
  const { dateRange, typeFilter, categoryFilter } = filters;
  
  // Log removido para produção
  
  return groups.map(group => {
    // Filtrar transações por data e tipo
    const filteredTransactions = group.transactions.filter(transaction => {
      // Filtro de data
      if (!isDateInRange(transaction.data_transacao, dateRange)) return false;
      
      // Filtro de tipo
      if (typeFilter === 'income') {
        return transaction.tipo === 'receita' && transaction.status === 'entrada';
      } else if (typeFilter === 'pending') {
        return transaction.tipo === 'receita' && transaction.status === 'restante';
      } else if (typeFilter === 'expense') {
        return transaction.tipo === 'despesa';
      }
      return typeFilter === 'all';
    });

    // Filtrar despesas por data e tipo
    const filteredDespesas = group.despesas.filter(despesa => {
      if (!isDateInRange(despesa.data_transacao, dateRange)) return false;
      return typeFilter === 'expense' || typeFilter === 'all';
    });

    // Filtrar transações restantes por data e tipo
    const filteredTransacoesRestantes = group.transacoesRestantes.filter(transacao => {
      if (!isDateInRange(transacao.data_transacao, dateRange)) return false;
      return typeFilter === 'pending' || typeFilter === 'all';
    });

    // Filtrar transações de entrada por data e tipo
    const filteredTransacoesEntradas = group.transacoesEntradas.filter(transacao => {
      if (!isDateInRange(transacao.data_transacao, dateRange)) return false;
      return typeFilter === 'income' || typeFilter === 'all';
    });

    // Recalcular totais baseado nos dados filtrados
    const totalReceitas = filteredTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalDespesas = filteredTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0) +
      filteredDespesas.reduce((sum, d) => sum + d.valor, 0);
    
    const totalRestantes = filteredTransacoesRestantes.reduce((sum, t) => sum + t.valor, 0);
    const totalEntradas = filteredTransacoesEntradas.reduce((sum, t) => sum + t.valor, 0);

    return {
      ...group,
      transactions: filteredTransactions,
      despesas: filteredDespesas,
      transacoesRestantes: filteredTransacoesRestantes,
      transacoesEntradas: filteredTransacoesEntradas,
      totalReceitas,
      totalDespesas,
      totalRestantes,
      totalEntradas,
    };
  }).filter(group => 
    group.transactions.length > 0 || 
    group.despesas.length > 0 || 
    group.transacoesRestantes.length > 0 || 
    group.transacoesEntradas.length > 0
  );
};

/**
 * Calcula os totais dos filtros aplicados ou dos dados completos
 */
export const calcularTotaisDosFiltros = (
  groupedTransactions: TransactionGroup[],
  resumoFinanceiro: { totalReceitas: number; totalDespesas: number; saldo: number },
  transactions: any[],
  transacoesRestantes: any[],
  transacoesEntradas: any[],
  filters: {
    typeFilter: string;
    dateRange: { start: Date | null; end: Date | null };
    categoryFilter: string[];
  }
) => {
  const { typeFilter, dateRange, categoryFilter } = filters;
  
  if (typeFilter === 'all' && !dateRange.start && !dateRange.end && categoryFilter.length === 0) {
    // Mostrar totais completos quando não há nenhum filtro ativo
    const totalAReceber = (transactions || []).filter(t => t.tipo === 'receita' && t.status === 'restante').reduce((sum, t) => sum + t.valor, 0) +
                          (transacoesRestantes || []).reduce((sum, t) => sum + t.valor, 0);
    const totalEntradas = (transactions || []).filter(t => t.tipo === 'receita' && t.status === 'entrada').reduce((sum, t) => sum + t.valor, 0) +
                          (transacoesEntradas || []).reduce((sum, t) => sum + t.valor, 0);
    
    return {
      totalReceitas: resumoFinanceiro.totalReceitas,
      totalDespesas: resumoFinanceiro.totalDespesas,
      saldo: totalEntradas + totalAReceber - resumoFinanceiro.totalDespesas,
      totalAReceber,
      totalEntradas
    };
  } else {
    // Calcular apenas dos grupos filtrados (considera filtros de data, tipo e categoria)
    const totalReceitas = groupedTransactions.reduce((sum, group) => sum + group.totalReceitas, 0);
    const totalDespesas = groupedTransactions.reduce((sum, group) => sum + group.totalDespesas, 0);
    const totalAReceber = groupedTransactions.reduce((sum, group) => sum + group.totalRestantes, 0);
    const totalEntradas = groupedTransactions.reduce((sum, group) => sum + group.totalEntradas, 0);
    
    return {
      totalReceitas,
      totalDespesas,
      saldo: totalEntradas + totalAReceber - totalDespesas,
      totalAReceber,
      totalEntradas
    };
  }
};