
import { supabase } from '@/lib/supabase';

export const uploadImageToSupabase = async (file: File, folder = 'uploads'): Promise<string> => {
  // Fluxo centralizado, bucket fixo 'images'
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user || !userData.user.id) throw new Error('Usuário não autenticado');

  const ext = file.name.split('.').pop();
  const userId = userData.user.id;
  const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
  return urlData.publicUrl;
};

export const listImagesFromSupabase = async (folder = 'uploads') => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .list(folder, {
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('Error listing files from Supabase Storage:', error);
      throw error;
    }
    
    console.log('Files listed from Supabase Storage:', data);
    
    // Add URLs to the file objects
    const filesWithUrls = data.map(file => {
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(`${folder}/${file.name}`);
      
      return {
        ...file,
        url: urlData.publicUrl
      };
    });
    
    return filesWithUrls;
  } catch (error) {
    console.error('Error in listImagesFromSupabase:', error);
    throw error;
  }
};

export const deleteImageFromSupabase = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      throw error;
    }
    
    console.log('File deleted successfully from Supabase Storage:', filePath);
    return true;
  } catch (error) {
    console.error('Error in deleteImageFromSupabase:', error);
    throw error;
  }
};
