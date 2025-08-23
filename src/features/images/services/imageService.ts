import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export interface ImageData {
  id: string;
  url: string;
  user_id: string;
  filename?: string;
  filesize?: number;
  mimetype?: string;
  created_at: string;
}

// Interface para imagens do portfólio (corrigida)
export interface ImagemPortfolio {
  id: string;
  user_id: string;
  referencia_id: string;
  tipo: string;
  filename: string;
  url: string;
  thumbnail_url?: string;
  filesize?: number;
  mimetype?: string;
  ordem: number;
  criado_em: string;
  atualizado_em?: string;
}

export const imageService = {
  async uploadImage(file: File, userId: string): Promise<ImageData | null> {
    try {
      // ✅ SUPABASE STORAGE IMPLEMENTADO
      console.log('[imageService.uploadImage] Usando Supabase Storage:', file.name);
      
      // Import Supabase Storage service
      const { uploadImageToSupabase } = await import('@/services/image/supabaseStorage');
      
      // Upload via Supabase Storage
      const imageUrl = await uploadImageToSupabase(file, 'uploads');
      
      const imageData: ImageData = {
        id: `supabase-${Date.now()}`,
        url: imageUrl,
        user_id: userId,
        filename: file.name,
        filesize: file.size,
        mimetype: file.type,
        created_at: new Date().toISOString()
      };
      
      // Save metadata to database
      const { data, error } = await supabase
        .from('imagens')
        .insert({
          url: imageUrl,
          user_id: userId,
          nome: file.name,
          criado_em: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Erro ao salvar metadados:', error);
        // Continue anyway since we have the Supabase Storage URL
      } else {
        imageData.id = data.id;
      }
      
      return imageData;

      /* CÓDIGO ORIGINAL N8N COMENTADO
      
      // Como não temos tabela de imagens configurada para upload, 
      // vamos retornar dados mock para evitar erros
      console.log('Upload simulado para arquivo:', file.name);
      
      // Import N8N service for file upload
      const { enviarImagemParaN8N } = await import('@/services/portfolioImageService');
      
      const formFields = {
        userId,
        tipo: 'imagem_geral',
        filename: file.name,
        source: 'image_service_upload'
      };
      
      // Send to storage service via N8N
      const fileUrl = await enviarImagemParaN8N(file, formFields);
      
      const imageData: ImageData = {
        id: `file-${Date.now()}`,
        url: fileUrl,
        user_id: userId,
        filename: file.name,
        filesize: file.size,
        mimetype: file.type,
        created_at: new Date().toISOString()
      };
      
      // Save metadata to database
      const { data, error } = await supabase
        .from('imagens')
        .insert({
          url: driveUrl,
          user_id: userId,
          nome: file.name,
          criado_em: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Erro ao salvar metadados:', error);
        // Continue anyway since we have the Drive URL
      } else {
        imageData.id = data.id;
      }
      
      return imageData;
      
      */
      
    } catch (error) {
      console.error('Erro no upload de imagem (Supabase Storage):', error);
      return null;
    }
  },

  async getImages(userId: string): Promise<ImageData[]> {
    try {
      // Buscar imagens da tabela 'imagens' consolidada
      const { data, error } = await supabase
        .from('imagens')
        .select('*')
        .eq('user_id', userId)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar imagens:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        url: item.url,
        user_id: item.user_id,
        filename: item.nome || undefined,
        filesize: undefined, // tabela imagens não tem este campo
        mimetype: undefined, // tabela imagens não tem este campo
        created_at: item.criado_em || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      return [];
    }
  },

  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Simula deletar imagem da tabela 'imagens'
      const { error } = await supabase
        .from('imagens')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }
};

// ✅ SUPABASE STORAGE IMPLEMENTADO
// Funções adicionais necessárias para compatibilidade
export const handleImageUpload = async (file: File): Promise<string> => {
  try {
    console.log('[handleImageUpload] Usando Supabase Storage:', file.name);
    
    // Import Supabase Storage service
    const { uploadImageToSupabase } = await import('@/services/image/supabaseStorage');
    
    // Upload via Supabase Storage
    const imageUrl = await uploadImageToSupabase(file, 'uploads');
    
    console.log('Upload concluído via Supabase Storage. URL:', imageUrl);
    
    return imageUrl;

    /* CÓDIGO ORIGINAL N8N COMENTADO
    
    const { enviarImagemParaN8N } = await import('@/services/portfolioImageService');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const formFields = {
      userId: user.id,
      tipo: 'imagem_geral',
      filename: file.name,
      source: 'handle_image_upload'
    };
    
    // Send to storage service via N8N
    const fileUrl = await enviarImagemParaN8N(file, formFields);
    console.log('Upload concluído via N8N. URL:', fileUrl);
    
    return fileUrl;
    
    */
    
  } catch (error) {
    console.error('Erro no handleImageUpload (Supabase Storage):', error);
    throw error;
  }
};

export const getPortfolioImages = async (): Promise<ImageData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    const { data, error } = await supabase
      .from('imagens')
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

export const deletePortfolioImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // Primeiro verificamos se a imagem pertence ao usuário
    const { data: imagem, error: errorConsulta } = await supabase
      .from('imagens')
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
      .from('imagens')
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

// Função simplificada sem usar tabelas que não existem
export const buscarImagensTrabalho = async (trabalhoId: string): Promise<ImagemPortfolio[]> => {
  try {
    console.log('Busca de imagens do trabalho simulada para ID:', trabalhoId);
    
    // Retornar array vazio pois a tabela portfolio_imagens não existe no Supabase atual
    return [];

  } catch (error) {
    logger.error('Erro ao buscar imagens do trabalho:', error);
    return [];
  }
};
