
import { useCallback } from 'react';
import { useAdvancedDebounce } from './useAdvancedDebounce';

/**
 * Hook de debounce específico para buscas
 * Otimizado para campos de busca com validações
 */
export const useSearchDebounce = (
  searchTerm: string,
  delay: number = 300,
  options: {
    minLength?: number;     // Tamanho mínimo para trigger
    maxLength?: number;     // Tamanho máximo
    trimWhitespace?: boolean; // Remover espaços em branco
    validateInput?: (term: string) => boolean; // Validação customizada
  } = {}
) => {
  const {
    minLength = 2,
    maxLength = 100,
    trimWhitespace = true,
    validateInput
  } = options;

  const processedTerm = trimWhitespace ? searchTerm.trim() : searchTerm;
  
  const debouncedTerm = useAdvancedDebounce(processedTerm, delay, {
    trailing: true,
    immediate: true
  });

  const isValid = useCallback(() => {
    if (processedTerm.length === 0) return true; // Permitir string vazia
    if (processedTerm.length < minLength) return false;
    if (processedTerm.length > maxLength) return false;
    if (validateInput && !validateInput(processedTerm)) return false;
    return true;
  }, [processedTerm, minLength, maxLength, validateInput]);

  return {
    debouncedTerm: isValid() ? debouncedTerm : '',
    isSearching: processedTerm !== debouncedTerm && processedTerm.length >= minLength,
    isValid: isValid(),
    originalTerm: searchTerm,
    processedTerm
  };
};
