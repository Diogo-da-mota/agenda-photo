
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { BatchProgress as BatchProgressType } from './types';

interface BatchProgressProps {
  isProcessing: boolean;
  statusMessage: string;
  batchProgress: BatchProgressType;
}

const BatchProgress: React.FC<BatchProgressProps> = ({ 
  isProcessing, 
  statusMessage, 
  batchProgress 
}) => {
  if (!isProcessing) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
      <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
        {statusMessage || `Processando ${batchProgress.current} de ${batchProgress.total} imagens...`}
      </p>
      <Progress 
        value={batchProgress.total ? (batchProgress.current / batchProgress.total) * 100 : 0} 
        className="mt-2 h-2"
      />
    </div>
  );
};

export default BatchProgress;
