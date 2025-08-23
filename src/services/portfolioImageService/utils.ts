import { logger } from '@/utils/logger';

// Interfaces para tipagem
interface UploadResult {
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  [key: string]: unknown;
}

interface FormFields {
  [key: string]: string | number | boolean | string[];
}

/**
 * Processa diferentes propriedades possíveis para encontrar a URL do arquivo
 */
export const extractFileUrl = (result: UploadResult): string | null => {
  const possibleUrlFields = ['url', 'fileUrl', 'downloadUrl'];
  
  for (const field of possibleUrlFields) {
    if (result[field]) {
      console.log(`🔍 [DIAGNÓSTICO PARTE 4] ✅ URL encontrada no campo '${field}':`, result[field]);
      return result[field];
    }
  }
  
  console.error('🔍 [DIAGNÓSTICO PARTE 4] ❌ Nenhuma URL encontrada nos campos esperados');
  console.error('🔍 [DIAGNÓSTICO PARTE 4] Campos disponíveis no resultado:', Object.keys(result));
  return null;
};

/**
 * Cria FormData com todos os campos necessários para o N8N
 */
export const createFormData = (file: File, formFields: FormFields): FormData => {
  const formData = new FormData();
  
  // Adicionar todos os campos do formulário
  Object.keys(formFields).forEach(key => {
    const value = formFields[key];
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  // Adicionar arquivo e metadados no formato correto para N8N
  // ✅ Usando índice 0 para compatibilidade com N8N workflow
  formData.append('file_0', file, file.name);
  formData.append('fileName_0', file.name);
  formData.append('fileSize_0', file.size.toString());
  formData.append('fileType_0', file.type);
  formData.append('totalFiles', '1'); // ✅ Campo obrigatório que estava faltando
  formData.append('source', 'agenda-pro-direct');
  formData.append('timestamp', new Date().toISOString());

  return formData;
};

/**
 * Log detalhado dos dados enviados para diagnóstico
 */
export const logDiagnosticInfo = (file: File, formFields: FormFields, formData: FormData) => {
  console.log('🔍 [DIAGNÓSTICO PARTE 4] === INICIO enviarImagemParaN8N ===');
  console.log('🔍 [DIAGNÓSTICO PARTE 4] Arquivo recebido:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  });
  console.log('🔍 [DIAGNÓSTICO PARTE 4] FormFields recebidos:', formFields);

  // Listar campos do FormData
  const formDataEntries: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      formDataEntries[key] = {
        type: 'File',
        name: value.name,
        size: value.size,
        contentType: value.type
      };
    } else {
      formDataEntries[key] = value;
    }
  }
  console.log('🔍 [DIAGNÓSTICO PARTE 4] FormData campos (formato N8N):', formDataEntries);
  console.log('🔍 [DIAGNÓSTICO PARTE 4] ✅ Usando file_0, fileName_0, totalFiles para compatibilidade N8N');
};

/**
 * Log detalhado da resposta do N8N
 */
export const logResponseInfo = (response: Response, responseText: string) => {
  console.log('🔍 [DIAGNÓSTICO PARTE 4] === RESPOSTA N8N RECEBIDA ===');
  console.log('🔍 [DIAGNÓSTICO PARTE 4] Status:', response.status, response.statusText);
  console.log('🔍 [DIAGNÓSTICO PARTE 4] OK:', response.ok);
  console.log('🔍 [DIAGNÓSTICO PARTE 4] Headers:');
  for (const [key, value] of response.headers.entries()) {
    console.log(`🔍 [DIAGNÓSTICO PARTE 4]   ${key}: ${value}`);
  }
  console.log('🔍 [DIAGNÓSTICO PARTE 4] Raw Response Text:');
  console.log('🔍 [DIAGNÓSTICO PARTE 4]', responseText);
  console.log('🔍 [DIAGNÓSTICO PARTE 4] Response length:', responseText.length);
  console.log('🔍 [DIAGNÓSTICO PARTE 4] Response type:', typeof responseText);
};
