import { supabase } from '@/lib/supabase';

export interface UploadImageOptions {
  bucket?: string;
  path?: string;
  resize?: {
    width: number;
    height: number;
  };
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  options: UploadImageOptions = {}
): Promise<UploadImageResult> {
  try {
    const {
      bucket = 'imagens',
      path = `uploads/${Date.now()}_${file.name}`,
    } = options;

    // Upload para o storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro no upload:', error);
      }
      throw new Error(`Erro no upload: ${error.message}`);
    }
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log('Arquivo enviado com sucesso, caminho:', data?.path);
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log('URL pública gerada:', publicUrl);
    }

    // Salvar referência na tabela imagens
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('imagens')
        .insert({
          url: publicUrl,
          nome: file.name,
          user_id: user.id,
          criado_em: new Date().toISOString()
        });
    }

    return {
      success: true,
      url: publicUrl,
      path: path
    };

  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro no upload de imagem:', error);
    }
    throw error;
  }
}

/**
 * Save image information to database after upload
 * @param url The public URL of the uploaded image
 * @param filename Original filename
 * @param filesize Size of the file in bytes
 * @param mimetype MIME type of the file
 * @param userId User ID who uploaded the file
 * @returns The database entry ID
 */
export const saveImageToDatabase = async (
  url: string,
  filename: string,
  filesize: number,
  mimetype: string,
  userId: string
): Promise<string> => {
  try {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log('Salvando metadados da imagem no banco de dados');
    }
    
    const { data, error } = await supabase
      .from('imagens')
      .insert({
        url,
        nome: filename,
        user_id: userId,
        criado_em: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao salvar imagem no banco:', error);
      }
      throw new Error(`Erro ao salvar imagem no banco: ${error.message}`);
    }
    
    return data.id;
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao salvar metadados da imagem:', error);
    }
    throw error;
  }
};

/**
 * ✅ AMAZON S3 IMPLEMENTADO - SUBSTITUI N8N
 * Upload company logo using Amazon S3 and save URL to database
 * @param file The logo image file
 * @param userId User ID
 * @returns The Amazon S3 URL of the uploaded logo
 */
export const uploadCompanyLogo = async (file: File, userId: string): Promise<string> => {
  try {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log('[uploadCompanyLogo] Usando Amazon S3 para upload do logo:', file.name);
    }
    
    // Import S3 service
    const { uploadMultipleFilesConcurrent } = await import('@/services/s3Service');
    
    const formFields = {
      userId,
      tipo: 'logo_empresa',
      filename: file.name,
      source: 'company_logo_upload',
      categoria: 'empresa'
    };
    
    // Upload via S3
    const result = await uploadMultipleFilesConcurrent([file], formFields);
    
    if (!result.success || !result.urls?.[0]) {
      throw new Error(result.error || 'Falha no upload do logo para S3');
    }
    
    // Verificar configurações da empresa
    const { data: empresaConfig } = await supabase
      .from('configuracoes_empresa')
      .select('logo_url')
      .eq('user_id', userId)
      .single();

    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log('Configurações da empresa:', empresaConfig);
      console.log('Logo da empresa enviado com sucesso para S3:', result.urls[0]);
    }
    
    return result.urls[0];

    /* CÓDIGO ORIGINAL N8N COMENTADO
    
    // Import N8N service for file upload
    const { enviarImagemParaN8N } = await import('@/services/portfolioImageService');
    
    const formFields = {
      userId,
      tipo: 'logo_empresa',
      filename: file.name,
      source: 'company_logo_upload'
    };
    
    // Send to storage service via N8N
    const fileUrl = await enviarImagemParaN8N(file, formFields);
    
    // Verificar configurações da empresa
    const { data: empresaConfig } = await supabase
      .from('configuracoes_empresa')
      .select('logo_url')
      .eq('user_id', userId)
      .single();

    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.log('Configurações da empresa:', empresaConfig);
      console.log('Logo da empresa enviado com sucesso:', fileUrl);
    }
    
    return fileUrl;
    
    */
    
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao fazer upload do logo da empresa:', error);
    }
    throw new Error('Upload de logo falhou.');
  }
};

export async function deleteImage(path: string, bucket = 'imagens'): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao deletar imagem:', error);
      }
      return false;
    }

    return true;
  } catch (error) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro ao deletar imagem:', error);
    }
    return false;
  }
}
