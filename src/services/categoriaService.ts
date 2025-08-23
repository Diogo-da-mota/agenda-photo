import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { simpleLogger as logger } from '@/utils/simpleLogger';
import { withRateLimit } from '@/utils/rateLimiter';

// Interface para categorias
export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  user_id: string;
  criado_em: string;
  atualizado_em: string;
}

// Função para buscar categorias por tipo
export const buscarCategorias = async (userId: string, tipo?: 'receita' | 'despesa'): Promise<Categoria[]> => {
  try {
    logger.debug('Iniciando busca de categorias', { userId, tipo }, 'categoriaService');
    
    // Verificar user_id
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      logger.security('ID de usuário inválido na busca de categorias', { userId }, 'categoriaService');
      throw new Error('ID de usuário inválido ou não fornecido');
    }
    
    let query = supabase
      .from('financeiro_categorias')
      .select('*')
      .eq('user_id', userId);
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    // Ordenar por nome
    query = query.order('nome', { ascending: true });
    
    logger.debug('Executando consulta de categorias no Supabase', null, 'categoriaService');
    const { data, error } = await query;
    
    if (error) {
      logger.error('Erro ao buscar categorias', error, 'categoriaService');
      throw error;
    }
    
    logger.debug(`${data?.length || 0} categorias encontradas`, null, 'categoriaService');
    
    return data || [];
  } catch (error) {
    logger.error('Exceção ao buscar categorias', error, 'categoriaService');
    throw error;
  }
};

// Função para criar uma nova categoria
export const criarCategoria = async (nome: string, tipo: 'receita' | 'despesa', userId: string): Promise<Categoria> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando criação de categoria', { nome, tipo }, 'categoriaService');
      
      // Verificar user_id
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido fornecido', { userId }, 'categoriaService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      // Validar nome
      if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
        logger.error('Nome de categoria inválido', { nome }, 'categoriaService');
        throw new Error('Nome de categoria inválido ou não fornecido');
      }
      
      // Verificar se a categoria já existe para este usuário
      const { data: categoriasExistentes } = await supabase
        .from('financeiro_categorias')
        .select('id')
        .eq('user_id', userId)
        .eq('tipo', tipo)
        .eq('nome', nome.trim())
        .limit(1);
      
      if (categoriasExistentes && categoriasExistentes.length > 0) {
        logger.warn('Tentativa de criar categoria duplicada', { nome, tipo, userId }, 'categoriaService');
        throw new Error('Já existe uma categoria com este nome');
      }
      
      // Preparar dados para inserção
      const agora = new Date().toISOString();
      const novaCategoria = {
        id: uuidv4(),
        nome: nome.trim(),
        tipo,
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora
      };
      
      // Inserir no banco de dados
      const { data, error } = await supabase
        .from('financeiro_categorias')
        .insert(novaCategoria)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao criar categoria no Supabase', error, 'categoriaService');
        throw new Error(`Erro ao criar categoria: ${error.message}`);
      }
      
      if (!data) {
        logger.error('Nenhum dado retornado após criação da categoria', null, 'categoriaService');
        throw new Error('Falha ao criar categoria: nenhum dado retornado');
      }
      
      logger.info('Categoria criada com sucesso', { id: data.id }, 'categoriaService');
      return data;
    } catch (error) {
      logger.error('Exceção ao criar categoria', error, 'categoriaService');
      throw error;
    }
  }, 'criar_categoria');
};

// Função para editar uma categoria existente
export const editarCategoria = async (id: string, nome: string, userId: string): Promise<Categoria> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando edição de categoria', { id, nome }, 'categoriaService');
      
      // Verificar user_id
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        logger.error('ID de usuário inválido fornecido', { userId }, 'categoriaService');
        throw new Error('ID de usuário inválido ou não fornecido');
      }
      
      // Validar nome
      if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
        logger.error('Nome de categoria inválido', { nome }, 'categoriaService');
        throw new Error('Nome de categoria inválido ou não fornecido');
      }
      
      // Verificar se a categoria existe e pertence ao usuário
      const { data: categoriaExistente, error: erroConsulta } = await supabase
        .from('financeiro_categorias')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroConsulta || !categoriaExistente) {
        logger.error('Tentativa de editar categoria não autorizada', { id, userId }, 'categoriaService');
        throw new Error('Categoria não encontrada ou acesso negado');
      }
      
      // Verificar se já existe outra categoria com o mesmo nome para este usuário
      const { data: categoriasExistentes } = await supabase
        .from('financeiro_categorias')
        .select('id')
        .eq('user_id', userId)
        .eq('tipo', categoriaExistente.tipo)
        .eq('nome', nome.trim())
        .neq('id', id)
        .limit(1);
      
      if (categoriasExistentes && categoriasExistentes.length > 0) {
        logger.warn('Tentativa de criar nome duplicado', { nome, userId }, 'categoriaService');
        throw new Error('Já existe uma categoria com este nome');
      }
      
      // Atualizar categoria
      const { data, error } = await supabase
        .from('financeiro_categorias')
        .update({
          nome: nome.trim(),
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        logger.error('Erro ao atualizar categoria', error, 'categoriaService');
        throw new Error(`Erro ao atualizar categoria: ${error.message}`);
      }
      
      if (!data) {
        logger.error('Nenhum dado retornado após atualização da categoria', null, 'categoriaService');
        throw new Error('Falha ao atualizar categoria: nenhum dado retornado');
      }
      
      logger.info('Categoria atualizada com sucesso', { id: data.id }, 'categoriaService');
      return data;
    } catch (error) {
      logger.error('Exceção ao editar categoria', error, 'categoriaService');
      throw error;
    }
  }, 'editar_categoria');
};

// Função para excluir uma categoria
export const excluirCategoria = async (id: string, userId: string): Promise<void> => {
  return await withRateLimit(async () => {
    try {
      logger.debug('Iniciando exclusão de categoria', { id }, 'categoriaService');
      
      // Verificar se a categoria existe e pertence ao usuário
      const { data: categoriaExistente, error: erroConsulta } = await supabase
        .from('financeiro_categorias')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (erroConsulta || !categoriaExistente) {
        logger.error('Tentativa de excluir categoria não autorizada', { id, userId }, 'categoriaService');
        throw new Error('Categoria não encontrada ou acesso negado');
      }
      
      // Excluir categoria
      const { error } = await supabase
        .from('financeiro_categorias')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        logger.error('Erro ao excluir categoria', error, 'categoriaService');
        throw new Error(`Erro ao excluir categoria: ${error.message}`);
      }
      
      logger.info('Categoria excluída com sucesso', { id }, 'categoriaService');
    } catch (error) {
      logger.error('Exceção ao excluir categoria', error, 'categoriaService');
      throw error;
    }
  }, 'excluir_categoria');
}; 