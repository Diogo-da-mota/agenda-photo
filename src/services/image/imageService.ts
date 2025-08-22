import { supabase } from '@/lib/supabase';

export interface ImageData {
  id: string;
  url: string;
  user_id: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
  created_at: string;
}

/**
 * Busca todas as imagens do usuário atual usando a tabela 'imagens'
 */
export const buscarImagens = async (): Promise<ImageData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
.from('entregar_imagens')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar imagens:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      url: item.url,
      user_id: item.user_id || '',
      filename: item.nome || undefined,
      filesize: undefined,
      mimetype: undefined,
      created_at: item.criado_em || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Exceção ao buscar imagens:', error);
    return [];
  }
};

/**
 * Salva os metadados da imagem após upload via N8N
 */
export const salvarMetadadosImagem = async (
  url: string,
  filename: string,
  filesize: number,
  mimetype: string,
  referenciaId?: string
): Promise<{ success: boolean; imageId?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
.from('entregar_imagens')
      .insert({
        url,
        user_id: user.id,
        nome: filename,
        criado_em: new Date().toISOString()
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Erro ao salvar metadados da imagem:', error);
      return { success: false };
    }
    
    return { success: true, imageId: data.id };
  } catch (error) {
    console.error('Exceção ao salvar metadados da imagem:', error);
    return { success: false };
  }
};

/**
 * Deleta uma imagem pelo ID
 */
export const deletarImagem = async (id: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Primeiro verificamos se a imagem pertence ao usuário
    const { data: imagem, error: errorConsulta } = await supabase
.from('entregar_imagens')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
      
    if (errorConsulta || !imagem) {
      console.error('Erro ao verificar propriedade da imagem:', errorConsulta);
      return false;
    }
    
    // Depois deletamos a imagem
    const { error: errorDelete } = await supabase
.from('entregar_imagens')
      .delete()
      .eq('id', id);
      
    if (errorDelete) {
      console.error('Erro ao deletar imagem:', errorDelete);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exceção ao deletar imagem:', error);
    return false;
  }
};

/**
 * ✅ AMAZON S3 IMPLEMENTADO - SUBSTITUI N8N
 * Upload de imagem via Amazon S3
 */
export const handleImageUpload = async (file: File): Promise<string> => {
  try {
    console.log('[handleImageUpload] Usando Amazon S3 para upload:', file.name);
    
    // Import S3 service
    const { uploadMultipleFilesConcurrent } = await import('@/services/s3Service');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const formFields = {
      userId: user.id,
      tipo: 'imagem_geral',
      filename: file.name,
      source: 'image_upload',
      categoria: 'geral'
    };
    
    // Upload via Amazon S3
    const result = await uploadMultipleFilesConcurrent([file], formFields);
    
    if (!result.success || !result.urls?.[0]) {
      throw new Error(result.error || 'Falha no upload para Amazon S3');
    }
    
    // Save metadata to database
    await salvarMetadadosImagem(result.urls[0], file.name, file.size, file.type);
    
    console.log('Upload concluído com sucesso via Amazon S3. URL:', result.urls[0]);
    return result.urls[0];

    /* CÓDIGO ORIGINAL N8N COMENTADO
    
    // Import N8N service for file upload
    const { enviarImagemParaN8N } = await import('@/services/portfolioImageService');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const formFields = {
      userId: user.id,
      tipo: 'imagem_geral',
      filename: file.name,
      source: 'image_upload'
    };
    
    // Send to storage service via N8N
    const fileUrl = await enviarImagemParaN8N(file, formFields);
    
    // Save metadata to database
    await salvarMetadadosImagem(fileUrl, file.name, file.size, file.type);
    
    console.log('Upload concluído com sucesso. URL:', fileUrl);
    return fileUrl;
    
    */
    
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

/**
 * Busca todas as imagens do portfólio do usuário
 */
export const getPortfolioImages = async (): Promise<ImageData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
.from('entregar_imagens')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar imagens do portfólio:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      id: item.id,
      url: item.url,
      user_id: item.user_id || '',
      filename: item.nome || undefined,
      filesize: undefined,
      mimetype: undefined,
      created_at: item.criado_em || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Exceção ao buscar imagens do portfólio:', error);
    return [];
  }
};

/**
 * Deleta uma imagem do portfólio pela URL
 */
export const deletePortfolioImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Primeiro verificamos se a imagem pertence ao usuário
    const { data: imagem, error: errorConsulta } = await supabase
.from('entregar_imagens')
      .select('id')
      .eq('url', imageUrl)
      .eq('user_id', user.id)
      .single();
      
    if (errorConsulta || !imagem) {
      console.error('Erro ao verificar propriedade da imagem:', errorConsulta);
      return false;
    }
    
    // Depois deletamos a imagem
    const { error: errorDelete } = await supabase
      .from('entregar_imagens')
      .delete()
      .eq('id', imagem.id);
      
    if (errorDelete) {
      console.error('Erro ao deletar imagem do portfólio:', errorDelete);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exceção ao deletar imagem do portfólio:', error);
    return false;
  }
};
