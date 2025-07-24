import { supabase } from '@/lib/supabase';
import { ConfiguracaoEmpresa } from './configuracaoEmpresaService';
import { simpleLogger as logger } from '@/utils/simpleLogger';

/**
 * Obtém as configurações da empresa para o usuário atual
 * @returns Configurações da empresa ou null se não encontradas
 */
export const getConfiguracoesEmpresa = async (): Promise<ConfiguracaoEmpresa | null> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.security('Tentativa de buscar configuração sem autenticação', null, 'empresaService');
      throw new Error('Usuário não autenticado');
    }
    
    // Usar a query genérica com from para evitar problemas de tipagem
    const { data, error } = await supabase
      .from('configuracoes_empresa')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      logger.error('Erro ao buscar configurações da empresa', error, 'empresaService');
      throw error;
    }
    
    return data;
  } catch (error) {
    logger.error('Exceção ao buscar configurações da empresa', error, 'empresaService');
    throw error;
  }
};

/**
 * Atualiza as configurações da empresa para o usuário atual
 * @param configuracoes Dados a serem atualizados
 * @returns true se a operação foi bem-sucedida, false caso contrário
 */
export const atualizarConfiguracoesEmpresa = async (configuracoes: Partial<ConfiguracaoEmpresa>): Promise<boolean> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.security('Tentativa de atualizar configuração sem autenticação', null, 'empresaService');
      throw new Error('Usuário não autenticado');
    }
    
    // Verificar se já existe configuração para o usuário
    const { data: existingConfig } = await supabase
      .from('configuracoes_empresa')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingConfig?.id) {
      // Se não existe, criar um novo
      return await criarConfiguracoesEmpresa(configuracoes);
    }

    // Remover campos que não devem ser enviados no update
    const { user_id, id, criado_em, ...dadosParaUpdate } = configuracoes as any;
    
    // Processar dados para permitir limpeza de campos (null em vez de string vazia)
    const dadosProcessados: any = {};
    
    Object.entries(dadosParaUpdate).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Se string vazia ou só espaços, enviar null para limpar campo
        dadosProcessados[key] = value.trim() === '' ? null : value.trim();
      } else if (value === null || value === undefined) {
        // Permitir null explícito para limpar campo
        dadosProcessados[key] = null;
      } else {
        // Outros tipos mantém como estão
        dadosProcessados[key] = value;
      }
    });
    
    // Atualizar timestamp
    const dadosAtualizados = {
      ...dadosProcessados,
      atualizado_em: new Date().toISOString(),
    };
    
    logger.debug('Dados que serão enviados para update', { dadosCount: Object.keys(dadosAtualizados).length }, 'empresaService');
    
    // CORREÇÃO: Encadeamento correto - .eq() antes do await
    const { error } = await supabase
      .from('configuracoes_empresa')
      .update(dadosAtualizados)
      .eq('user_id', user.id)
      .single(); // Garante retorno de um único objeto
    
    if (error) {
      logger.error('Erro ao atualizar configurações da empresa', error, 'empresaService');
      throw error;
    }
    
    logger.debug('Configurações da empresa atualizadas com sucesso', { userId: user.id }, 'empresaService');
    return true;
  } catch (error) {
    logger.error('Exceção ao atualizar configurações da empresa', error, 'empresaService');
    throw error;
  }
};

/**
 * Cria uma nova configuração de empresa para o usuário atual
 * @param configuracoes Dados da configuração
 * @returns true se a operação foi bem-sucedida, false caso contrário
 */
export const criarConfiguracoesEmpresa = async (configuracoes: Partial<ConfiguracaoEmpresa>): Promise<boolean> => {
  try {
    // Obter o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.security('Tentativa de criar configuração sem autenticação', null, 'empresaService');
      throw new Error('Usuário não autenticado');
    }
    
    // Processar dados para criar configuração
    const { user_id, id, criado_em, atualizado_em, ...dadosParaInserir } = configuracoes as any;
    
    // Processar strings vazias como null
    const dadosProcessados: any = {};
    
    Object.entries(dadosParaInserir).forEach(([key, value]) => {
      if (typeof value === 'string') {
        dadosProcessados[key] = value.trim() === '' ? null : value.trim();
      } else {
        dadosProcessados[key] = value;
      }
    });
    
    // Garantir que o user_id seja o do usuário atual
    const dadosConfig = {
      ...dadosProcessados,
      user_id: user.id,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('configuracoes_empresa')
      .insert(dadosConfig)
      .single(); // Garante retorno de um único objeto
    
    if (error) {
      logger.error('Erro ao criar configurações da empresa', error, 'empresaService');
      throw error;
    }
    
    logger.debug('Configurações da empresa criadas com sucesso', { userId: user.id }, 'empresaService');
    return true;
  } catch (error) {
    logger.error('Exceção ao criar configurações da empresa', error, 'empresaService');
    throw error;
  }
};

// Re-exportar a interface ConfiguracaoEmpresa
export type { ConfiguracaoEmpresa }; 