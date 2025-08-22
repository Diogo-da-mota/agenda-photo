/**
 * Utilitários de validação para operações seguras no banco de dados
 */

/**
 * Verifica se um nome de tabela é válido
 * @param tableName Nome da tabela a ser validada
 * @returns true se o nome da tabela é válido, false caso contrário
 */
export function isValidTableName(tableName: string): boolean {
  // Apenas letras, números e underscore
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName);
}

/**
 * Sanitiza um nome de tabela, garantindo que ele siga o padrão seguro
 * @param tableName Nome da tabela a ser sanitizada
 * @returns Nome da tabela sanitizado
 * @throws Error se o nome da tabela for inválido
 */
export function sanitizeTableName(tableName: string): string {
  if (!isValidTableName(tableName)) {
    throw new Error(`Nome de tabela inválido: ${tableName}`);
  }
  return tableName;
}

/**
 * Valida email com checagem rigorosa
 */
export function validateEmailSecurity(email: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email é obrigatório');
    return { valid: false, errors };
  }
  
  // Validação básica de formato
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push('Formato de email inválido');
  }
  
  // Verificar comprimento
  if (email.length > 255) {
    errors.push('Email muito longo (máximo 255 caracteres)');
  }
  
  // Verificar caracteres perigosos
  const dangerousChars = ['<', '>', '"', "'", '&', '\n', '\r', '\t'];
  if (dangerousChars.some(char => email.includes(char))) {
    errors.push('Email contém caracteres inválidos');
  }
  
  // Verificar domínios suspeitos
  const suspiciousDomains = ['tempmail', 'guerrillamail', '10minutemail'];
  if (suspiciousDomains.some(domain => email.includes(domain))) {
    errors.push('Domínio de email temporário não permitido');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Valida telefone brasileiro com segurança
 */
export function validatePhoneSecurity(phone: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!phone) {
    return { valid: true, errors }; // Telefone opcional
  }
  
  // Remove formatação
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica comprimento
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    errors.push('Telefone deve ter 10 ou 11 dígitos');
  }
  
  // Verifica padrão brasileiro
  if (cleanPhone.length === 11) {
    const ddd = cleanPhone.substring(0, 2);
    const nono = cleanPhone.charAt(2);
    
    // DDDs válidos
    const validDDDs = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '21', '22', '24', '27', '28',
      '31', '32', '33', '34', '35', '37', '38',
      '41', '42', '43', '44', '45', '46',
      '47', '48', '49',
      '51', '53', '54', '55',
      '61', '62', '63', '64', '65', '66', '67', '68', '69',
      '71', '73', '74', '75', '77', '79',
      '81', '82', '83', '84', '85', '86', '87', '88', '89',
      '91', '92', '93', '94', '95', '96', '97', '98', '99'
    ];
    
    if (!validDDDs.includes(ddd)) {
      errors.push('DDD inválido');
    }
    
    if (nono !== '9') {
      errors.push('Celular deve começar com 9 após o DDD');
    }
  }
  
  // Verifica padrões inválidos
  const invalidPatterns = [
    /^(\d)\1+$/, // Todos os dígitos iguais
    /^1234567890$|^0987654321$/, // Sequências óbvias
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(cleanPhone))) {
    errors.push('Número de telefone inválido');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  return input
    .replace(/[<>"'&]/g, '') // Remove caracteres perigosos para XSS
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim()
    .substring(0, maxLength);
}

/**
 * Valida valor monetário
 */
export function validateCurrency(value: string): { valid: boolean; numericValue: number | null } {
  if (!value) return { valid: true, numericValue: null };
  
  // Remove espaços e normaliza
  const cleaned = value.trim().replace(',', '.');
  
  // Verifica formato
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    return { valid: false, numericValue: null };
  }
  
  const numericValue = parseFloat(cleaned);
  
  // Verifica limites razoáveis
  if (numericValue < 0 || numericValue > 999999.99) {
    return { valid: false, numericValue: null };
  }
  
  return { valid: true, numericValue };
}