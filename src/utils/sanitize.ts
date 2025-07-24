import DOMPurify from 'dompurify';

/**
 * Função para sanitizar strings e prevenir ataques XSS
 * 
 * @param input String a ser sanitizada
 * @returns String sanitizada
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, { USE_PROFILES: { html: false } });
};

/**
 * Função para sanitizar HTML e permitir apenas tags seguras
 * 
 * @param html HTML a ser sanitizado
 * @returns HTML sanitizado
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option'],
  });
};

/**
 * Função para sanitizar objetos completos
 * 
 * @param obj Objeto a ser sanitizado
 * @returns Objeto com strings sanitizadas
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj) return {} as T;
  
  const sanitized = {} as Record<string, any>;
  
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Sanitizar strings
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursivamente sanitizar objetos aninhados
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      // Sanitizar arrays
      sanitized[key] = value.map(item => 
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item)
            : item
      );
    } else {
      // Manter outros tipos de dados intactos
      sanitized[key] = value;
    }
  });
  
  return sanitized as T;
};

/**
 * Função para validar e sanitizar parâmetros de URL
 * 
 * @param param Parâmetro a ser validado
 * @returns Parâmetro sanitizado ou null se inválido
 */
export const validateUrlParam = (param: string | null): string | null => {
  if (!param) return null;
  
  // Remover caracteres perigosos e limitar o tamanho
  const sanitized = sanitizeString(param).substring(0, 100);
  
  // Verificar se o parâmetro contém apenas caracteres seguros
  if (/^[a-zA-Z0-9_\-]+$/.test(sanitized)) {
    return sanitized;
  }
  
  return null;
}; 