import { useState, useEffect, useCallback } from 'react';
import { getStorageStats } from '@/services/storageStatsService';

interface StorageStats {
  totalUsedBytes: number;
  totalAvailableBytes: number;
  percentageUsed: number;
}

export const useStorageStats = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStorageStats();
      if (data) {
        setStats(data);
      } else {
        setError('Não foi possível carregar os dados de armazenamento.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao buscar os dados de armazenamento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetchStats: fetchStats };
}; 