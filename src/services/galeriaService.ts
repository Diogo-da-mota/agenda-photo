import { supabase } from '@/lib/supabase';
import { EntregarFotosFormData } from '@/types/entregar-fotos';
import { ImageFile, generateSlug, uploadImageToSupabase } from '@/utils/galeriaUtils';

export const carregarGalerias = async () => {
  const { data: galerias, error } = await supabase
    .from('v_galerias_agrupadas')
    .select(`
      galeria_grupo_id,
      titulo,
      slug,
      descricao,
      data_criacao,
      data_expiracao,
      status,
      total_fotos_real,
      total_acessos_galeria,
      total_downloads_galeria,
      permitir_download,
      permitir_compartilhamento,
      marca_dagua,
      data_criacao,
      ultima_atualizacao,
      senha_acesso
    `)
    .order('data_criacao', { ascending: false });

  if (error) {
    console.error('Erro ao carregar galerias:', error);
    throw new Error('Erro ao carregar galerias. Tente novamente.');
  }

  return galerias || [];
};

export const apagarGaleria = async (slug: string, titulo: string) => {
  // Confirmação antes de apagar
  const confirmacao = window.confirm(
    `Tem certeza que deseja apagar a galeria "${titulo}"?\n\nEsta ação não pode ser desfeita e irá remover:\n- Todas as fotos da galeria\n- Todos os dados relacionados\n- O link de acesso ficará inválido`
  );

  if (!confirmacao) return false;

  // 1. Buscar todas as imagens da galeria para construir os caminhos do storage
  const { data: imagens, error: imagensError } = await supabase
    .from('entregar_imagens')
    .select('nome_arquivo, user_id')
    .eq('slug', slug);

  if (imagensError) {
    console.error('Erro ao buscar imagens:', imagensError);
    throw new Error(`Erro ao buscar imagens: ${imagensError.message}`);
  }

  // 2. Deletar arquivos do Storage
  if (imagens && imagens.length > 0) {
    // Construir os caminhos corretos: user_id/slug/nome_arquivo
    const caminhos = imagens.map(img => `${img.user_id}/${slug}/${img.nome_arquivo}`);
    
    const { error: storageError } = await supabase.storage
      .from('entregar-imagens')
      .remove(caminhos);

    if (storageError) {
      console.warn('Erro ao deletar alguns arquivos do storage:', storageError);
      // Não interrompe o processo, pois os registros do banco são mais críticos
    }
  }

  // 3. Deletar registros do banco de dados
  const { error: deleteError } = await supabase
    .from('entregar_imagens')
    .delete()
    .eq('slug', slug);

  if (deleteError) {
    console.error('Erro ao deletar registros:', deleteError);
    throw new Error(`Erro ao deletar registros: ${deleteError.message}`);
  }

  return true;
};

export const criarGaleria = async (
  formData: EntregarFotosFormData,
  selectedImages: ImageFile[],
  onProgress: (progress: number) => void
) => {
  // Obter usuário atual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Gerar slug único baseado no título
  const baseSlug = generateSlug(formData.titulo);
  let slug = baseSlug;
  let counter = 1;

  // Verificar se o slug já existe
  while (true) {
    const { data: existingGallery } = await supabase
      .from('entregar_imagens')
      .select('galeria_grupo_id')
      .eq('slug', slug)
      .limit(1);

    if (!existingGallery || existingGallery.length === 0) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  onProgress(10);

  // Calcular data de expiração (30 dias a partir de hoje)
  const dataExpiracao = new Date();
  dataExpiracao.setDate(dataExpiracao.getDate() + 30);

  onProgress(20);

  const totalImages = selectedImages.length;
  const maxConcurrent = Math.min(20, Math.max(5, Math.ceil(totalImages / 10)));

  console.log(`🚀 Iniciando upload paralelo de ${totalImages} imagens (máx ${maxConcurrent} simultâneas)`);

  // Preparar dados para upload paralelo
  const uploadTasks = selectedImages.map((image, index) => {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${index + 1}-${image.file.name}`;
    
    if (image.file.size <= 0) {
      throw new Error(`Arquivo ${image.file.name} tem tamanho inválido (${image.file.size} bytes)`);
    }
    
    return {
      image,
      fileName,
      index,
      imagemData: {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao?.trim() || null,
        slug: slug,
        data_entrega: formData.data_entrega || null,
        data_expiracao: dataExpiracao.toISOString(),
        senha_acesso: formData.senha_acesso?.trim() || null,
        permitir_download: formData.permitir_download ?? true,
        permitir_compartilhamento: formData.permitir_compartilhamento ?? true,
        marca_dagua: formData.marca_dagua ?? false,
        status: 'ativa' as const,
        total_fotos: totalImages,
        nome_arquivo: fileName,
        nome_original: image.file.name,
        tamanho_arquivo: image.file.size,
        ordem: index + 1,
        destaque: index === 0,
        user_id: user.id
      }
    };
  });

  // Função para processar upload em lotes controlados
  const processarLoteUpload = async (tasks: typeof uploadTasks) => {
    const results = [];
    
    for (let i = 0; i < tasks.length; i += maxConcurrent) {
      const lote = tasks.slice(i, i + maxConcurrent);
      
      console.log(`📤 Processando lote ${Math.floor(i / maxConcurrent) + 1} (${lote.length} imagens)`);
      
      const lotePromises = lote.map(async (task) => {
        try {
          console.log(`📤 Upload: ${task.image.file.name}`);
          
          const imageUrl = await uploadImageToSupabase(task.image.file, task.fileName, slug);
          
          const imagemCompleta = {
            ...task.imagemData,
            url_imagem: imageUrl
          };
          
          // Log removido para produção
          return imagemCompleta;
          
        } catch (error) {
          // Log de erro removido para produção
          throw new Error(`Falha no upload de ${task.image.file.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      });
      
      const loteResults = await Promise.all(lotePromises);
      results.push(...loteResults);
      
      const progress = 20 + ((results.length) / totalImages) * 60;
      onProgress(progress);
    }
    
    return results;
  };

  // Executar uploads paralelos
  const imagensUploadData = await processarLoteUpload(uploadTasks);
  
  onProgress(85);
  console.log(`🎯 Todos os uploads concluídos. Preparando para inserir galeria no banco.`);

  // Criar múltiplos registros para cada imagem
  const galeriaGrupoId = crypto.randomUUID();
  const galeriaDataArray = imagensUploadData.map((img, index) => ({
    titulo: formData.titulo.trim(),
    descricao: formData.descricao?.trim() || null,
    slug: slug,
    data_entrega: formData.data_entrega || null,
    data_expiracao: dataExpiracao.toISOString(),
    senha_acesso: formData.senha_acesso?.trim() || null,
    permitir_download: formData.permitir_download ?? true,
    permitir_compartilhamento: formData.permitir_compartilhamento ?? true,
    marca_dagua: formData.marca_dagua ?? false,
    status: 'ativa',
    total_fotos: totalImages,
    user_id: user.id,
    nome_arquivo: img.nome_arquivo,
    nome_original: selectedImages[index].file.name,
    tamanho_arquivo: selectedImages[index].file.size,
    url_imagem: img.url_imagem,
    galeria_grupo_id: galeriaGrupoId,
    ordem: index + 1,
    e_imagem_principal: index === 0
  }));

  console.log('📦 Dados da galeria prontos para inserção:', galeriaDataArray);

  const { data: galeriasInseridas, error: insertError } = await supabase
    .from('entregar_imagens')
    .insert(galeriaDataArray)
    .select('id');

  if (insertError) {
    // Log de erro removido para produção - erro detalhado no insert da galeria
    console.error('Erro ao inserir galeria:', {
      error: insertError,
      message: insertError.message,
      details: insertError.details,
      hint: insertError.hint,
      code: insertError.code,
      dadosEnviados: galeriaDataArray
    });
    
    // Limpar arquivos do storage em caso de erro no banco
    const caminhos = imagensUploadData.map(img => `${user.id}/${slug}/${img.nome_arquivo}`);
    await supabase.storage.from('entregar-imagens').remove(caminhos);
    
    let errorMessage = `Erro ao salvar galeria: ${insertError.message}`;
    if (insertError.details) errorMessage += ` | Detalhes: ${insertError.details}`;
    if (insertError.hint) errorMessage += ` | Dica: ${insertError.hint}`;
    
    throw new Error(errorMessage);
  }

  // Log removido para produção

  onProgress(100);

  return {
    slug,
    galeriaUrl: `/entrega-fotos/${slug}`,
    senha: formData.senha_acesso || ''
  };
};