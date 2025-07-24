import { v4 as uuidv4 } from 'uuid';
import { simpleLogger as logger } from '@/utils/simpleLogger';
import { Transacao, NovaTransacao, TransacaoSupabase } from './types';
import { LOG_PREFIXES } from './constants';
import { validarDadosTransacao, validarStatus } from './validator';

/**
 * Converte dados da UI para o formato do Supabase com validação
 */
export const converterParaSupabase = (transacao: NovaTransacao, userId: string): TransacaoSupabase => {
  const agora = new Date().toISOString();
  
  logger.debug(`${LOG_PREFIXES.CONVERTER} Iniciando conversão para Supabase`);
  
  // VALIDAÇÃO CRÍTICA - validar dados antes da conversão
  const dadosParaValidar = {
    ...transacao,
    user_id: userId
  };
  
  const validacao = validarDadosTransacao(dadosParaValidar);
  
  if (!validacao.success) {
    logger.security(`${LOG_PREFIXES.CONVERTER} Dados inválidos detectados na conversão para Supabase`, validacao.error, 'financeiroService');
    throw new Error(`Validação falhou: ${validacao.error?.message}. Detalhes: ${JSON.stringify(validacao.error?.details)}`);
  }
  
  const dadosValidados = validacao.data!;
  
  // Verificar se o status está correto para o banco de dados
  const status = validarStatus(dadosValidados.status);
  
  logger.debug(`${LOG_PREFIXES.CONVERTER} Convertendo dados validados para formato Supabase`, {
    descricao: dadosValidados.descricao.substring(0, 50) + '...',
    valor: dadosValidados.valor,
    tipo: dadosValidados.tipo,
    user_id: userId
  }, 'financeiroService');
  return {
    id: uuidv4(),
    descricao: dadosValidados.descricao,
    valor: dadosValidados.valor,
    tipo: dadosValidados.tipo,
    status: status as 'pendente' | 'recebido' | 'concluido' | 'entrada' | 'restante',
    user_id: userId,
    cliente_id: dadosValidados.cliente_id || null,
    evento_id: dadosValidados.evento_id || null,
    data_transacao: dadosValidados.data_transacao.toISOString(),
    data_evento: dadosValidados.data_evento ? dadosValidados.data_evento.toISOString() : null,
    categoria: dadosValidados.categoria || null,
    forma_pagamento: dadosValidados.forma_pagamento || null,
    observacoes: dadosValidados.observacoes || null,
    clienteName: dadosValidados.clienteName || null,
    criado_em: agora,
    atualizado_em: agora
  };
};

// Interface para dados brutos do Supabase
interface DadosSupabaseRaw {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  valor_entrada?: number;
  valor_restante?: number;
  data_transacao: string | Date;
  categoria?: string | null;
  forma_pagamento?: string | null;
  status: 'pendente' | 'recebido' | 'concluido' | 'entrada' | 'restante';
  observacoes?: string | null;
  evento_id?: string | null;
  criado_em: string;
  atualizado_em: string;
  clienteName?: string | null;
  cliente_id?: string | null;
  data_evento?: string | Date | null;
}

/**
 * Converte dados do Supabase para o formato da UI
 */
export const converterDoSupabase = (data: DadosSupabaseRaw): Transacao => {
  logger.debug(`${LOG_PREFIXES.CONVERTER} Convertendo dados do Supabase para UI`);
  
  return {
    id: data.id,
    clienteName: data.clienteName || '',
    descricao: data.descricao,
    data_transacao: typeof data.data_transacao === 'string' ? data.data_transacao : new Date(data.data_transacao).toISOString(),
    valor: data.valor,
    tipo: data.tipo as 'receita' | 'despesa',
    status: data.status as 'recebido' | 'pendente' | 'concluido' | 'entrada' | 'restante',
    data_evento: data.data_evento ? (typeof data.data_evento === 'string' ? data.data_evento : new Date(data.data_evento).toISOString()) : undefined,
    valor_entrada: data.valor_entrada || undefined,
    valor_restante: data.valor_restante || undefined,
    categoria: data.categoria || '',
    forma_pagamento: data.forma_pagamento || '',
    observacoes: data.observacoes || '',
    user_id: data.user_id,
    cliente_id: data.cliente_id,
    criado_em: data.criado_em,
    atualizado_em: data.atualizado_em
  };
};

/**
 * Converte lista de dados do Supabase para o formato da UI
 */
export const converterListaDoSupabase = (dataList: DadosSupabaseRaw[]): Transacao[] => {
  logger.debug(`${LOG_PREFIXES.CONVERTER} Convertendo lista de ${dataList.length} transações do Supabase`);
  
  return dataList.map(converterDoSupabase);
};

/**
 * Cria objeto com campos atualizados para o Supabase
 */
export const criarCamposAtualizados = (dadosValidados: Partial<NovaTransacao>): Record<string, unknown> => {
  logger.debug(`${LOG_PREFIXES.CONVERTER} Criando campos atualizados`);
  
  const camposAtualizados: Record<string, unknown> = {
    atualizado_em: new Date().toISOString()
  };
  
  if (dadosValidados.descricao !== undefined) camposAtualizados.descricao = dadosValidados.descricao;
  if (dadosValidados.valor !== undefined) camposAtualizados.valor = dadosValidados.valor;
  if (dadosValidados.tipo !== undefined) camposAtualizados.tipo = dadosValidados.tipo;
  if (dadosValidados.status !== undefined) camposAtualizados.status = dadosValidados.status;
  if (dadosValidados.data_transacao !== undefined) camposAtualizados.data_transacao = dadosValidados.data_transacao.toISOString();
  if (dadosValidados.data_evento !== undefined) camposAtualizados.data_evento = dadosValidados.data_evento ? dadosValidados.data_evento.toISOString() : null;
  if (dadosValidados.categoria !== undefined) camposAtualizados.categoria = dadosValidados.categoria;
  if (dadosValidados.forma_pagamento !== undefined) camposAtualizados.forma_pagamento = dadosValidados.forma_pagamento;
  if (dadosValidados.observacoes !== undefined) camposAtualizados.observacoes = dadosValidados.observacoes;
  if (dadosValidados.cliente_id !== undefined) camposAtualizados.cliente_id = dadosValidados.cliente_id;
  
  logger.debug(`${LOG_PREFIXES.CONVERTER} ${Object.keys(camposAtualizados).length} campos preparados para atualização`);
  
  return camposAtualizados;
};
