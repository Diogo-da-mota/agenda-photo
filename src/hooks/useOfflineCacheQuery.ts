/**
 * Hook que integra cache offline com React Query
 * Funciona como wrapper transparente sobre queries existentes
 */

import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useOfflineCache, CacheStrategy } from '@/utils/cache/OfflineCacheStrategy';
import { useAuth } from '@/hooks/use-auth';

export interface OfflineCacheQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  cacheStrategy: Omit<CacheStrategy, 'userId'>; // userId será adicionado automaticamente
  fallbackData?: T;
  enableOfflineFirst?: boolean; // Se true, sempre tenta cache primeiro
}

/**
 * Hook que adiciona cache offline a queries do React Query
 */
export function useOfflineCacheQuery<T = any>(
  options: OfflineCacheQueryOptions<T>
): UseQueryResult<T> & { 
  fromCache?: boolean;
  cacheStats?: any;
  invalidateOfflineCache: () => Promise<void>;
} {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    cacheQuery, 
    invalidateCache, 
    getCacheStats, 
    isOnline 
  } = useOfflineCache();

  // Adicionar userId à estratégia de cache
  const enhancedCacheStrategy: CacheStrategy = {
    ...options.cacheStrategy,
    userId: user?.id
  };

  // Wrapper da query function com cache offline
  const wrappedQueryFn = useCallback(async (): Promise<T> => {
    const result = await cacheQuery(
      options.queryFn,
      enhancedCacheStrategy
    );

    // Se os dados vieram do cache e estamos online,
    // revalidar em background
    if (result.fromCache && isOnline()) {
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: options.queryKey 
        });
      }, 100);
    }

    return result.data;
  }, [options.queryFn, enhancedCacheStrategy, isOnline, queryClient, options.queryKey]);

  // Configuração da query do React Query
  const queryOptions: UseQueryOptions<T> = {
    ...options,
    queryFn: wrappedQueryFn,
    // Configurações otimizadas para cache offline
    staleTime: isOnline() ? (options.staleTime || 5 * 60 * 1000) : Infinity, // 5 min online, infinito offline
    gcTime: options.gcTime || 30 * 60 * 1000, // 30 min
    retry: isOnline() ? (options.retry ?? 3) : 0, // Não tentar novamente se offline
    retryOnMount: isOnline(),
    refetchOnWindowFocus: isOnline() ? (options.refetchOnWindowFocus ?? false) : false,
    refetchOnReconnect: true, // Sempre revalidar quando reconectar
  };

  // Query principal
  const queryResult = useQuery(queryOptions);

  // Invalidar cache offline
  const invalidateOfflineCache = useCallback(async () => {
    await invalidateCache(enhancedCacheStrategy);
    queryClient.invalidateQueries({ queryKey: options.queryKey });
  }, [invalidateCache, enhancedCacheStrategy, queryClient, options.queryKey]);

  // Monitorar mudanças de conectividade
  useEffect(() => {
    const handleOnline = () => {
      // Revalidar quando voltar online
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient, options.queryKey]);

  // Retornar resultado estendido
  return {
    ...queryResult,
    invalidateOfflineCache
  };
}

/**
 * Hook para múltiplas queries com cache offline
 */
export function useOfflineCacheQueries<T extends Record<string, any>>(
  queries: Array<OfflineCacheQueryOptions<any>>
): Record<string, UseQueryResult<any> & { invalidateOfflineCache: () => Promise<void> }> {
  const results: Record<string, any> = {};

  queries.forEach((queryOptions, index) => {
    const key = queryOptions.queryKey?.[0] as string || `query_${index}`;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useOfflineCacheQuery(queryOptions);
  });

  return results;
}

/**
 * Hook para invalidar todo o cache offline de um usuário
 */
export function useOfflineCacheInvalidation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { invalidateUserCache, getCacheStats } = useOfflineCache();

  const invalidateAllUserCache = useCallback(async () => {
    if (!user?.id) return;

    await invalidateUserCache(user.id);
    queryClient.clear(); // Limpar também o cache do React Query
  }, [user?.id, invalidateUserCache, queryClient]);

  const getCacheStatistics = useCallback(async () => {
    return await getCacheStats();
  }, [getCacheStats]);

  return {
    invalidateAllUserCache,
    getCacheStatistics
  };
}

/**
 * Hook para monitorar status offline/online
 */
export function useOfflineStatus() {
  const { isOnline: checkOnline, getCacheStats } = useOfflineCache();

  return {
    isOnline: checkOnline(),
    isOffline: !checkOnline(),
    getCacheStats
  };
}

/**
 * Utility para criar query keys específicas por usuário
 */
export function createUserQueryKey(user: any, baseKey: string[]): string[] {
  const userId = user?.id || 'anonymous';
  return ['user', userId, ...baseKey];
}

/**
 * Hook para prefetch com cache offline
 */
export function useOfflinePrefetch() {
  const queryClient = useQueryClient();
  const { cacheQuery } = useOfflineCache();
  const { user } = useAuth();

  const prefetchWithCache = useCallback(async <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    cacheStrategy: Omit<CacheStrategy, 'userId'>
  ) => {
    const enhancedStrategy: CacheStrategy = {
      ...cacheStrategy,
      userId: user?.id
    };

    // Prefetch para React Query
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const result = await cacheQuery(queryFn, enhancedStrategy);
        return result.data;
      }
    });
  }, [queryClient, cacheQuery, user?.id]);

  return { prefetchWithCache };
}

export default useOfflineCacheQuery; 