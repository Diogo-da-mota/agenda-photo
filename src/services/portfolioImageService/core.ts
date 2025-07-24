import { logger } from '@/utils/logger';
import { N8N_WEBHOOK_URL } from './config';
import { N8NImageResponse, ProgressCallback } from './types';
import { extractFileUrl, createFormData, logDiagnosticInfo, logResponseInfo } from './utils';

/**
 * ✅ SUPABASE STORAGE IMPLEMENTADO
 * Envia imagem para Supabase Storage e retorna URL
 */
export const enviarImagemParaN8N = async (
  file: File, 
  formFields: any
): Promise<string> => {
  logger.info('[enviarImagemParaN8N] Usando Supabase Storage:', {
    fileName: file.name,
    fileSize: file.size,
    formFields: { ...formFields, arquivo: '[FILE]' }
  });

  // Import Supabase Storage service 
  const { uploadImageToSupabase } = await import('@/services/image/supabaseStorage');
  
  // Upload via Supabase Storage
  const imageUrl = await uploadImageToSupabase(file, 'uploads');

  logger.info('[enviarImagemParaN8N] Upload via Supabase Storage bem-sucedido:', imageUrl);
  return imageUrl;
};

/**
 * ✅ SUPABASE STORAGE IMPLEMENTADO
 * Envia múltiplas imagens para Supabase Storage e retorna URLs
 */
export const enviarImagensParaN8N = async (
  files: File[], 
  formFields: any,
  onProgress?: ProgressCallback
): Promise<string[]> => {
  logger.info('[enviarImagensParaN8N] Usando Supabase Storage:', {
    quantidade: files.length,
    formFields: { ...formFields, arquivos: '[FILES]' }
  });

  // Import Supabase Storage service
  const { uploadImageToSupabase } = await import('@/services/image/supabaseStorage');

  const urls: string[] = [];

  // Enviar cada arquivo individualmente
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Notificar progresso
    onProgress?.(i, files.length, file.name);
    
    // Upload via Supabase Storage
    const imageUrl = await uploadImageToSupabase(file, 'uploads');
    urls.push(imageUrl);
    
    // Notificar progresso do arquivo concluído
    onProgress?.(i + 1, files.length, `${file.name} - Concluído`);
  }

  logger.info('[enviarImagensParaN8N] Upload múltiplo via Supabase Storage bem-sucedido:', {
    quantidade: urls.length,
    urls: urls
  });

  return urls;
};

/* CÓDIGO ORIGINAL N8N COMENTADO - REMOVER APÓS MIGRAÇÃO SUPABASE STORAGE

export const enviarImagemParaN8NOriginal = async (
  file: File, 
  formFields: any
): Promise<string> => {
  try {
    logger.info('[enviarImagemParaN8N] Enviando imagem para N8N:', {
      fileName: file.name,
      fileSize: file.size,
      formFields: { ...formFields, arquivo: '[FILE]' }
    });

    // Criar FormData com todos os campos do formulário e o arquivo
    const formData = createFormData(file, formFields);
    
    // Log diagnóstico detalhado
    logDiagnosticInfo(file, formFields, formData);

    console.log('🔍 [DIAGNÓSTICO PARTE 4] === DADOS ENVIADOS PARA N8N ===');
    console.log('🔍 [DIAGNÓSTICO PARTE 4] URL:', N8N_WEBHOOK_URL);
    console.log('🔍 [DIAGNÓSTICO PARTE 4] Method: POST');
    console.log('🔍 [DIAGNÓSTICO PARTE 4] Mode: cors');
    console.log('🔍 [DIAGNÓSTICO PARTE 4] Enviando requisição para N8N...');

    // Enviar para N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      mode: 'cors',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ HTTP ERROR:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}. Response: ${errorText}`);
    }

    // Ler resposta como texto primeiro
    const responseText = await response.text();
    logResponseInfo(response, responseText);

    // Tentar fazer parse do JSON
    let result: N8NImageResponse;
    try {
      result = JSON.parse(responseText);
      console.log('🔍 [DIAGNÓSTICO PARTE 4] ✅ JSON VÁLIDO:', result);
    } catch (parseError) {
      console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ ERRO PARSE JSON:', parseError);
      console.error('🔍 [DIAGNÓSTICO PARTE 4] Response text:', responseText.substring(0, 200));
      throw new Error('N8N retornou resposta não-JSON: ' + responseText.substring(0, 100));
    }

    // Verificar se a resposta indica sucesso e tem URL
    if (result.success && result.url) {
      const fileUrl = extractFileUrl(result);
      
      if (!fileUrl) {
        console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ URL DO DRIVE NÃO ENCONTRADA:', result);
        throw new Error('N8N não retornou URL do Drive em nenhum campo esperado');
      }

      if (!result.success) {
        console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ N8N indicou falha:', result.message);
        throw new Error(result.message || 'N8N indicou falha no upload');
      }

      console.log('🔍 [DIAGNÓSTICO PARTE 4] ✅ URL EXTRAÍDA:', fileUrl);
      
      logger.info('[enviarImagemParaN8N] ✅ Sucesso! URL recebida:', {
        fileName: file.name,
        fileUrl,
        fullResponse: result
      });

      return fileUrl;
    } else {
      console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ ERRO em enviarImagemParaN8N:', error);
      console.error('🔍 [DIAGNÓSTICO PARTE 4] Arquivo:', file.name);
      console.error('🔍 [DIAGNÓSTICO PARTE 4] FormFields:', formFields);
      console.error('🔍 [DIAGNÓSTICO PARTE 4] Stack:', error.stack);
    }

    logger.error('[enviarImagemParaN8N] ❌ Erro ao enviar para N8N:', error);
    throw error;
  }
};

export const enviarImagensParaN8NOriginal = async (
  files: File[], 
  formFields: any,
  onProgress?: ProgressCallback
): Promise<string[]> => {
  try {
    logger.info('[enviarImagensParaN8N] Enviando múltiplas imagens para N8N:', {
      quantidade: files.length,
      formFields: { ...formFields, arquivos: '[FILES]' }
    });

    const urls: string[] = [];

    // Enviar cada arquivo individualmente
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Notificar progresso
      onProgress?.(i, files.length, file.name);
      
      // Adicionar índice aos campos do formulário para múltiplas imagens
      const fieldsComIndice = {
        ...formFields,
        imageIndex: i,
        totalImages: files.length
      };

      const fileUrl = await enviarImagemParaN8N(file, fieldsComIndice);
      urls.push(fileUrl);
      
      // Notificar progresso do arquivo concluído
      onProgress?.(i + 1, files.length, `${file.name} - Concluído`);
      
      // Adicionar intervalo de 1 segundo entre cada requisição
      // Não espera no último arquivo
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info('[enviarImagensParaN8N] ✅ Todas as imagens enviadas com sucesso:', {
      quantidade: urls.length,
      urls
    });

    return urls;

  } catch (error) {
    logger.error('[enviarImagensParaN8N] ❌ Erro ao enviar múltiplas imagens:', error);
    throw error;
  }
};

*/
