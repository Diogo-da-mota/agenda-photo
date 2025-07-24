import React from 'react';
import { useStorageStats } from '@/hooks/useStorageStats';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/services/storageStatsService';
import { Skeleton } from '@/components/ui/skeleton';

export const StorageUsageBar = () => {
  const { stats, loading, error } = useStorageStats();

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-4 w-1/4 bg-gray-600" />
          <Skeleton className="h-4 w-1/5 bg-gray-600" />
        </div>
        <Skeleton className="h-2 w-full mb-3 bg-gray-600" />
        <Skeleton className="h-3 w-1/3 mx-auto bg-gray-600" />
      </div>
    );
  }

  if (error || !stats) {
    return null; // Não renderiza nada em caso de erro para não poluir a UI
  }

  const { percentageUsed, totalUsedBytes, totalAvailableBytes } = stats;

  // Define a cor da barra com base no percentual de uso
  const getProgressColor = () => {
    if (percentageUsed >= 90) return 'bg-red-500';
    if (percentageUsed >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-3 sm:p-4 rounded-lg bg-gray-900 border border-gray-800 text-white">
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-gray-300 font-medium text-xs sm:text-sm">
          <span className="sm:hidden">Armazen...</span>
          <span className="hidden sm:inline">Armazenamento</span>
        </span>
        <span className="text-gray-400 text-xs sm:text-sm">
          {formatBytes(totalUsedBytes)} / {formatBytes(totalAvailableBytes)}
        </span>
      </div>
      <p className="text-center text-xs text-gray-500 mb-2 mt-1">
        Limite por arquivo: 10 MB
      </p>
      <Progress
        value={percentageUsed}
        className={`h-2 [&>div]:${getProgressColor()}`}
      />
    </div>
  );
}; 