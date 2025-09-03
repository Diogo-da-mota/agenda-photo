// Configurações de cores para o sistema
// Cores principais conforme a imagem de referência
export const coreColors = {
  // Cores principais
  primary: '#0f172a',    // azul escuro
  secondary: '#3b82f6',  // azul
  
  // Cores neutras
  neutral: {
    light: '#f8fafc',    // branco
    medium: '#475569',   // cinza
    dark: '#1e293b',     // cinza escuro
  },

  // Cores de alerta e status
  alert: '#f59e0b',      // amarelo
  danger: '#dc2626',     // vermelho
  success: '#16a34a',    // verde
};

// Cores específicas para finanças
export const financeColors = {
  // Cores para as categorias financeiras
  entrada: coreColors.success,
  aReceber: coreColors.alert,
  saida: coreColors.danger,
  saldo: coreColors.secondary,
  
  // Versões mais claras para fundos (com transparência)
  background: {
    entrada: 'bg-green-50 dark:bg-green-900/20',
    aReceber: 'bg-yellow-50 dark:bg-yellow-900/20',
    saida: 'bg-red-50 dark:bg-red-900/20',
    saldo: 'bg-blue-50 dark:bg-blue-900/20',
  },
  
  // Classes de borda para os cards
  border: {
    entrada: 'border-l-green-500',
    aReceber: 'border-l-yellow-500',
    saida: 'border-l-red-500',
    saldo: 'border-l-blue-500',
  },
  
  // Classes de texto para os itens
  text: {
    entrada: 'text-green-600',
    aReceber: 'text-yellow-600',
    saida: 'text-red-600',
    saldo: 'text-blue-600',
  }
};

// Função para obter as classes de estilo com base no tipo de transação
export const getTransactionStyle = (type: 'entrada' | 'aReceber' | 'saida' | 'saldo') => {
  return {
    background: financeColors.background[type],
    border: financeColors.border[type],
    text: financeColors.text[type],
    color: financeColors[type],
  };
}; 