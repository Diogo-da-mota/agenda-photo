
import { useMemo } from 'react';
import { useAdvancedDebounce } from './useAdvancedDebounce';

/**
 * Hook de debounce para filtros
 * Otimizado para filtros complexos com múltiplos valores
 */
export const useFilterDebounce = <T extends Record<string, any>>(
  filters: T,
  delay: number = 250,
  options: {
    ignoreKeys?: string[];  // Chaves que não devem ser debounced
    transformers?: Record<string, (value: any) => any>; // Transformações
  } = {}
) => {
  const { ignoreKeys = [], transformers = {} } = options;
  
  // Usar Object.entries para processar os filtros de forma type-safe
  const processedFilters = useMemo(() => {
    const result = { ...filters };
    
    Object.entries(filters).forEach(([key, value]) => {
      const transformer = transformers[key];
      if (transformer) {
        (result as any)[key] = transformer(value);
      }
    });
    
    return result;
  }, [filters, transformers]);

  const debouncedFilters = useAdvancedDebounce(processedFilters, delay, {
    trailing: true
  });

  // Aplicar chaves ignoradas de forma type-safe
  const finalFilters = useMemo(() => {
    const result = { ...debouncedFilters };
    
    ignoreKeys.forEach(key => {
      if (key in filters) {
        (result as any)[key] = (filters as any)[key];
      }
    });
    
    return result;
  }, [debouncedFilters, filters, ignoreKeys]);

  return {
    debouncedFilters: finalFilters,
    isFiltering: JSON.stringify(filters) !== JSON.stringify(debouncedFilters),
    hasActiveFilters: Object.values(finalFilters).some(value => 
      value !== '' && value !== null && value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    )
  };
};
