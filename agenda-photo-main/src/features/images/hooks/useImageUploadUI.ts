
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUploadStats } from "@/features/images/services/monitoringService";

export function useImageUploadUI(options: any = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<Record<string, any>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const cancelUploadRef = useRef(false);
  const { toast } = useToast();

  const refreshStats = async () => {
    if (!options.withStats) return;
    try {
      // Passando um userId mock para a função que espera parâmetro
      const stats = await getUploadStats('mock-user-id');
      setUploadStats({
        uploadCount: stats.totalImages || 0, // Changed from totalUploads to totalImages
        storageUsed: stats.totalSize || 0,
      });
    } catch (error) {
      // silenciosamente só loga
      console.error('Erro ao atualizar estatísticas:', error);
    }
  };

  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    
  };

  const resetUpload = () => {
    setUploadedImageUrl(null);
    setError(null);
    setProgress(0);
    setStatusMessage('');
  };

  return {
    isUploading, setIsUploading,
    isBatchProcessing, setIsBatchProcessing,
    progress, setProgress,
    error, setError,
    uploadedImageUrl, setUploadedImageUrl,
    uploadStats, setUploadStats,
    statusMessage, setStatusMessage,
    batchProgress, setBatchProgress,
    cancelUploadRef,
    toast: showToast,
    resetUpload,
    refreshStats,
  };
}
