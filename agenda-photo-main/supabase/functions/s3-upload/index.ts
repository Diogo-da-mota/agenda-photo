/**
 * ✅ EDGE FUNCTION OTIMIZADA - AMAZON S3 UPLOAD
 * Suporte a múltiplos usuários, uploads concorrentes e rate limiting
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.499.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, handleCORS } from './cors.ts'

// ============================================
// CONFIGURAÇÕES E TIPOS
// ============================================

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

interface UploadResponse {
  success: boolean;
  urls?: string[];
  error?: string;
  message?: string;
  details?: {
    successful: number;
    failed: number;
    errors?: string[];
    uploadTime?: number;
    totalSize?: number;
  };
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// ============================================
// HEADERS CORS OTIMIZADOS
// ============================================

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

// ============================================
// CONFIGURAÇÃO SEGURA COM ENV VARS
// ============================================

const s3Config = {
  accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || Deno.env.get('aws_access_key_id') || '',
  secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || Deno.env.get('aws_secret_access_key') || '',
  bucketName: Deno.env.get('AWS_BUCKET_NAME') || Deno.env.get('aws_bucket_name') || 'agenda-pro',
  region: Deno.env.get('AWS_REGION') || Deno.env.get('aws_region') || 'us-east-2',
}

// Log detalhado para depuração das variáveis de ambiente - logs removidos para produção
// Verificação de variáveis de ambiente
// Status das credenciais - dados sensíveis removidos
// Fim da verificação

// Validação robusta para garantir que todas as credenciais foram carregadas
if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucketName || !s3Config.region) {
  // Erro fatal: Credenciais S3 incompletas - logs removidos para produção
  throw new Error('❌ Credenciais S3 incompletas nas variáveis de ambiente');
}

// ============================================
// LIMITES E CONFIGURAÇÕES DE PERFORMANCE
// ============================================

const LIMITS = {
  maxFileSize: 10 * 1024 * 1024,     // 10MB por arquivo
  maxTotalSize: 3 * 1024 * 1024 * 1024,   // 3GB por requisição
  maxFiles: 300,                      // 300 arquivos por requisição
  maxUserStorage: 3 * 1024 * 1024 * 1024, // <-- AQUI: 3GB por usuário
  rateLimitWindow: 60 * 1000,        // 1 minuto
  rateLimitMax: 100,                 // 100 uploads por minuto por usuário
  allowedTypes: [] // Formato livre - qualquer tipo de arquivo é permitido
};

// ============================================
// RATE LIMITING EM MEMÓRIA
// ============================================

const rateLimitMap = new Map<string, RateLimitEntry>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  
  if (!entry || now - entry.windowStart > LIMITS.rateLimitWindow) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }
  
  if (entry.count >= LIMITS.rateLimitMax) {
    return false;
  }
  
  entry.count++;
  return true;
};

// Limpeza periódica do rate limit map
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > LIMITS.rateLimitWindow) {
      rateLimitMap.delete(userId);
    }
  }
}, LIMITS.rateLimitWindow);

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const validateFile = (file: File): ValidationResult => {
  if (file.size > LIMITS.maxFileSize) {
    return { isValid: false, error: `Arquivo ${file.name} excede ${LIMITS.maxFileSize / (1024 * 1024)}MB` };
  }
  if (file.name.length > 255) {
    return { isValid: false, error: `Nome muito longo: ${file.name}` };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name.split('.')[0])) {
    return { isValid: false, error: `Nome contém caracteres inválidos: ${file.name}` };
  }
  return { isValid: true };
};

const validateBatch = (files: File[]): ValidationResult => {
  if (files.length === 0) return { isValid: false, error: 'Nenhum arquivo encontrado' };
  if (files.length > LIMITS.maxFiles) return { isValid: false, error: `Máximo ${LIMITS.maxFiles} arquivos` };
  
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > LIMITS.maxTotalSize) {
    return { isValid: false, error: `Tamanho total excede ${LIMITS.maxTotalSize / (1024 * 1024)}MB` };
  }

  for (const file of files) {
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) return fileValidation;
  }

  return { isValid: true };
};

// ============================================
// VALIDAÇÃO DE STORAGE DO USUÁRIO
// ============================================

const validateUserStorage = async (supabase: any, userId: string): Promise<ValidationResult> => {
  try {
    const { count, error } = await supabase
      .from('portfolio_trabalhos')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      // Erro ao verificar storage do usuário - logs removidos para produção
      return { isValid: true }; // Falha aberta
    }

    const maxFiles = 1000;
    if ((count || 0) >= maxFiles) {
      return { isValid: false, error: `Limite de ${maxFiles} arquivos excedido.` };
    }
    return { isValid: true };
  } catch (error) {
    // Validação de storage falhou - logs removidos para produção
    return { isValid: true }; // Falha aberta
  }
};

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

serve(async (req) => {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    // Recebida requisição OPTIONS (CORS preflight) - logs removidos para produção
    return handleCORS();
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { status: 405, headers: jsonHeaders });
  }

  try {
    // Processando requisição de upload - logs removidos para produção

    const authHeader = req.headers.get('Authorization')!;
    const userId = req.headers.get('X-User-Id');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || user.id !== userId) {
      return new Response(JSON.stringify({ success: false, error: 'Auth error' }), { status: 401, headers: jsonHeaders });
    }

    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ success: false, error: 'Rate limit excedido' }), { status: 429, headers: jsonHeaders });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    const batchValidation = validateBatch(files);
    if (!batchValidation.isValid) {
      return new Response(JSON.stringify({ success: false, error: batchValidation.error }), { status: 400, headers: jsonHeaders });
    }
    
    const storageValidation = await validateUserStorage(supabase, user.id);
    if(!storageValidation.isValid) {
      return new Response(JSON.stringify({ success: false, error: storageValidation.error }), { status: 400, headers: jsonHeaders });
    }

    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      }
    });

    const uploadPromises = files.map(async (file) => {
      const fileBuffer = await file.arrayBuffer();
      const timestamp = Date.now();
      const key = `portfolio/${user.id}/${timestamp}-${file.name}`;

      const command = new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: file.type,
        ACL: 'public-read',
      });

      await s3Client.send(command);
      return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const endTime = Date.now();

    return new Response(
      JSON.stringify({
        success: true,
        urls: uploadedUrls,
        message: `${uploadedUrls.length} arquivos enviados com sucesso para o S3.`,
        details: {
          successful: uploadedUrls.length,
          failed: 0,
          uploadTime: endTime - startTime,
          totalSize: files.reduce((sum, f) => sum + f.size, 0)
        }
      }),
      { status: 200, headers: jsonHeaders }
    );

  } catch (error) {
    // Erro no upload para S3 - logs removidos para produção
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
});