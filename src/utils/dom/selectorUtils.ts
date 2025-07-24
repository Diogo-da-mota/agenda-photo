/**
 * Utilitários para seletores CSS seguros
 * Previne erros com querySelector usando múltiplos seletores
 */

/**
 * Versão segura do querySelector que aceita múltiplos seletores
 * @param selectors - Array de seletores ou string única
 * @returns Primeiro elemento encontrado ou null
 */
export function safeQuerySelector(selectors: string | string[]): Element | null {
  try {
    if (Array.isArray(selectors)) {
      // Para múltiplos seletores, usar querySelectorAll
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element;
      }
      return null;
    } else {
      // Para seletor único, usar querySelector normal
      return document.querySelector(selectors);
    }
  } catch (error) {
    console.warn('Erro no seletor CSS:', selectors, error);
    return null;
  }
}

/**
 * Versão segura do querySelectorAll que aceita múltiplos seletores
 * @param selectors - Array de seletores ou string única
 * @returns NodeList de elementos encontrados
 */
export function safeQuerySelectorAll(selectors: string | string[]): NodeListOf<Element> {
  try {
    if (Array.isArray(selectors)) {
      // Para múltiplos seletores, combinar resultados
      const allElements: Element[] = [];
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        allElements.push(...Array.from(elements));
      }
      // Remover duplicatas
      const uniqueElements = Array.from(new Set(allElements));
      return {
        length: uniqueElements.length,
        item: (index: number) => uniqueElements[index] || null,
        forEach: (callback: (value: Element, key: number, parent: NodeListOf<Element>) => void) => {
          uniqueElements.forEach((element, index) => callback(element, index, this as any));
        },
        entries: () => uniqueElements.entries(),
        keys: () => uniqueElements.keys(),
        values: () => uniqueElements.values(),
        [Symbol.iterator]: () => uniqueElements[Symbol.iterator]()
      } as NodeListOf<Element>;
    } else {
      // Para seletor único, usar querySelectorAll normal
      return document.querySelectorAll(selectors);
    }
  } catch (error) {
    console.warn('Erro no seletor CSS:', selectors, error);
    return document.querySelectorAll(''); // Retorna NodeList vazia
  }
}

/**
 * Verificar se um seletor CSS é válido
 * @param selector - Seletor CSS para verificar
 * @returns true se o seletor é válido
 */
export function isValidSelector(selector: string): boolean {
  try {
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

/**
 * Corrigir seletores CSS comuns que podem causar problemas
 * @param selector - Seletor original
 * @returns Seletor corrigido
 */
export function fixCommonSelectorIssues(selector: string): string {
  // Corrigir seletores com vírgula que deveriam usar querySelectorAll
  if (selector.includes(',') && !selector.includes('[')) {
    console.warn('Seletor com vírgula detectado. Use safeQuerySelectorAll ou querySelectorAll:', selector);
    return selector.split(',')[0].trim(); // Retorna apenas o primeiro seletor
  }
  
  // Corrigir classes CSS com pontos duplos
  selector = selector.replace(/\.{2,}/g, '.');
  
  // Corrigir espaços extras
  selector = selector.replace(/\s+/g, ' ').trim();
  
  return selector;
}

/**
 * Encontrar elementos com classes flex, items-center e gap de forma segura
 * @param gapSize - Tamanho do gap (opcional)
 * @returns Array de elementos encontrados
 */
export function findFlexItemsCenterGapElements(gapSize?: string): Element[] {
  const selectors = [
    '.flex.items-center.gap-2',
    '.flex.items-center.gap-1\\.5',
    '.flex.items-center.gap-1',
    '.flex.items-center.gap-3',
    '.flex.items-center.gap-4'
  ];
  
  if (gapSize) {
    const specificSelector = `.flex.items-center.gap-${gapSize}`;
    return Array.from(document.querySelectorAll(specificSelector));
  }
  
  const allElements: Element[] = [];
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      allElements.push(...Array.from(elements));
    } catch (error) {
      console.warn('Erro no seletor:', selector, error);
    }
  }
  
  return allElements;
}

/**
 * Verificar e reportar seletores CSS problemáticos na página
 */
export function auditPageSelectors(): void {
  // Verificar apenas se há elementos que realmente usam esses seletores problemáticos
  const elementsWithProblematicClasses = document.querySelectorAll('.flex.items-center[class*="gap-"]');
  
  if (elementsWithProblematicClasses.length > 0) {
    console.group('🔍 Auditoria de Seletores CSS');
    console.warn('⚠️ Encontrados elementos com classes que podem causar problemas em seletores CSS');
    console.info('💡 Sugestão: Use querySelectorAll ou safeQuerySelectorAll para múltiplos seletores');
    console.info('📊 Elementos encontrados:', elementsWithProblematicClasses.length);
    console.groupEnd();
  }
}

// Executar auditoria automaticamente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // Aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', auditPageSelectors);
  } else {
    auditPageSelectors();
  }
}