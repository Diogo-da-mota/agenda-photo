
import { supabase } from '@/lib/supabase';

export const generateThumbnail = async (imageUrl: string, maxWidth = 200, maxHeight = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Calcular dimensões proporcionais
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Criar canvas para o thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar a imagem redimensionada
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Converter para data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnailUrl);
      } catch (error) {
        console.error('Erro ao gerar thumbnail:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Erro ao carregar imagem para thumbnail:', error);
      reject(new Error('Falha ao carregar imagem para geração de thumbnail'));
    };
    
    img.src = imageUrl;
  });
};

// Função para processamento em lote
export async function processFilesQueue(files: File[], callbacks: any) {
  const results: any[] = [];
  
  if (!files.length) return results;
  
  if (callbacks.onStart) {
    callbacks.onStart(files.length);
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (callbacks.onProgress) {
      callbacks.onProgress(i, files.length, file);
    }
    
    try {
      // Utiliza a função de imageService agora
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Usuário não autenticado');

      const ext = file.name.split('.').pop();
      const fileName = `${userData.user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      const url = urlData.publicUrl;
      
      results.push({ url, file, success: true });
      
      if (callbacks.onFileSuccess) {
        callbacks.onFileSuccess(url, i, {});
      }
    } catch (error) {
      console.error(`Erro no upload do arquivo ${i + 1}/${files.length}:`, error);
      
      results.push({ 
        url: '', 
        file, 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      });
      
      if (callbacks.onFileError) {
        callbacks.onFileError(
          error instanceof Error ? error : new Error(String(error)),
          file,
          i
        );
      }
    }
  }
  
  if (callbacks.onComplete) {
    callbacks.onComplete(results);
  }
  
  return results;
}
