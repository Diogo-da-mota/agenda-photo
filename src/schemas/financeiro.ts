import { z } from 'zod';
import { logger } from '@/utils/logger';

// Schema para sanitização de strings
const sanitizeString = (str: string) => {
  if (typeof str !== 'string') return '';
  
  // Remover caracteres perigosos que podem causar XSS ou injection
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (match) => { // Escape caracteres especiais
      const escapes: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapes[match] || match;
    })
    .trim()
    .substring(0, 500); // Limitar tamanho máximo
};

// Schema para valores monetários
const valorMonetarioSchema = z
  .number()
  .positive({ message: 'Valor deve ser positivo' })
  .max(999999999, { message: 'Valor máximo excedido (R$ 999.999.999)' })
  .refine((val) => !isNaN(val) && isFinite(val), {
    message: 'Valor deve ser um número válido'
  })
  .refine((val) => Number(val.toFixed(2)) === val || val.toFixed(2).split('.')[1]?.length <= 2, {
    message: 'Valor deve ter no máximo 2 casas decimais'
  });

// Schema para strings de texto
const textoSchema = z
  .string()
  .min(1, { message: 'Campo obrigatório' })
  .max(500, { message: 'Máximo de 500 caracteres' })
  .transform(sanitizeString)
  .refine((val) => val.length > 0, {
    message: 'Campo não pode estar vazio após sanitização'
  });

// Schema para strings opcionais
const textoOpcionalSchema = z
  .string()
  .max(1000, { message: 'Máximo de 1000 caracteres' })
  .transform(sanitizeString)
  .optional()
  .nullable();

// Schema para descrição com validação especial
const descricaoSchema = z
  .string()
  .min(3, { message: 'Descrição deve ter pelo menos 3 caracteres' })
  .max(200, { message: 'Descrição deve ter no máximo 200 caracteres' })
  .transform(sanitizeString)
  .refine((val) => val.length >= 3, {
    message: 'Descrição deve ter pelo menos 3 caracteres após sanitização'
  })
  .refine((val) => !/^\d+$/.test(val), {
    message: 'Descrição não pode conter apenas números'
  });

// Schema para categoria
const categoriaSchema = z
  .string()
  .max(100, { message: 'Categoria deve ter no máximo 100 caracteres' })
  .transform(sanitizeString)
  .optional()
  .nullable();

// Schema para observações
const observacoesSchema = z
  .string()
  .max(2000, { message: 'Observações devem ter no máximo 2000 caracteres' })
  .transform(sanitizeString)
  .optional()
  .nullable();

// Schema para UUID
const uuidSchema = z
  .string()
  .uuid({ message: 'ID deve ser um UUID válido' });

// Schema para user_id obrigatório
const userIdSchema = z
  .string()
  .uuid({ message: 'User ID deve ser um UUID válido' })
  .min(1, { message: 'User ID é obrigatório' });

// Schema principal para criação de transação
export const criarTransacaoSchema = z.object({
  descricao: descricaoSchema,
  valor: valorMonetarioSchema,
  tipo: z.enum(['receita', 'despesa'], {
    errorMap: () => ({ message: 'Tipo deve ser "receita" ou "despesa"' })
  }),
  status: z.enum(['recebido', 'pendente', 'concluido'], {
    errorMap: () => ({ message: 'Status deve ser "recebido", "pendente" ou "concluido"' })
  }),
  data_transacao: z.date({
    required_error: 'Data da transação é obrigatória',
    invalid_type_error: 'Data da transação deve ser uma data válida'
  }).refine((date) => {
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 2, 11, 31); // 2 anos no futuro
    const minPastDate = new Date(2000, 0, 1); // Não aceitar datas antes de 2000
    
    return date >= minPastDate && date <= maxFutureDate;
  }, {
    message: 'Data deve estar entre 01/01/2000 e 2 anos no futuro'
  }),
  data_evento: z.date().optional().nullable(),
  categoria: categoriaSchema,
  forma_pagamento: z
    .enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'outros'], {
      errorMap: () => ({ message: 'Forma de pagamento inválida' })
    })
    .optional()
    .nullable(),
  observacoes: observacoesSchema,
  clienteName: textoOpcionalSchema,
  cliente_id: z.string().uuid().optional().nullable(),
  user_id: userIdSchema
});

// Schema para atualização de transação (campos opcionais)
export const atualizarTransacaoSchema = z.object({
  descricao: descricaoSchema.optional(),
  valor: valorMonetarioSchema.optional(),
  tipo: z.enum(['receita', 'despesa']).optional(),
  status: z.enum(['recebido', 'pendente', 'concluido']).optional(),
  data_transacao: z.date().refine((date) => {
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 2, 11, 31);
    const minPastDate = new Date(2000, 0, 1);
    
    return date >= minPastDate && date <= maxFutureDate;
  }, {
    message: 'Data deve estar entre 01/01/2000 e 2 anos no futuro'
  }).optional(),
  data_evento: z.date().optional().nullable(),
  categoria: categoriaSchema,
  forma_pagamento: z
    .enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'outros'])
    .optional()
    .nullable(),
  observacoes: observacoesSchema,
  clienteName: textoOpcionalSchema,
  cliente_id: z.string().uuid().optional().nullable()
});

// Schema para filtros de busca
export const filtroTransacaoSchema = z.object({
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  tipo: z.enum(['receita', 'despesa']).optional().nullable(),
  status: z.enum(['recebido', 'pendente', 'concluido']).optional().nullable(),
  categoria: z.array(z.string().max(100).transform(sanitizeString)).optional(),
  busca: z.string().max(200).transform(sanitizeString).optional()
}).refine((data) => {
  // Validar que dataFim não seja anterior a dataInicio
  if (data.dataInicio && data.dataFim) {
    return data.dataFim >= data.dataInicio;
  }
  return true;
}, {
  message: 'Data fim deve ser posterior ou igual à data início'
});

// Schema para validação de ambiente de segurança
export const environmentSecuritySchema = z.object({
  environment: z.enum(['development', 'test', 'staging', 'production'], {
    errorMap: () => ({ message: 'Ambiente deve ser development, test, staging ou production' })
  }),
  hostname: z.string().min(1, { message: 'Hostname é obrigatório' }),
  isTestComponent: z.boolean().default(false),
  allowTestFeatures: z.boolean().default(false)
}).refine((data) => {
  // Se for produção, não permitir componentes de teste
  if (data.environment === 'production' && data.isTestComponent) {
    return false;
  }
  return true;
}, {
  message: 'Componentes de teste não são permitidos em ambiente de produção'
});

// Schema para validação de dados mascarados
export const maskedDataSchema = z.object({
  originalLength: z.number().min(0),
  maskedLength: z.number().min(0),
  maskCharacter: z.string().length(1).default('*'),
  preserveLength: z.number().min(0).max(50).default(8)
});

// Schema para configuração de rate limiting
export const rateLimitConfigSchema = z.object({
  maxAttempts: z.number().min(1).max(10).default(3),
  timeoutMinutes: z.number().min(1).max(60).default(5),
  blockDurationMs: z.number().min(60000).max(3600000).default(300000) // 1 min a 1 hora
});

// Schema para despesas
export const criarDespesaSchema = z.object({
  descricao: descricaoSchema,
  valor: valorMonetarioSchema,
  status: z.enum(['pendente', 'pago', 'cancelado', 'vencido'], {
    errorMap: () => ({ message: 'Status deve ser "pendente", "pago", "cancelado" ou "vencido"' })
  }),
  data_transacao: z.date({
    required_error: 'Data da transação é obrigatória',
    invalid_type_error: 'Data da transação deve ser uma data válida'
  }).refine((date) => {
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 2, 11, 31); // 2 anos no futuro
    const minPastDate = new Date(2000, 0, 1); // Não aceitar datas antes de 2000
    
    return date >= minPastDate && date <= maxFutureDate;
  }, {
    message: 'Data deve estar entre 01/01/2000 e 2 anos no futuro'
  }),
  categoria: categoriaSchema,
  forma_pagamento: z
    .string()
    .optional()
    .nullable()
    .transform(val => val ? val.toLowerCase() : val)
    .pipe(
      z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'outros'], {
        errorMap: () => ({ message: 'Forma de pagamento inválida' })
      }).optional().nullable()
    ),
  observacoes: observacoesSchema,
  cliente_id: z.string().uuid().optional().nullable(),
  user_id: userIdSchema
});

// Schema para atualização de despesa (campos opcionais)
export const atualizarDespesaSchema = z.object({
  descricao: descricaoSchema.optional(),
  valor: valorMonetarioSchema.optional(),
  status: z.enum(['pendente', 'pago', 'cancelado', 'vencido']).optional(),
  data_transacao: z.date().refine((date) => {
    const now = new Date();
    const maxFutureDate = new Date(now.getFullYear() + 2, 11, 31);
    const minPastDate = new Date(2000, 0, 1);
    
    return date >= minPastDate && date <= maxFutureDate;
  }, {
    message: 'Data deve estar entre 01/01/2000 e 2 anos no futuro'
  }).optional(),
  categoria: categoriaSchema,
  forma_pagamento: z
    .string()
    .optional()
    .nullable()
    .transform(val => val ? val.toLowerCase() : val)
    .pipe(
      z.enum(['dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'outros'], {
        errorMap: () => ({ message: 'Forma de pagamento inválida' })
      }).optional().nullable()
    ),
  observacoes: observacoesSchema,
  cliente_id: z.string().uuid().optional().nullable()
});

// Tipos TypeScript derivados dos schemas
export type CriarTransacaoInput = z.infer<typeof criarTransacaoSchema>;
export type AtualizarTransacaoInput = z.infer<typeof atualizarTransacaoSchema>;
export type FiltroTransacaoInput = z.infer<typeof filtroTransacaoSchema>;

// Função utilitária para validar e sanitizar dados de transação
export const validarTransacao = (data: unknown) => {
  try {
    logger.debug('Validando transação com Zod schema', null, 'financeiroSchema');
    
    const resultado = criarTransacaoSchema.safeParse(data);
    
    if (resultado.success) {
      logger.debug('Transação validada com sucesso', null, 'financeiroSchema');
      return {
        success: true,
        data: resultado.data,
        error: null
      };
    } else {
      logger.warn('Dados de transação inválidos', resultado.error, 'financeiroSchema');
      return {
        success: false,
        data: null,
        error: resultado.error
      };
    }
  } catch (error) {
    logger.error('Erro inesperado na validação de transação', error, 'financeiroSchema');
    return {
      success: false,
      data: null,
      error: new Error('Erro inesperado na validação')
    };
  }
};

// Função utilitária para validar atualização
export const validarAtualizacaoTransacao = (data: unknown) => {
  try {
    logger.debug('Validando atualização de transação com Zod schema', null, 'financeiroSchema');
    
    const resultado = atualizarTransacaoSchema.safeParse(data);
    
    if (resultado.success) {
      return {
        success: true,
        data: resultado.data,
        error: null
      };
    } else {
      logger.warn('Dados de atualização inválidos', resultado.error, 'financeiroSchema');
      return {
        success: false,
        data: null,
        error: resultado.error
      };
    }
  } catch (error) {
    logger.error('Erro inesperado na validação de atualização', error, 'financeiroSchema');
    return {
      success: false,
      data: null,
      error: new Error('Erro inesperado na validação')
    };
  }
};

// Função para validar configuração de segurança de ambiente
export const validarAmbienteSeguranca = (dados: unknown) => {
  try {
    const resultado = environmentSecuritySchema.parse(dados);
    
    console.info('[SECURITY] Configuração de ambiente validada:', {
      environment: resultado.environment,
      hostname: resultado.hostname.substring(0, 20) + '...',
      isTestComponent: resultado.isTestComponent,
      timestamp: new Date().toISOString()
    });
    
    return { success: true, data: resultado, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[SECURITY] Configuração de ambiente inválida:', error.errors);
      
      return {
        success: false,
        data: null,
        error: {
          message: 'Configuração de ambiente inválida',
          details: error.errors.map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message
          }))
        }
      };
    }
    
    return {
      success: false,
      data: null,
      error: { message: 'Erro interno de validação de ambiente', details: [] }
    };
  }
};

// Função para validar dados mascarados
export const validarDadosMascarados = (originalData: string, maskedData: string, config: unknown) => {
  try {
    const configValidada = maskedDataSchema.parse(config);
    
    // Verificar se os dados foram realmente mascarados
    if (originalData === maskedData && originalData.length > configValidada.preserveLength) {
      console.warn('[SECURITY] Dados sensíveis não foram mascarados adequadamente');
      return { success: false, error: 'Dados não foram mascarados' };
    }
    
    // Verificar se contém caracteres de máscara
    const hasMaskChars = maskedData.includes(configValidada.maskCharacter);
    if (!hasMaskChars && maskedData !== '[DADOS_PROTEGIDOS]') {
      console.warn('[SECURITY] Dados podem não estar adequadamente mascarados:', {
        originalLength: originalData.length,
        maskedLength: maskedData.length,
        hasMaskChars
      });
    }
    
    console.info('[SECURITY] Validação de mascaramento concluída:', {
      originalLength: originalData.length,
      maskedLength: maskedData.length,
      adequatelyMasked: hasMaskChars || maskedData === '[DADOS_PROTEGIDOS]'
    });
    
    return { success: true, data: configValidada, error: null };
  } catch (error) {
    console.error('[SECURITY] Erro na validação de mascaramento:', error);
    return { success: false, data: null, error: 'Erro na validação de mascaramento' };
  }
};

// Função para validar configuração de rate limiting
export const validarRateLimit = (dados: unknown) => {
  try {
    const resultado = rateLimitConfigSchema.parse(dados);
    
    console.info('[SECURITY] Configuração de rate limiting validada:', {
      maxAttempts: resultado.maxAttempts,
      timeoutMinutes: resultado.timeoutMinutes,
      blockDurationMs: resultado.blockDurationMs
    });
    
    return { success: true, data: resultado, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[SECURITY] Configuração de rate limiting inválida:', error.errors);
      
      return {
        success: false,
        data: null,
        error: {
          message: 'Configuração de rate limiting inválida',
          details: error.errors.map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message
          }))
        }
      };
    }
    
    return {
      success: false,
      data: null,
      error: { message: 'Erro interno de validação de rate limiting', details: [] }
    };
  }
};

// Função para validar despesa
export const validarDespesa = (data: unknown) => {
  return criarDespesaSchema.safeParse(data);
};

// Função para validar atualização de despesa
export const validarAtualizacaoDespesa = (data: unknown) => {
  return atualizarDespesaSchema.safeParse(data);
};

// Tipos derivados dos novos schemas
export type EnvironmentSecurityConfig = z.infer<typeof environmentSecuritySchema>;
export type MaskedDataConfig = z.infer<typeof maskedDataSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;