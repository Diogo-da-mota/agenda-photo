// 🔧 MELHORIA: Hook de debounce para otimizar performance
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Re-exportar os hooks avançados da nova localização
export {
  useAdvancedDebounce,
  useSearchDebounce,
  useFilterDebounce,
  useResizeDebounce,
  useScrollDebounce,
  useAPIDebounce
} from './debounce';
