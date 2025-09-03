import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { withRateLimit } from '@/utils/rateLimiter';

// Interface para formas de pagamento
export interface FormaPagamento {
  id: string;
  nome: string;
  user_id: string;
  criado_em: string;
  atualizado_em: string;
}

// Função para buscar formas de pagamento
export const buscarFormasPagamento = async (userId: string): Promise<FormaPagamento[]> => {
  try {
    logger.debug('Iniciando busca de formas de pagamento', { userId }, 'formaPagamentoService');
    
    // Verificar user_id
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      logger.security('ID de usuário inválido na busca de formas de pagamento', { userId }, 'formaPagamentoService');
      throw new Error('ID de usuário inválido ou não fornecido');
    }
    
    let query = supabase
      .from('financeiro_formas_pagamento')
      .select('*')
      .eq('user_id', userId);
    
    // Ordenar por nome
    query = query.order('nome', { ascending: true });
    
    logger.debug('Executando consulta de formas de pagamento no Supabase', null, 'formaPagamentoService');
    const { data, error } = await query;
    
    if (error) {
      logger.error('Erro ao buscar formas de pagamento', error, 'formaPagamentoService');
      throw error;
    }
    
    logger.debug(`${data?.length || 0} formas de pagamento encontradas`, null, 'formaPagamentoService');
    
    return data || [];
  } catch (error) {
    logger.error('Exceção ao buscar formas de pagamento', error, 'formaPagamentoService');
    throw error;
  }
};

// Função para criar uma nova forma de pagamento
export const criarFormaPagamento = async (nome: string, userId: string): Promise<FormaPagamento> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando criação de forma de pagamento', { nome }, 'formaPagamentoService');
      
      // Verificar user_id
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido fornecido', { userId }, 'formaPagamentoService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      // Validar nome
      if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
        logger.error('Nome de forma de pagamento inválido', { nome }, 'formaPagamentoService');
        throw new Error('Nome de forma de pagamento inválido ou não fornecido');
      }
      
      // Verificar se a forma de pagamento já existe para este usuário
      const { data: formasPagamentoExistentes } = await supabase
        .from('financeiro_formas_pagamento')
        .select('id')
        .eq('user_id', userId)
        .eq('nome', nome.trim())
        .limit(1);
      
      if (formasPagamentoExistentes && formasPagamentoExistentes.length > 0) {
        logger.warn('Tentativa de criar forma de pagamento duplicada', { nome, userId }, 'formaPagamentoService');
        throw new Error('Já existe uma forma de pagamento com este nome');
      }
      
      // Preparar dados para inserção
      const agora = new Date().toISOString();
      const novaFormaPagamento = {
        id: uuidv4(),
        nome: nome.trim(),
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora
      };
      
      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('financeiro_formas_pagamento')
        .insert(novaFormaPagamento)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao criar forma de pagamento no Supabase', error, 'formaPagamentoService');
        throw new Error(`Erro ao criar forma de pagamento: ${error.message}`);
      }
      
      if (!data) {
        logger.error('Nenhum dado retornado após criação da forma de pagamento', null, 'formaPagamentoService');
        throw new Error('Falha ao criar forma de pagamento: nenhum dado retornado');
      }
      
      logger.info('Forma de pagamento criada com sucesso', { id: data.id }, 'formaPagamentoService');
      return data;
    } catch (error) {
      logger.error('Exceção ao criar forma de pagamento', error, 'formaPagamentoService');
      throw error;
    }
  }, 'criar_forma_pagamento');
};

// Função para editar uma forma de pagamento existente
export const editarFormaPagamento = async (id: string, nome: string, userId: string): Promise<FormaPagamento> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando edição de forma de pagamento', { id, nome }, 'formaPagamentoService');
      
      // Verificar user_id
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido fornecido', { userId }, 'formaPagamentoService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      // Validar nome
      if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
        logger.error('Nome de forma de pagamento inválido', { nome }, 'formaPagamentoService');
        throw new Error('Nome de forma de pagamento inválido ou não fornecido');
      }
      
      // Verificar se a forma de pagamento existe e pertence ao usuário
      const { data: formaPagamentoExistente, error: erroConsulta } = await supabase
        .from('financeiro_formas_pagamento')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroConsulta || !formaPagamentoExistente) {
        logger.error('Tentativa de editar forma de pagamento não autorizada', { id, userId }, 'formaPagamentoService');
        throw new Error('Forma de pagamento não encontrada ou acesso negado');
      }
      
      // Verificar se já existe outra forma de pagamento com o mesmo nome para este usuário
      const { data: formasPagamentoExistentes } = await supabase
        .from('financeiro_formas_pagamento')
        .select('id')
        .eq('user_id', userId)
        .eq('nome', nome.trim())
        .neq('id', id)
        .limit(1);
      
      if (formasPagamentoExistentes && formasPagamentoExistentes.length > 0) {
        logger.warn('Tentativa de criar nome duplicado', { nome, userId }, 'formaPagamentoService');
        throw new Error('Já existe uma forma de pagamento com este nome');
      }
      
      // Atualizar forma de pagamento
      const { data, error } = await supabase
        .from('financeiro_formas_pagamento')
        .update({
          nome: nome.trim(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao atualizar forma de pagamento', error, 'formaPagamentoService');
        throw new Error(`Erro ao atualizar forma de pagamento: ${error.message}`);
      }
      
      if (!data) {
        logger.error('Nenhum dado retornado após atualização da forma de pagamento', null, 'formaPagamentoService');
        throw new Error('Falha ao atualizar forma de pagamento: nenhum dado retornado');
      }
      
      logger.info('Forma de pagamento atualizada com sucesso', { id: data.id }, 'formaPagamentoService');
      return data;
    } catch (error) {
      logger.error('Exceção ao editar forma de pagamento', error, 'formaPagamentoService');
      throw error;
    }
  }, 'editar_forma_pagamento');
};

// Função para excluir uma forma de pagamento
export const excluirFormaPagamento = async (id: string, userId: string): Promise<void> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando exclusão de forma de pagamento', { id }, 'formaPagamentoService');
      
      // Verificar se a forma de pagamento existe e pertence ao usuário
      const { data: formaPagamentoExistente, error: erroConsulta } = await supabase
        .from('financeiro_formas_pagamento')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroConsulta || !formaPagamentoExistente) {
        logger.error('Tentativa de excluir forma de pagamento não autorizada', { id, userId }, 'formaPagamentoService');
        throw new Error('Forma de pagamento não encontrada ou acesso negado');
      }
      
      // Excluir forma de pagamento
      const { error } = await supabase
        .from('financeiro_formas_pagamento')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Erro ao excluir forma de pagamento', error, 'formaPagamentoService');
        throw new Error(`Erro ao excluir forma de pagamento: ${error.message}`);
      }
      
      logger.info('Forma de pagamento excluída com sucesso', { id }, 'formaPagamentoService');
    } catch (error) {
      logger.error('Exceção ao excluir forma de pagamento', error, 'formaPagamentoService');
      throw error;
    }
  }, 'excluir_forma_pagamento');
}; 