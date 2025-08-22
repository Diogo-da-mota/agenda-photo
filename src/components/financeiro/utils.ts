export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const groupTransactionsByMonth = (transactions: any[]) => {
  return transactions.reduce((groups: any, transaction: any) => {
    const month = new Date(transaction.data_transacao).getMonth();
    if (!groups[month]) groups[month] = [];
    groups[month].push(transaction);
    return groups;
  }, {});
};

export const applyAllFilters = (transactions: any[], filters: any) => {
  return transactions; // Implementar filtros conforme necessário
};

export const calcularTotaisDosFiltros = (transactions: any[]) => {
  return {
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    totalAReceber: 0,
    totalEntradas: 0
  };
};