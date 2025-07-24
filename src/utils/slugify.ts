/**
 * Utilitários para geração e manipulação de slugs de contratos
 * Implementa URLs amigáveis com retrocompatibilidade total
 * 
 * Formato: /contrato/{titulo-slug}-{id_contrato}
 * Exemplo: /contrato/casamento-maria-joao-16023678
 */

/**
 * Extrai apenas o tipo de evento do título, removendo nomes de clientes
 * Exemplos:
 * "Contrato - Casamento - João Silva" -> "Casamento"
 * "Ensaio Pré-Wedding - Maria Santos" -> "Ensaio Pré-Wedding"
 * "Book Gestante" -> "Book Gestante"
 */
function extractEventType(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'contrato';
  }

  // Remove "Contrato -" do início se existir
  let cleanTitle = title.replace(/^Contrato\s*-\s*/i, '').trim();
  
  // Se tem formato "TipoEvento - NomeCliente", pega só o tipo
  const parts = cleanTitle.split(' - ');
  if (parts.length >= 2) {
    // Pega a primeira parte (tipo de evento)
    return parts[0].trim();
  }
  
  // Se não tem hífen, assume que é só o tipo de evento
  return cleanTitle;
}

/**
 * Converte um título em slug URL-friendly
 * Remove acentos, caracteres especiais e converte para lowercase
 * Extrai apenas o tipo de evento, removendo nomes de clientes
 */
export function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'contrato';
  }

  // Extrai apenas o tipo de evento
  const eventType = extractEventType(title);

  return eventType
    .toLowerCase()
    // Remove acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove caracteres especiais, mantém apenas letras, números e espaços
    .replace(/[^a-z0-9\s-]/g, '')
    // Substitui espaços e múltiplos hífens por um único hífen
    .replace(/[\s-]+/g, '-')
    // Remove hífens do início e fim
    .replace(/^-+|-+$/g, '')
    // Limita o tamanho do slug
    .substring(0, 50)
    // Remove hífen final se foi cortado no meio
    .replace(/-+$/, '') || 'contrato';
}

/**
 * Extrai o ID do contrato de um slug
 * Suporta tanto formato novo (slug-id) quanto antigo (apenas id)
 */
export function extractIdFromSlug(slug: string): string | null {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // Remove barras e espaços
  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
  
  // Caso 1: Formato antigo - apenas números (retrocompatibilidade)
  if (/^\d+$/.test(cleanSlug)) {
    // Fallback para ID direto usando parseInt
    const directId = parseInt(cleanSlug, 10);
    return directId && !isNaN(directId) ? String(directId) : cleanSlug;
  }

  // Caso 2: Formato novo - slug-id (últimos 8 dígitos)
  if (cleanSlug.includes('-')) {
    const lastPart = cleanSlug.slice(-8);
    if (/^\d{8}$/.test(lastPart)) {
      // Conversão de ID direto usando Number
      const numericId = Number(lastPart);
      return numericId && !isNaN(numericId) ? String(numericId) : lastPart;
    }
  }

  // Caso 3: Tenta extrair qualquer sequência de números no final
  const fallbackMatch = cleanSlug.match(/([0-9]+)$/);
  if (fallbackMatch) {
    // Fallback para ID direto usando parseInt
    const extractedId = parseInt(fallbackMatch[1], 10);
    return extractedId && !isNaN(extractedId) ? String(extractedId) : fallbackMatch[1];
  }

  return null;
}

/**
 * Interface para dados necessários para gerar URL do contrato
 */
export interface ContractUrlData {
  id_contrato: string | number;
  id_amigavel?: number;
  nome_cliente?: string;
  title?: string; // Para retrocompatibilidade
}

/**
 * Gera URL completa do contrato com novo formato
 * Formato novo: /contrato/{NOME_CLIENTE}-{id_contrato}
 * Formato antigo: /contrato/{titulo-slug}-{id_contrato} (retrocompatibilidade)
 */
export function generateContractUrl(
  contractData: ContractUrlData | string | number,
  title?: string
): string {
  // Retrocompatibilidade: se receber string/number como primeiro parâmetro
  if (typeof contractData === 'string' || typeof contractData === 'number') {
    return generateLegacyContractUrl(contractData, title);
  }

  const { id_contrato, nome_cliente } = contractData;
  const id = String(id_contrato);
  
  // Validação básica do ID
  if (!id || !/^\d+$/.test(id)) {
    throw new Error('ID do contrato deve ser um número válido');
  }

  // Formato novo: nome-cliente-id_contrato (com hífens para URLs amigáveis)
  if (nome_cliente) {
    const nomeFormatado = nome_cliente
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais mas mantém espaços
      .replace(/\s+/g, '-') // Converte espaços para hífens
      .replace(/-+/g, '-') // Normaliza hífens múltiplos para um único hífen
      .replace(/^-|-$/g, '') // Remove hífens das extremidades
      .substring(0, 30); // Limita tamanho
    
    if (nomeFormatado) {
      return `/contrato/${nomeFormatado}-${id}`;
    }
  }
  
  // Fallback para formato antigo se não tiver dados suficientes
  return generateLegacyContractUrl(id, contractData.title);
}

/**
 * Função auxiliar para gerar URLs no formato antigo (retrocompatibilidade)
 */
function generateLegacyContractUrl(contractId: string | number, title?: string): string {
  const id = String(contractId);
  
  // Validação básica do ID
  if (!id || !/^\d+$/.test(id)) {
    throw new Error('ID do contrato deve ser um número válido');
  }

  // Se não há título, usa formato simples
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return `/contrato/${id}`;
  }

  const slug = generateSlug(title.trim());
  
  // Se o slug ficou vazio, usa formato simples
  if (!slug || slug === 'contrato') {
    return `/contrato/${id}`;
  }

  return `/contrato/${slug}-${id}`;
}

/**
 * Faz parsing de um slug de contrato com retrocompatibilidade
 * Suporta tanto formato novo quanto antigo
 */
export function parseContractSlug(slug: string): {
  id_contrato: string | null;
  id_amigavel: number | null;
  nome_cliente: string | null;
  slug: string | null;
  formato: 'novo' | 'legado' | 'invalido';
  isValid: boolean;
} {
  const result = {
    id_contrato: null as string | null,
    id_amigavel: null as number | null,
    nome_cliente: null as string | null,
    slug: null as string | null,
    formato: 'invalido' as 'novo' | 'legado' | 'invalido',
    isValid: false
  };

  if (!slug || typeof slug !== 'string') {
    return result;
  }

  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
  
  // Formato antigo: apenas números
  if (/^\d+$/.test(cleanSlug)) {
    result.id_contrato = cleanSlug;
    result.formato = 'legado';
    result.isValid = true;
    return result;
  }

  // Formato novo: nome-cliente-id_contrato (ex: diogo-goncalves-da-mota-55178922)
  // Verifica se termina com hífen seguido de números (6+ dígitos)
  const novoFormato = cleanSlug.match(/^([a-z][a-z0-9-]*[a-z0-9])-(\d{6,})$/);
  if (novoFormato) {
    const nomeSlug = novoFormato[1];
    // Reconstrói o nome do cliente a partir do slug
    result.nome_cliente = nomeSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    result.id_contrato = novoFormato[2];
    result.slug = nomeSlug;
    result.formato = 'novo';
    result.isValid = true;
    return result;
  }

  // Formato legado antigo: NOME_CLIENTE id_contrato (com espaços - retrocompatibilidade)
  const legadoEspacos = cleanSlug.match(/^([A-Z\s]{3,})\s(\d{6,})$/);
  if (legadoEspacos) {
    result.nome_cliente = legadoEspacos[1].trim();
    result.id_contrato = legadoEspacos[2];
    result.formato = 'legado';
    result.isValid = true;
    return result;
  }

  // Formato legado: slug-id (ex: casamento-55178922)
  // Usa regex mais específica para evitar conflito com formato novo
  const legadoFormato = cleanSlug.match(/^([a-z][a-z0-9-]*[a-z0-9])-(\d{6,})$/);
  if (legadoFormato) {
    result.slug = legadoFormato[1];
    result.id_contrato = legadoFormato[2];
    result.formato = 'legado';
    result.isValid = true;
    return result;
  }

  // Fallback: tenta extrair ID do final
  const fallbackMatch = cleanSlug.match(/(\d+)$/);
  if (fallbackMatch) {
    result.id_contrato = fallbackMatch[1];
    result.formato = 'legado';
    result.isValid = true;
    return result;
  }

  return result;
}

/**
 * Valida se um slug de contrato é válido
 */
export function isValidContractSlug(slug: string): boolean {
  return parseContractSlug(slug).isValid;
}

/**
 * Extrai apenas o ID do contrato de qualquer formato de URL
 * Mantém retrocompatibilidade com função anterior
 */
export function extractContractId(slug: string): string | null {
  const parsed = parseContractSlug(slug);
  return parsed.id_contrato;
}

/**
 * Normaliza um slug de contrato para o formato padrão
 * Útil para redirecionamentos e canonicalização
 */
export function normalizeContractSlug(
  slug: string, 
  contractData?: { title?: string; id_amigavel?: number; nome_cliente?: string }
): string | null {
  const parsed = parseContractSlug(slug);
  
  if (!parsed.isValid || !parsed.id_contrato) {
    return null;
  }

  // Se temos dados completos para o novo formato, usa eles
  if (contractData?.nome_cliente) {
    return generateContractUrl({
      id_contrato: parsed.id_contrato,
      nome_cliente: contractData.nome_cliente
    });
  }

  // Se já está no formato novo e válido, mantém
  if (parsed.formato === 'novo') {
    return `/contrato/${parsed.nome_cliente} ${parsed.id_contrato}`;
  }

  // Se temos um título fornecido, usa formato legado
  if (contractData?.title && typeof contractData.title === 'string' && contractData.title.trim()) {
    return generateContractUrl(parsed.id_contrato, contractData.title);
  }

  // Formato legado simples
  return `/contrato/${parsed.id_contrato}`;
}

/**
 * Utilitário para debug e testes
 */
export function debugSlug(input: string) {
  const parsed = parseContractSlug(input);
  return {
    input,
    parsed,
    extractedId: extractContractId(input),
    isValid: isValidContractSlug(input)
  };
}