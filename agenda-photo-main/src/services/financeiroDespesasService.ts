import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { validarTransacao, validarDespesa, validarAtualizacaoDespesa } from '@/schemas/financeiro';
import { simpleLogger as logger } from '@/utils/simpleLogger';
import { withRateLimit } from '@/utils/rateLimiter';

// Função para sanitizar termos de busca e evitar erros SQL
const sanitizeSearchTerm = (term: string): string => {
  return term
    .replace(/[%_'"\\]/g, '') // Remove caracteres especiais problemáticos
    .replace(/[,]/g, ' ') // Substitui vírgulas por espaços
    .replace(/\s+/g, ' ') // Normaliza múltiplos espaços em um só
    .trim();
};

// Tipos para despesas financeiras
export interface Despesa {
  id: string;
  descricao: string;
  data_transacao: Date;
  valor: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria?: string;
  forma_pagamento?: string;
  observacoes?: string;
  user_id: string;
  cliente_id?: string | null;
  criado_em: string;
  atualizado_em: string;
}

// Interface para filtrar despesas
export interface FiltroDespesa {
  dataInicio?: Date;
  dataFim?: Date;
  status?: 'pendente' | 'pago' | 'cancelado' | 'vencido' | null;
  categoria?: string[];
  busca?: string;
}

// Conversão do formato da UI para Supabase
const converterParaSupabase = (despesa: Omit<Despesa, 'id' | 'criado_em' | 'atualizado_em'>, userId: string) => {
  const agora = new Date().toISOString();
  
  // Normalizar a forma de pagamento para minúsculas
  const despesaNormalizada = {
    ...despesa,
    forma_pagamento: despesa.forma_pagamento ? despesa.forma_pagamento.toLowerCase() : despesa.forma_pagamento
  };
  
  // Validação dos dados
  const dadosParaValidar = {
    ...despesaNormalizada,
    user_id: userId
  };
  
  const validacao = validarDespesa(dadosParaValidar);
  
  if (!validacao.success) {
    logger.security('Dados inválidos detectados na conversão para Supabase', validacao.error, 'financeiroDespesasService');
    throw new Error(`Validação falhou: ${validacao.error?.message}`);
  }
  
  const dadosValidados = validacao.data!;
  
  // Verificar se o status está correto para o banco de dados
  let status = dadosValidados.status;
  
  // Garantir que o status seja um dos valores aceitos pelo banco de dados
  if (!['pendente', 'pago', 'cancelado', 'vencido'].includes(status)) {
    logger.security(`Status inválido: ${status}. Será convertido para 'pendente'`, null, 'financeiroDespesasService');
    status = 'pendente';
  }
  
  return {
    id: uuidv4(),
    descricao: dadosValidados.descricao,
    valor: dadosValidados.valor,
    status: status,
    user_id: userId,
    cliente_id: dadosValidados.cliente_id || null,
    data_transacao: dadosValidados.data_transacao.toISOString(),
    categoria: dadosValidados.categoria || null,
    forma_pagamento: dadosValidados.forma_pagamento || null,
    observacoes: dadosValidados.observacoes || null,
    criado_em: agora,
    atualizado_em: agora
  };
};

// Interface para dados de despesa vindos do Supabase
interface DespesaSupabaseData {
  id: string;
  descricao: string;
  valor: number;
  status: 'pendente' | 'pago' | 'cancelado';
  data_transacao: string | Date;
  categoria: string;
  forma_pagamento?: string;
  observacoes?: string;
  user_id: string;
  cliente_id?: string;
  criado_em: string;
  atualizado_em: string;
}

// Converter dados do Supabase para o formato da aplicação
const converterDoSupabase = (data: DespesaSupabaseData): Despesa => {
  return {
    id: data.id,
    descricao: data.descricao,
    valor: data.valor,
    status: data.status,
    data_transacao: new Date(data.data_transacao),
    categoria: data.categoria,
    forma_pagamento: data.forma_pagamento,
    observacoes: data.observacoes,
    user_id: data.user_id,
    cliente_id: data.cliente_id,
    criado_em: data.criado_em,
    atualizado_em: data.atualizado_em
  };
};

// Função para buscar despesas com filtros
export const buscarDespesas = async (userId: string, filtros?: FiltroDespesa): Promise<Despesa[]> => {
  try {
    logger.debug('Iniciando busca de despesas', { userId }, 'financeiroDespesasService');
    
    // Verificar user_id
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      logger.security('ID de usuário inválido na busca de despesas', { userId }, 'financeiroDespesasService');
      throw new Error('ID de usuário inválido ou não fornecido');
    }
    
    let query = supabase
      .from('financeiro_despesas')
      .select('*')
      .eq('user_id', userId);
    
    // Aplicar filtros
    if (filtros) {
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
          // Buscar em múltiplos campos: descrição, categoria e observações
          query = query.or(`descricao.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,observacoes.ilike.%${searchTerm}%`);
        }
      }
    }
    
    // Ordenar por data (mais recente primeiro)
    query = query.order('data_transacao', { ascending: false });
    
    logger.debug('Executando consulta de despesas no Supabase', null, 'financeiroDespesasService');
    const { data, error } = await query;
    
    if (error) {
      logger.error('Erro ao buscar despesas', error, 'financeiroDespesasService');
      throw error;
    }
    
    const despesas = (data || []).map(converterDoSupabase);
    logger.debug(`${despesas.length} despesas encontradas`, null, 'financeiroDespesasService');
    
    return despesas;
  } catch (error) {
    logger.error('Exceção ao buscar despesas', error, 'financeiroDespesasService');
    throw error;
  }
};

// Função para criar uma nova despesa
export const criarDespesa = async (despesa: Omit<Despesa, 'id' | 'criado_em' | 'atualizado_em'>, userId: string): Promise<Despesa> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando criação de despesa', null, 'financeiroDespesasService');
      
      // Verificar user_id
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido fornecido', { userId }, 'financeiroDespesasService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      // Validar valor
      if (despesa.valor <= 0 || despesa.valor > 999999999) {
        logger.error('Valor financeiro fora do range permitido', { valor: despesa.valor }, 'financeiroDespesasService');
        throw new Error('Valor financeiro inválido');
      }
      
      // Converter para formato Supabase
      const despesaSupabase = converterParaSupabase(despesa, userId);
      
      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('financeiro_despesas')
        .insert(despesaSupabase)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao criar despesa no Supabase', error, 'financeiroDespesasService');
        throw new Error(`Erro ao criar despesa: ${error.message}`);
      }
      
      if (!data) {
        logger.error('Nenhum dado retornado após criação da despesa', null, 'financeiroDespesasService');
        throw new Error('Falha ao criar despesa: nenhum dado retornado');
      }
      
      logger.info('Despesa criada com sucesso', { id: data.id }, 'financeiroDespesasService');
      return converterDoSupabase(data);
    } catch (error) {
      logger.error('Exceção ao criar despesa', error, 'financeiroDespesasService');
      throw error;
    }
  }, 'criar_despesa');
};

// Função para atualizar uma despesa existente
export const atualizarDespesa = async (id: string, dadosAtualizados: Partial<Omit<Despesa, 'id' | 'criado_em' | 'atualizado_em'>>, userId: string): Promise<void> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando atualização de despesa', { id }, 'financeiroDespesasService');
      
      // Verificar se a despesa existe e pertence ao usuário
      const { data: despesaExistente, error: erroVerificacao } = await supabase
        .from('financeiro_despesas')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroVerificacao || !despesaExistente) {
        logger.error('Tentativa de atualizar despesa não autorizada', {
          id,
          userId,
          erro: erroVerificacao?.message
        }, 'financeiroDespesasService');
        throw new Error('Despesa não encontrada ou acesso negado');
      }
      
      // Validar dados atualizados
      const validacao = validarAtualizacaoDespesa(dadosAtualizados);
      
      if (!validacao.success) {
        logger.error('Dados inválidos fornecidos para atualização', validacao.error, 'financeiroDespesasService');
        throw new Error(`Validação falhou: ${validacao.error?.message}`);
      }
      
      const dadosValidados = validacao.data!;
      
      // Criar objeto com campos a serem atualizados
      const camposAtualizados: Record<string, unknown> = {
        atualizado_em: new Date().toISOString()
      };
      
      if (dadosValidados.descricao !== undefined) camposAtualizados.descricao = dadosValidados.descricao;
      if (dadosValidados.valor !== undefined) camposAtualizados.valor = dadosValidados.valor;
      if (dadosValidados.status !== undefined) camposAtualizados.status = dadosValidados.status;
      if (dadosValidados.data_transacao !== undefined) camposAtualizados.data_transacao = dadosValidados.data_transacao.toISOString();
      if (dadosValidados.categoria !== undefined) camposAtualizados.categoria = dadosValidados.categoria;
      if (dadosValidados.forma_pagamento !== undefined) camposAtualizados.forma_pagamento = dadosValidados.forma_pagamento;
      if (dadosValidados.observacoes !== undefined) camposAtualizados.observacoes = dadosValidados.observacoes;
      if (dadosValidados.cliente_id !== undefined) camposAtualizados.cliente_id = dadosValidados.cliente_id;
      
      // Atualizar despesa no banco de dados
      const { error } = await supabase
        .from('financeiro_despesas')
        .update(camposAtualizados)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Erro ao atualizar despesa no Supabase', error, 'financeiroDespesasService');
        throw new Error(`Erro ao atualizar despesa: ${error.message}`);
      }
      
      logger.info('Despesa atualizada com sucesso', { id }, 'financeiroDespesasService');
    } catch (error) {
      logger.error('Exceção ao atualizar despesa', error, 'financeiroDespesasService');
      throw error;
    }
  }, 'atualizar_despesa');
};

// Função para excluir uma despesa
export const excluirDespesa = async (id: string, userId: string): Promise<void> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando exclusão de despesa', { id }, 'financeiroDespesasService');
      
      // Verificar se a despesa existe e pertence ao usuário
      const { data: despesaExistente, error: erroVerificacao } = await supabase
        .from('financeiro_despesas')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroVerificacao || !despesaExistente) {
        logger.error('Tentativa de excluir despesa não autorizada', {
          id,
          userId,
          erro: erroVerificacao?.message
        }, 'financeiroDespesasService');
        throw new Error('Despesa não encontrada ou acesso negado');
      }
      
      // Excluir despesa
      const { error } = await supabase
        .from('financeiro_despesas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Erro ao excluir despesa no Supabase', error, 'financeiroDespesasService');
        throw new Error(`Erro ao excluir despesa: ${error.message}`);
      }
      
      logger.info('Despesa excluída com sucesso', { id }, 'financeiroDespesasService');
    } catch (error) {
      logger.error('Exceção ao excluir despesa', error, 'financeiroDespesasService');
      throw error;
    }
  }, 'excluir_despesa');
};

// Função para buscar o resumo de despesas (total)
export const buscarResumoDespesas = async (userId: string, filtros?: FiltroDespesa): Promise<{
  totalDespesas: number;
}> => {
  try {
    const despesas = await buscarDespesas(userId, filtros);
    
    const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
      
    return {
      totalDespesas
    };
  } catch (error) {
    logger.error('Exceção ao buscar resumo de despesas', error, 'financeiroDespesasService');
    throw error;
  }
};

// Mapeamento de status para legibilidade em português
export const mapearStatus = {
  pendente: 'Pendente',
  pago: 'Pago',
  cancelado: 'Cancelado',
  vencido: 'Vencido'
};

// Categorias de despesas
export const categoriasDespesa = [
  "Equipamento", 
  "Software", 
  "Marketing", 
  "Transporte", 
  "Alimentação", 
  "Locação", 
  "Impostos", 
  "Outro"
];