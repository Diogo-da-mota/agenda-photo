
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdvancedDebounce } from './useAdvancedDebounce';

/**
 * Hook de debounce para API calls
 * Otimizado para chamadas de API com cache
 */
export const useAPIDebounce = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[],
  delay: number = 500,
  options: {
    cacheKey?: string;
    cacheTimeout?: number; // ms
    retryOnError?: boolean;
    maxRetries?: number;
  } = {}
) => {
  const {
    cacheKey,
    cacheTimeout = 300000, // 5 minutos
    retryOnError = false,
    maxRetries = 3
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheRef = useRef(new Map<string, { data: T; timestamp: number }>());
  const retryCountRef = useRef(0);

  const depsKey = JSON.stringify(dependencies);
  const debouncedDepsKey = useAdvancedDebounce(depsKey, delay, {
    trailing: true
  });

  useEffect(() => {
    if (!debouncedDepsKey) return;

    const executeAPICall = async () => {
      const key = cacheKey || debouncedDepsKey;
      const cached = cacheRef.current.get(key);
      
      // Verificar cache válido
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        setData(cached.data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        
        // Atualizar cache
        cacheRef.current.set(key, {
          data: result,
          timestamp: Date.now()
        });
        
        setData(result);
        retryCountRef.current = 0;
      } catch (err) {
        const error = err as Error;
        
        if (retryOnError && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(() => executeAPICall(), 1000 * retryCountRef.current);
        } else {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    executeAPICall();
  }, [debouncedDepsKey, apiCall, cacheKey, cacheTimeout, retryOnError, maxRetries]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    data,
    loading,
    error,
    clearCache,
    isDebouncing: depsKey !== debouncedDepsKey
  };
};
