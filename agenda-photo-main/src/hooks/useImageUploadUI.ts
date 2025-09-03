
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getUploadStats } from "@/services/image/monitoringService";

interface ImageUploadUIOptions {
  withStats?: boolean;
  [key: string]: unknown;
}

export function useImageUploadUI(options: ImageUploadUIOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<Record<string, unknown>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const cancelUploadRef = useRef(false);
  const { toast } = useToast();

  const refreshStats = async () => {
    if (!options.withStats) return;
    try {
      const stats = await getUploadStats();
      setUploadStats({
        uploadCount: stats.totalImages, // Changed from totalUploads to totalImages
        storageUsed: stats.totalSize,
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
