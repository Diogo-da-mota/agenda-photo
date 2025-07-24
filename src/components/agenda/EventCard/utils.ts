/**
 * Funções utilitárias para o EventCard
 */

/**
 * Formatar telefone com DDD
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

/**
 * Verifica se o evento tem pagamento pendente
 */
export const hasPendingPayment = (event: any): boolean => {
  return event.remainingValue > 0;
};

/**
 * Gerar URL do WhatsApp para o telefone do cliente
 */
export const generateWhatsAppUrl = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/55${cleanPhone}`;
};

/**
 * Formata um número para o padrão de moeda BRL (R$).
 * @param value O número a ser formatado.
 * @returns A string formatada, ex: "R$ 1.000,00".
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Criar nova transação financeira
 */
export const createNewTransaction = (event: any, user: any) => {
  return {
    id: crypto.randomUUID(),
    descricao: `Entrada - ${event.eventType} (${event.clientName})`,
    valor: event.downPayment,
    tipo: 'receita',
    status: 'recebido',
    data_transacao: new Date().toISOString(),
    categoria: 'Entrada de Evento',
    observacoes: `Valor de entrada para evento do tipo "${event.eventType}" agendado para ${event.date.toLocaleDateString()}. ID do evento: ${event.id}`,
    user_id: user.id,
    evento_id: event.id,
    clienteName: event.clientName,
    data_evento: event.date.toISOString(),
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  };
};

/**
 * Disparar evento de atualização financeira
 */
export const triggerFinancialUpdate = (userId: string): void => {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(new CustomEvent('atualizacao-financeira', {
        detail: { userId }
      }));
    } catch (error) {
      console.error('Erro ao disparar evento de atualização financeira:', error);
    }
  }
};
