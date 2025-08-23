
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import { logStorageOperation } from './monitoringService';

/**
 * Store image URL in Supabase
 */
export const storeImageUrl = async (
  imageUrl: string, 
  filename: string, 
  filesize: number,
  mimetype: string,
  produtoId?: string,
  thumbnailUrl?: string
): Promise<string> => {
  try {
    logger.debug('Armazenando URL da imagem no Supabase', { fileName: filename, size: filesize }, 'storageService');
    
    // Iniciar timer para medir performance
    const startTime = performance.now();
    
    // Obtendo usuário autenticado com validação robusta
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logger.error('Erro ao obter usuário autenticado', userError, 'storageService');
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    
    if (!userData.user || !userData.user.id) {
      logger.error('Usuário não autenticado ou ID ausente', null, 'storageService');
      throw new Error('Você precisa estar autenticado para salvar imagens');
    }
    
    const userId = userData.user.id;
    
    // Validação dos dados a serem inseridos
    if (!imageUrl || !filename || !filesize) {
      throw new Error('Dados incompletos da imagem para armazenamento');
    }
    
    // Log detalhado dos dados a serem inseridos
    logger.debug('Dados da imagem a serem armazenados', {
      url: imageUrl.substring(0, 30) + '...',
      filename,
      filesize: (filesize / 1024).toFixed(2) + 'KB',
      mimetype,
      user_id: userId,
      thumbnail: thumbnailUrl ? 'presente' : 'ausente'
    }, 'storageService');
    
    // Inserção usando a tabela 'imagens'
    const { data, error } = await supabase
      .from('imagens')
      .insert({
        url: imageUrl,
        nome: filename,
        user_id: userId,
        criado_em: new Date().toISOString()
      })
      .select('id')
      .single();
    
    // Calcular duração da operação
    const duration = Math.round(performance.now() - startTime);
    logger.debug(`Tempo para salvar no banco: ${duration}ms`, null, 'storageService');
    
    if (error) {
      logger.error('Erro ao armazenar URL no Supabase', error, 'storageService');
      
      // Registrar falha de persistência
      await logStorageOperation('insert', false, error.message, duration);
      
      // Tratamento específico de erros do Supabase
      if (error.code === '23505') {
        throw new Error('Esta imagem já foi cadastrada anteriormente');
      } else if (error.code === '23503') {
        throw new Error('Referência inválida de produto');
      } else {
        throw new Error(`Erro ao salvar dados da imagem: ${error.message}`);
      }
    }
    
    if (!data || !data.id) {
      throw new Error('Falha ao obter ID da imagem após inserção');
    }
    
    // Registrar sucesso de persistência
    await logStorageOperation('insert', true, null, duration);
    
    logger.info('URL da imagem armazenada com sucesso. ID:', data.id, 'storageService');
    return data.id;
  } catch (error) {
    logger.error('Erro geral ao armazenar URL da imagem', error, 'storageService');
    throw error;
  }
};

/**
 * Get all images for the current user
 */
export const getUserImages = async (options?: {
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: 'created_at' | 'filesize';
  sortDirection?: 'asc' | 'desc';
  withThumbnails?: boolean;
}) => {
  const startTime = performance.now();
  
  try {
    logger.debug('Buscando imagens do usuário atual', options, 'storageService');
    
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      // Log de erro removido para produção
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    
    if (!userData.user || !userData.user.id) {
      // Log de erro removido para produção
      throw new Error('Você precisa estar autenticado para ver suas imagens');
    }
    
    const userId = userData.user.id;
    
    // Configuração de paginação e ordenação
    const limit = options?.limit || 50;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy || 'created_at';
    const sortDirection = options?.sortDirection || 'desc';
    
    // Iniciar consulta usando a tabela 'imagens'
    let query = supabase
      .from('imagens')
      .select('*')
      .eq('user_id', userId);
    
    // Adicionar filtros de busca se fornecidos
    if (options?.search) {
      query = query.ilike('nome', `%${options.search}%`);
    }
    
    // Adicionar paginação e ordenação
    query = query
      .order(sortBy === 'created_at' ? 'criado_em' : 'nome', { ascending: sortDirection === 'asc' })
      .range(offset, offset + limit - 1);
    
    // Executar consulta
    const { data, error, count } = await query;
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) {
      // Log de erro removido para produção
      
      // Registrar falha na operação de seleção
      await logStorageOperation('select', false, error.message, duration);
      
      throw new Error(`Erro ao buscar imagens: ${error.message}`);
    }
    
    // Registrar sucesso da operação
    await logStorageOperation('select', true, null, duration);
    
    // Log removido para produção
    return data || [];
  } catch (error) {
    // Log de erro removido para produção
    throw error;
  }
};

/**
 * Delete an image by ID
 */
export const deleteImage = async (imageId: string): Promise<boolean> => {
  const startTime = performance.now();
  
  try {
    // Log removido para produção
    
    // Verificar autenticação
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      // Log de erro removido para produção
      throw new Error('Você precisa estar autenticado para excluir imagens');
    }
    
    // Verificar se a imagem pertence ao usuário antes de excluir
    const { data: imageData, error: imageError } = await supabase
      .from('imagens')
      .select('user_id')
      .eq('id', imageId)
      .single();
      
    if (imageError) {
      // Log de erro removido para produção
      throw new Error('Imagem não encontrada ou você não tem permissão para excluí-la');
    }
    
    if (imageData.user_id !== userData.user.id) {
      // Log de erro removido para produção
      throw new Error('Você não tem permissão para excluir esta imagem');
    }
    
    // Exclusão com tratamento de erro
    const { error } = await supabase
      .from('imagens')
      .delete()
      .eq('id', imageId);
    
    const duration = Math.round(performance.now() - startTime);
    
    if (error) {
      // Log de erro removido para produção
      
      // Registrar falha na operação de exclusão
      await logStorageOperation('delete', false, error.message, duration);
      
      throw new Error(`Falha ao excluir imagem: ${error.message}`);
    }
    
    // Registrar sucesso da operação
    await logStorageOperation('delete', true, null, duration);
    
    // Log removido para produção
    return true;
  } catch (error) {
    // Log de erro removido para produção
    throw error;
  }
};

/**
 * Obter estatísticas de imagens do usuário
 */
export const getUserImageStats = async () => {
  try {
    console.log('📊 Obtendo estatísticas de imagens');
    
    // Verificar autenticação
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      // Log de erro removido para produção
      throw new Error('Você precisa estar autenticado para ver estatísticas');
    }
    
    // Consulta para obter estatísticas
    const { data, error } = await supabase
      .from('imagens')
      .select('*')
      .eq('user_id', userData.user.id);
    
    if (error) {
      // Log de erro removido para produção
      throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
    
    // Calcular estatísticas
    const stats = {
      totalImages: data.length,
      totalSize: 0, // Não temos campo filesize na tabela imagens
      averageSize: 0,
      byType: {} as Record<string, number>
    };
    
    // Log removido para produção
    return stats;
  } catch (error) {
    // Log de erro removido para produção
    throw error;
  }
};
