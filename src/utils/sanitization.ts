import DOMPurify from 'dompurify';

/**
 * Configuração segura para sanitização de HTML
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['class'],
  ALLOW_DATA_ATTR: false,
  RETURN_TRUSTED_TYPE: true,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onkeyup', 'onkeydown']
};

/**
 * Sanitiza HTML para prevenir ataques XSS
 * @param dirty HTML não sanitizado
 * @returns HTML sanitizado e seguro
 */
export const sanitizeHTML = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, PURIFY_CONFIG);
};

/**
 * Sanitiza texto para atributos HTML
 * @param dirty Texto não sanitizado
 * @returns Texto sanitizado para uso em atributos
 */
export const sanitizeAttribute = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, { 
    ...PURIFY_CONFIG, 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

/**
 * Sanitiza e valida URLs
 * @param dirty URL não validada
 * @returns URL segura ou '#' se inválida
 */
export const sanitizeURL = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') return '#';
  
  const cleaned = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  
  try {
    const url = new URL(cleaned);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return allowedProtocols.includes(url.protocol) ? cleaned : '#';
  } catch {
    return '#';
  }
};

/**
 * Processa conteúdo de contrato de forma segura
 * @param content Conteúdo do contrato
 * @returns Conteúdo sanitizado e processado
 */
export const sanitizeContractContent = (content: string): string => {
  if (!content || typeof content !== 'string') return '';
  
  // Sanitizar primeiro
  const sanitized = sanitizeHTML(content);
  
  // Procurar por linhas que contenham "CONTRATO" em maiúsculas
  // O DOMPurify com RETURN_TRUSTED_TYPE retorna um objeto, não uma string.
  // Precisamos converter para string antes de usar .replace()
  return sanitized.toString().replace(
    /(^.*CONTRATO.*$)/gm, 
    '<div class="contract-title">$1</div>'
  );
};

/**
 * Valida UUID usando regex rigoroso
 * @param uuid String para validar como UUID
 * @returns true se for UUID válido
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};