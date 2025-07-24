import { supabase } from '@/lib/supabase';

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export const generateSlug = (titulo: string): string => {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

export const uploadImageToSupabase = async (file: File, fileName: string, slug: string): Promise<string> => {
  // Obter usuário atual para usar o UUID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('❌ Usuário não autenticado. Faça login e tente novamente.');
  }

  // Estrutura: bucket/uuid-fotografo/titulo-galeria/imagem
  const filePath = `${user.id}/${slug}/${fileName}`;

  console.log('📤 Iniciando upload:', {
    filePath,
    fileSize: file.size,
    fileType: file.type,
    userId: user.id,
    slug
  });

  const { data, error } = await supabase.storage
    .from('entregar-imagens')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('❌ Erro detalhado no upload:', {
      error,
      filePath,
      userId: user.id,
      slug,
      fileName
    });

    // Mensagens de erro mais específicas
    if (error.message.includes('row-level security policy')) {
      throw new Error(`🔒 Erro de permissão: Verifique se você tem acesso para fazer upload. Política RLS violada.`);
    } else if (error.message.includes('duplicate')) {
      throw new Error(`📁 Arquivo já existe: ${fileName}. Tente novamente.`);
    } else if (error.message.includes('size')) {
      throw new Error(`📏 Arquivo muito grande: ${fileName}. Máximo permitido: 10MB.`);
    } else {
      throw new Error(`💥 Erro no upload: ${error.message}`);
    }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('entregar-imagens')
    .getPublicUrl(data.path);

  console.log('✅ Upload bem-sucedido:', {
    filePath: data.path,
    publicUrl
  });

  return publicUrl;
};

export const processFiles = (files: File[]): { validImages: ImageFile[], hasInvalidFiles: boolean } => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  const hasInvalidFiles = imageFiles.length !== files.length;
  
  const validImages: ImageFile[] = imageFiles.map(file => ({
    file,
    preview: URL.createObjectURL(file),
    id: Math.random().toString(36).substr(2, 9)
  }));

  return { validImages, hasInvalidFiles };
};