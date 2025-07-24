import { Despesa } from '@/services/financeiroDespesasService';
import { Transacao } from '@/services/financeiroService';

/**
 * Converte uma despesa para o formato de transação para exibição uniforme
 */
export const converterDespesaParaTransacao = (despesa: Despesa): Transacao => ({
  id: despesa.id,
  clienteName: '',
  descricao: despesa.descricao,
  data_transacao: despesa.data_transacao.toISOString(),
  valor: despesa.valor,
  tipo: 'despesa',
  status: despesa.status === 'pago' ? 'recebido' : 'pendente',
  categoria: despesa.categoria || '',
  forma_pagamento: despesa.forma_pagamento || '',
  observacoes: despesa.observacoes || '',
  user_id: despesa.user_id,
  cliente_id: despesa.cliente_id,
  criado_em: despesa.criado_em,
  atualizado_em: despesa.atualizado_em,
  isDespesaEspecifica: true
}); 