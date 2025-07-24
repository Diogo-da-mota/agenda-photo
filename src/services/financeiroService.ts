import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { 
  validarTransacao, 
  validarAtualizacaoTransacao,
  criarTransacaoSchema,
  filtroTransacaoSchema,
  type CriarTransacaoInput 
} from '@/schemas/financeiro';
import { logger } from '@/utils/logger';
import { withRateLimit, RateLimitError } from '@/utils/rateLimiter';

// Função para sanitizar termos de busca e evitar erros SQL
const sanitizeSearchTerm = (term: string): string => {
  return term
    .replace(/[%_'"\\]/g, '') // Remove caracteres especiais problemáticos
    .replace(/[,]/g, ' ') // Substitui vírgulas por espaços
    .replace(/\s+/g, ' ') // Normaliza múltiplos espaços em um só
    .trim();
};

// Tipos para transações financeiras
export interface Transacao {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  valor_entrada?: number;
  valor_restante?: number;
  data_transacao: string;
  categoria: string;
  forma_pagamento?: string;
  status: 'pendente' | 'recebido' | 'concluido' | 'entrada' | 'restante';
  observacoes?: string;
  evento_id?: string;
  criado_em: string;
  atualizado_em: string;
  clienteName?: string;
  cliente_id?: string;
  data_evento?: string;
  isDespesaEspecifica?: boolean; // Propriedade para marcar se a transação é originalmente uma despesa
  telefone?: string;
  local?: string;
}

// Interface para filtrar transações
export interface FiltroTransacao {
  dataInicio?: Date;
  dataFim?: Date;
  tipo?: 'receita' | 'despesa' | null;
  status?: 'recebido' | 'pendente' | 'concluido' | 'entrada' | 'restante' | null;
  categoria?: string[];
  busca?: string;
}

// Conversão do formato da UI para Supabase - COM VALIDAÇÃO
const converterParaSupabase = (transacao: Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'>, userId: string) => {
  const agora = new Date().toISOString();
  
  // VALIDAÇÃO CRÍTICA - validar dados antes da conversão
  const dadosParaValidar = {
    ...transacao,
    user_id: userId
  };
  
  const validacao = validarTransacao(dadosParaValidar);
  
  if (!validacao.success) {
    logger.security('Dados inválidos detectados na conversão para Supabase', validacao.error, 'financeiroService');
    throw new Error(`Validação falhou: ${validacao.error?.message}. Detalhes: ${JSON.stringify(validacao.error?.details)}`);
  }
  
  const dadosValidados = validacao.data!;
  
  // Verificar se o status está correto para o banco de dados
  let status = dadosValidados.status;
  
  // Garantir que o status seja um dos valores aceitos pelo banco de dados
  if (!['recebido', 'pendente', 'concluido'].includes(status)) {
    logger.security(`Status inválido: ${status}. Será convertido para 'recebido'`, null, 'financeiroService');
    status = 'recebido';
  }
  
  logger.debug('Convertendo dados validados para formato Supabase', {
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
    status: status,
    user_id: userId,
    cliente_id: dadosValidados.cliente_id || null,
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

// Interface para dados vindos do Supabase
interface TransacaoSupabaseData {
  id: string;
  user_id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  valor_entrada?: number;
  valor_restante?: number;
  data_transacao: string | Date;
  categoria?: string;
  forma_pagamento?: string;
  status: 'pendente' | 'recebido' | 'concluido' | 'entrada' | 'restante';
  observacoes?: string;
  evento_id?: string;
  criado_em: string;
  atualizado_em: string;
  clienteName?: string;
  cliente_id?: string;
  data_evento?: string | Date;
}

// Conversão do formato do Supabase para a interface da UI
const converterDoSupabase = (data: TransacaoSupabaseData): Transacao => {
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

// Função para buscar transações com filtros - COM VALIDAÇÃO
export const buscarTransacoes = async (userId: string, filtros?: FiltroTransacao): Promise<Transacao[]> => {
  try {
    logger.debug('Iniciando busca de transações', { userId }, 'financeiroService');
    
    // VALIDAÇÃO CRÍTICA - verificar user_id
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      logger.security('ID de usuário inválido na busca de transações', { userId }, 'financeiroService');
      throw new Error('ID de usuário inválido ou não fornecido');
    }
    
    // VALIDAÇÃO CRÍTICA - validar filtros se fornecidos
    if (filtros) {
      try {
        const filtrosValidados = filtroTransacaoSchema.parse(filtros);
        logger.debug('Filtros validados', filtrosValidados, 'financeiroService');
        filtros = filtrosValidados;
      } catch (error) {
        logger.security('Filtros inválidos fornecidos, usando busca sem filtros', error, 'financeiroService');
        filtros = undefined;
      }
    }
    
    let query = supabase
      .from('financeiro_transacoes')
      .select('*')
      .eq('user_id', userId);
    
    // Aplicar filtros validados
    if (filtros) {
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      
      if (filtros.dataInicio) {
        query = query.gte('data_transacao', filtros.dataInicio.toISOString());
      }
      
      if (filtros.dataFim) {
        query = query.lte('data_transacao', filtros.dataFim.toISOString());
      }
      
      if (filtros.categoria && filtros.categoria.length > 0) {
        query = query.in('categoria', filtros.categoria);
      }
      
      if (filtros.busca) {
        // Sanitizar o termo de busca para evitar erros SQL
        const searchTerm = sanitizeSearchTerm(filtros.busca);
        if (searchTerm.length >= 1) { // Buscar com pelo menos 1 caractere
          // Buscar em múltiplos campos: descrição, categoria, nome do cliente e observações
          query = query.or(`descricao.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,clienteName.ilike.%${searchTerm}%,observacoes.ilike.%${searchTerm}%`);
        }
      }
    }
    
    // Ordenar por data (mais recente primeiro)
    query = query.order('data_transacao', { ascending: false });
    
    logger.debug('Executando consulta de transações no Supabase', null, 'financeiroService');
    const { data, error } = await query;
    
    if (error) {
      logger.error('Erro ao buscar transações', error, 'financeiroService');
      throw error;
    }
    
    const transacoes = (data || []).map(converterDoSupabase);
    logger.debug(`${transacoes.length} transações encontradas`, null, 'financeiroService');
    
    return transacoes;
  } catch (error) {
    logger.error('Exceção ao buscar transações', error, 'financeiroService');
    throw error;
  }
};

// Função para criar uma nova transação - COM VALIDAÇÃO RIGOROSA E RATE LIMITING
export const criarTransacao = async (transacao: Omit<Transacao, 'id' | 'criado_em' | 'atualizado_em'>, userId: string): Promise<Transacao> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando criação de transação com validação', null, 'financeiroService');
      
      // VALIDAÇÃO CRÍTICA 1 - Verificar user_id
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido fornecido', { userId }, 'financeiroService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      // VALIDAÇÃO CRÍTICA 2 - Validar todos os dados da transação
      const dadosCompletos = {
        ...transacao,
        user_id: userId
      };
      
      const validacao = validarTransacao(dadosCompletos);
      
      if (!validacao.success) {
        logger.error('Dados de transação inválidos', validacao.error, 'financeiroService');
        throw new Error(`Dados inválidos: ${validacao.error?.message}. Detalhes: ${JSON.stringify(validacao.error?.details)}`);
      }
      
      const transacaoValidada = validacao.data!;
      
      logger.debug('Transação validada com sucesso. Prosseguindo com inserção.', null, 'financeiroService');
      
      // VALIDAÇÃO CRÍTICA 3 - Verificar valores financeiros
      if (transacaoValidada.valor <= 0 || transacaoValidada.valor > 999999999) {
        logger.error('Valor financeiro fora do range permitido', { valor: transacaoValidada.valor }, 'financeiroService');
        throw new Error('Valor financeiro inválido');
      }
      
      // Converter para formato Supabase (já com validação interna)
      const transacaoSupabase = converterParaSupabase(transacaoValidada, userId);
      
      logger.debug('Dados convertidos e prontos para inserção', null, 'financeiroService');
      
      // VALIDAÇÃO CRÍTICA 4 - Verificar duplicação (proteção contra replay attacks)
      const { data: transacoesExistentes, error: erroConsulta } = await supabase
        .from('financeiro_transacoes')
        .select('id, descricao, valor, data_transacao, criado_em')
        .eq('user_id', userId)
        .eq('descricao', transacaoValidada.descricao)
        .eq('valor', transacaoValidada.valor)
        .eq('data_transacao', transacaoValidada.data_transacao.toISOString())
        .gte('criado_em', new Date(Date.now() - 60000).toISOString()); // Últimos 60 segundos
      
      if (erroConsulta) {
        logger.error('Erro ao verificar duplicação', erroConsulta, 'financeiroService');
      } else if (transacoesExistentes && transacoesExistentes.length > 0) {
        logger.warn('Possível transação duplicada detectada', {
          existentes: transacoesExistentes.length,
          ultima: transacoesExistentes[0]?.criado_em
        }, 'financeiroService');
        
        throw new Error('Transação duplicada detectada. Aguarde alguns segundos antes de tentar novamente.');
      }
      
      logger.debug('Inserindo transação validada no banco de dados...', null, 'financeiroService');
    const { data, error } = await supabase
      .from('financeiro_transacoes')
      .insert([transacaoSupabase])
      .select()
      .single();
    
    if (error) {
        logger.error('Erro ao inserir transação validada', error, 'financeiroService');
        
        if (error.message.includes('violates check constraint')) {
          const errorMsg = `Erro de validação do banco: ${error.details}`;
          logger.error(errorMsg, null, 'financeiroService');
          throw new Error(errorMsg);
        }
        
      throw error;
    }
    
      logger.debug('Transação inserida com sucesso. ID:', data.id, 'financeiroService');
      
      // LOG DE AUDITORIA
      logger.info('Transação criada', {
        id: data.id,
        user_id: userId,
        valor: transacaoValidada.valor,
        tipo: transacaoValidada.tipo,
        timestamp: new Date().toISOString()
      }, 'financeiroService');
    
    return converterDoSupabase(data);
  } catch (error) {
      logger.error('Exceção ao criar transação', error, 'financeiroService');
    throw error;
  }
  }, '/financeiro/transacoes/create');
};

// Função para atualizar uma transação existente - COM VALIDAÇÃO E RATE LIMITING
export const atualizarTransacao = async (id: string, transacao: Partial<Transacao>, userId: string): Promise<void> => {
  return await withRateLimit(async () => {
    try {
      // VALIDAÇÃO CRÍTICA 1 - Verificar parâmetros obrigatórios
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido na atualização', { userId }, 'financeiroService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        logger.error('ID de transação inválido na atualização', { id }, 'financeiroService');
        throw new Error('ID de transação inválido ou não fornecido');
      }
      
      // VALIDAÇÃO CRÍTICA 2 - Validar dados de atualização com Zod
      const validacao = validarAtualizacaoTransacao(transacao);
      
      if (!validacao.success) {
        logger.error('Dados de atualização inválidos', validacao.error, 'financeiroService');
        throw new Error(`Dados de atualização inválidos: ${validacao.error?.message}. Detalhes: ${JSON.stringify(validacao.error?.details)}`);
    }
    
      const dadosValidados = validacao.data!;
      
      logger.debug('Dados de atualização validados com sucesso', null, 'financeiroService');
      
      // VALIDAÇÃO CRÍTICA 3 - Verificar se a transação pertence ao usuário
      const { data: transacaoExistente, error: erroVerificacao } = await supabase
        .from('financeiro_transacoes')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroVerificacao || !transacaoExistente) {
        logger.error('Tentativa de atualizar transação não autorizada', {
          id,
          userId,
          erro: erroVerificacao?.message
        }, 'financeiroService');
        throw new Error('Transação não encontrada ou acesso negado');
      }
      
      logger.debug('Verificação de propriedade da transação aprovada', null, 'financeiroService');
    
      // Criar objeto com campos a serem atualizados (apenas os validados)
    const camposAtualizados: Record<string, any> = {
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
      
      logger.debug('Atualizando transação validada no banco de dados...', null, 'financeiroService');
    
    const { error } = await supabase
      .from('financeiro_transacoes')
      .update(camposAtualizados)
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
        logger.error('Erro ao atualizar transação', error, 'financeiroService');
      throw error;
    }
    
      // LOG DE AUDITORIA
      logger.info('Transação atualizada', {
        id,
        user_id: userId,
        camposAlterados: Object.keys(dadosValidados),
        timestamp: new Date().toISOString()
      }, 'financeiroService');
      
      logger.debug('Transação atualizada com sucesso', null, 'financeiroService');
  } catch (error) {
      logger.error('Exceção ao atualizar transação', error, 'financeiroService');
    throw error;
  }
  }, '/financeiro/transacoes/update');
};

// Função para excluir uma transação - COM RATE LIMITING
export const excluirTransacao = async (id: string, userId: string): Promise<void> => {
  return await withRateLimit(async () => {
  try {
    if (!userId) {
      throw new Error('ID de usuário não fornecido. Impossível excluir transação.');
    }
    
      logger.debug('Excluindo transação', { id }, 'financeiroService');
    
    const { error } = await supabase
      .from('financeiro_transacoes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
        logger.error('Erro ao excluir transação', error, 'financeiroService');
      throw error;
    }
    
      logger.debug('Transação excluída com sucesso', null, 'financeiroService');
  } catch (error) {
      logger.error('Exceção ao excluir transação', error, 'financeiroService');
    throw error;
  }
  }, '/financeiro/transacoes/delete');
};

// Função para buscar o resumo financeiro (totais)
export const buscarResumoFinanceiro = async (userId: string, filtros?: FiltroTransacao): Promise<{
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}> => {
  try {
    const transacoes = await buscarTransacoes(userId, filtros);
    
    // Buscar despesas específicas da tabela financeiro_despesas
    let despesasEspecificas = [];
    try {
      // Importar de forma dinâmica para evitar dependência circular
      const { buscarDespesas } = await import('./financeiroDespesasService');
      
      // Converter filtros de transações para filtros de despesas
      const filtrosDespesas = filtros ? {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        categoria: filtros.categoria,
        busca: filtros.busca
      } : undefined;
      
      despesasEspecificas = await buscarDespesas(userId, filtrosDespesas);
    } catch (error) {
      console.error("Erro ao buscar despesas específicas:", error);
      despesasEspecificas = [];
    }
    
    const totalReceitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
      
    // Somar despesas da tabela de transações
    const totalDespesasTransacoes = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    // Somar despesas da tabela específica de despesas
    const totalDespesasEspecificas = despesasEspecificas.reduce((sum, d) => sum + d.valor, 0);
    
    // Total geral de despesas
    const totalDespesas = totalDespesasTransacoes + totalDespesasEspecificas;
      
    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas
    };
  } catch (error) {
    logger.error('Exceção ao buscar resumo financeiro', error, 'financeiroService');
    throw error;
  }
};

// Função para mudar o status de uma transação
export const marcarTransacaoComoRecebida = async (id: string, userId: string): Promise<void> => {
  await atualizarTransacao(id, { 
    status: 'recebido',
    atualizado_em: new Date().toISOString()
  }, userId);
};

// Exportar mapeamento de tipo e status para legibilidade em português
export const mapearTipo = {
  receita: 'Receita',
  despesa: 'Despesa'
};

export const mapearStatus = {
  recebido: 'Recebido',
  pendente: 'Pendente',
  concluido: 'Concluído'
};