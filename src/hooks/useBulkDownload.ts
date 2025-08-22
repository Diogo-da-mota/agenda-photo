/**
 * Hook customizado para gerenciar downloads múltiplos
 * FASE 2 - Estratégias Inteligentes de Download
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  BulkDownloadState, 
  DownloadProgress, 
  DownloadConfig, 
  DownloadCallbacks,
  BulkDownloadResult 
} from '@/types/download-multiple';

export interface ImageDownloadData {
  id: string;
  url: string;
  fileName: string;
  fileSize?: number; // NOVO: Para estratégias inteligentes
}

export interface UseBulkDownloadProps {
  config?: Partial<DownloadConfig>;
  callbacks?: DownloadCallbacks;
}

// NOVO: Detector de velocidade de conexão
const detectConnectionSpeed = async (): Promise<'slow' | 'medium' | 'fast'> => {
  try {
    const startTime = Date.now();
    await fetch('/favicon.ico', { cache: 'no-cache' });
    const duration = Date.now() - startTime;
    
    if (duration > 1000) return 'slow';
    if (duration > 300) return 'medium';
    return 'fast';
  } catch {
    return 'medium'; // Fallback
  }
};

// NOVO: Estratégia inteligente baseada em contexto
const getOptimalStrategy = (
  imageCount: number, 
  connectionSpeed: 'slow' | 'medium' | 'fast',
  totalSizeEstimate?: number
): { strategy: 'sequential' | 'parallel' | 'chunked', maxConcurrent: number, chunkSize: number } => {
  
  // Estratégia baseada na quantidade de imagens e velocidade
  if (imageCount <= 3) {
    return { strategy: 'sequential', maxConcurrent: 1, chunkSize: 1 };
  }
  
  if (imageCount <= 10) {
    const concurrent = connectionSpeed === 'fast' ? 3 : connectionSpeed === 'medium' ? 2 : 1;
    return { strategy: 'parallel', maxConcurrent: concurrent, chunkSize: 5 };
  }
  
  if (imageCount <= 25) {
    const concurrent = connectionSpeed === 'fast' ? 4 : connectionSpeed === 'medium' ? 3 : 2;
    return { strategy: 'chunked', maxConcurrent: concurrent, chunkSize: 8 };
  }
  
  // Muitas imagens: estratégia conservadora
  const concurrent = connectionSpeed === 'fast' ? 3 : 2;
  return { strategy: 'chunked', maxConcurrent: concurrent, chunkSize: 10 };
};

export const useBulkDownload = ({ 
  config = {}, 
  callbacks = {} 
}: UseBulkDownloadProps = {}) => {
  
  const [downloadState, setDownloadState] = useState<BulkDownloadState>({
    isDownloading: false,
    totalImages: 0,
    completedImages: 0,
    failedImages: 0,
    overallProgress: 0,
    downloads: new Map(),
    strategy: 'sequential'
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const connectionSpeedRef = useRef<'slow' | 'medium' | 'fast'>('medium');

  // Configuração padrão
  const defaultConfig: DownloadConfig = {
    strategy: 'sequential',
    maxConcurrent: 3,
    chunkSize: 5,
    retryAttempts: 2,
    retryDelay: 1000,
    ...config
  };

  // MELHORADO: Download de uma única imagem com retry inteligente
  const downloadSingleImage = useCallback(async (
    imageData: ImageDownloadData,
    signal?: AbortSignal,
    retryCount = 0
  ): Promise<DownloadProgress> => {
    const progress: DownloadProgress = {
      imageId: imageData.id,
      imageUrl: imageData.url,
      fileName: imageData.fileName,
      progress: 0,
      status: 'pending',
      startTime: Date.now()
    };

    try {
      // Atualizar estado para downloading
      progress.status = 'downloading';
      progress.progress = 10;
      
      setDownloadState(prev => ({
        ...prev,
        downloads: new Map(prev.downloads).set(imageData.id, { ...progress })
      }));

      callbacks.onProgress?.(progress);

      // MELHORADO: Timeout baseado na velocidade da conexão
      const timeoutMs = connectionSpeedRef.current === 'slow' ? 30000 : 
                      connectionSpeedRef.current === 'medium' ? 20000 : 10000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Combinar sinais de abort
      const combinedSignal = signal?.aborted ? signal : controller.signal;

      // Fazer o download
      const response = await fetch(imageData.url, { signal: combinedSignal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      progress.progress = 50;
      callbacks.onProgress?.(progress);

      const blob = await response.blob();
      progress.progress = 80;
      callbacks.onProgress?.(progress);

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageData.fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Finalizar com sucesso
      progress.status = 'completed';
      progress.progress = 100;
      progress.endTime = Date.now();

      setDownloadState(prev => ({
        ...prev,
        downloads: new Map(prev.downloads).set(imageData.id, { ...progress }),
        completedImages: prev.completedImages + 1
      }));

      callbacks.onProgress?.(progress);
      return progress;

    } catch (error) {
      // NOVO: Retry inteligente
      if (retryCount < (defaultConfig.retryAttempts || 2) && !signal?.aborted) {
        const delay = (defaultConfig.retryDelay || 1000) * Math.pow(2, retryCount); // Exponential backoff
        
        progress.status = 'retrying';
        progress.error = `Tentativa ${retryCount + 1}/${defaultConfig.retryAttempts || 2}`;
        
        setDownloadState(prev => ({
          ...prev,
          downloads: new Map(prev.downloads).set(imageData.id, { ...progress })
        }));
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return downloadSingleImage(imageData, signal, retryCount + 1);
      }

      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : 'Erro desconhecido';
      progress.endTime = Date.now();

      setDownloadState(prev => ({
        ...prev,
        downloads: new Map(prev.downloads).set(imageData.id, { ...progress }),
        failedImages: prev.failedImages + 1
      }));

      callbacks.onProgress?.(progress);
      callbacks.onError?.(progress.error, imageData.id);
      
      return progress;
    }
  }, [callbacks, defaultConfig.retryAttempts, defaultConfig.retryDelay]);

  // Download sequencial
  const downloadSequential = useCallback(async (
    images: ImageDownloadData[]
  ): Promise<DownloadProgress[]> => {
    const results: DownloadProgress[] = [];
    
    for (const image of images) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }
      
      const result = await downloadSingleImage(image, abortControllerRef.current?.signal);
      results.push(result);
      
      // Atualizar progresso geral
      const overallProgress = (results.length / images.length) * 100;
      setDownloadState(prev => ({
        ...prev,
        overallProgress
      }));
    }
    
    return results;
  }, [downloadSingleImage]);

  // MELHORADO: Download paralelo com controle dinâmico
  const downloadParallel = useCallback(async (
    images: ImageDownloadData[],
    maxConcurrent: number = 3
  ): Promise<DownloadProgress[]> => {
    const results: DownloadProgress[] = [];
    
    for (let i = 0; i < images.length; i += maxConcurrent) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }
      
      const chunk = images.slice(i, i + maxConcurrent);
      const chunkPromises = chunk.map(image => 
        downloadSingleImage(image, abortControllerRef.current?.signal)
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // Atualizar progresso geral
      const overallProgress = (results.length / images.length) * 100;
      setDownloadState(prev => ({
        ...prev,
        overallProgress
      }));

      // NOVO: Pausa adaptativa entre chunks baseada na velocidade
      if (i + maxConcurrent < images.length) {
        const pauseMs = connectionSpeedRef.current === 'slow' ? 2000 : 
                       connectionSpeedRef.current === 'medium' ? 1000 : 500;
        await new Promise(resolve => setTimeout(resolve, pauseMs));
      }
    }
    
    return results;
  }, [downloadSingleImage]);

  // NOVO: Download em chunks para grandes volumes
  const downloadChunked = useCallback(async (
    images: ImageDownloadData[],
    chunkSize: number = 10,
    maxConcurrent: number = 3
  ): Promise<DownloadProgress[]> => {
    const results: DownloadProgress[] = [];
    
    for (let i = 0; i < images.length; i += chunkSize) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }
      
      const chunk = images.slice(i, i + chunkSize);
      const chunkResults = await downloadParallel(chunk, maxConcurrent);
      results.push(...chunkResults);
      
      // Pausa maior entre chunks grandes
      if (i + chunkSize < images.length) {
        const pauseMs = connectionSpeedRef.current === 'slow' ? 3000 : 
                       connectionSpeedRef.current === 'medium' ? 2000 : 1000;
        await new Promise(resolve => setTimeout(resolve, pauseMs));
      }
    }
    
    return results;
  }, [downloadParallel]);

  // MELHORADO: Função principal com estratégias inteligentes
  const startBulkDownload = useCallback(async (
    images: ImageDownloadData[]
  ): Promise<BulkDownloadResult> => {
    if (downloadState.isDownloading) {
      toast.error('Já existe um download em andamento');
      return {
        success: false,
        totalRequested: 0,
        totalCompleted: 0,
        totalFailed: 0,
        duration: 0,
        errors: ['Download já em andamento'],
        completedFiles: []
      };
    }

    if (images.length === 0) {
      toast.error('Nenhuma imagem selecionada para download');
      return {
        success: false,
        totalRequested: 0,
        totalCompleted: 0,
        totalFailed: 0,
        duration: 0,
        errors: ['Nenhuma imagem selecionada'],
        completedFiles: []
      };
    }

    // NOVO: Detectar velocidade da conexão
    connectionSpeedRef.current = await detectConnectionSpeed();
    
    // NOVO: Escolher estratégia otimizada
    const optimalConfig = getOptimalStrategy(images.length, connectionSpeedRef.current);
    
    // Inicializar estado
    const startTime = Date.now();
    abortControllerRef.current = new AbortController();
    
    setDownloadState({
      isDownloading: true,
      totalImages: images.length,
      completedImages: 0,
      failedImages: 0,
      overallProgress: 0,
      downloads: new Map(),
      strategy: optimalConfig.strategy,
      startTime
    });

    callbacks.onStart?.(images.map(img => img.id));
    
    // NOVO: Toast informativo sobre a estratégia
    const strategyMessage = `Iniciando download de ${images.length} fotos (${optimalConfig.strategy})`;
    toast.info(strategyMessage);
    
    try {
      let results: DownloadProgress[];

      // MELHORADO: Aplicar estratégia otimizada
      switch (optimalConfig.strategy) {
        case 'sequential':
          results = await downloadSequential(images);
          break;
        case 'parallel':
          results = await downloadParallel(images, optimalConfig.maxConcurrent);
          break;
        case 'chunked':
          results = await downloadChunked(images, optimalConfig.chunkSize, optimalConfig.maxConcurrent);
          break;
        default:
          results = await downloadSequential(images);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const completedResults = results.filter(r => r.status === 'completed');
      const failedResults = results.filter(r => r.status === 'error');
      
      const finalResult: BulkDownloadResult = {
        success: failedResults.length === 0,
        totalRequested: images.length,
        totalCompleted: completedResults.length,
        totalFailed: failedResults.length,
        duration,
        errors: failedResults.map(r => r.error || 'Erro desconhecido'),
        completedFiles: completedResults.map(r => r.fileName)
      };

      // Finalizar estado
      setDownloadState(prev => ({
        ...prev,
        isDownloading: false,
        overallProgress: 100,
        endTime
      }));

      // MELHORADO: Mensagens mais informativas
      if (finalResult.success) {
        const timeStr = (duration / 1000).toFixed(1);
        toast.success(`${completedResults.length} fotos baixadas em ${timeStr}s!`);
      } else if (completedResults.length > 0) {
        toast.warning(
          `${completedResults.length} fotos baixadas, ${failedResults.length} falharam`
        );
      } else {
        toast.error('Falha ao baixar todas as fotos');
      }

      callbacks.onComplete?.(results);
      return finalResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setDownloadState(prev => ({
        ...prev,
        isDownloading: false,
        endTime: Date.now()
      }));

      callbacks.onError?.(errorMessage);
      toast.error(`Erro no download: ${errorMessage}`);
      
      return {
        success: false,
        totalRequested: images.length,
        totalCompleted: 0,
        totalFailed: images.length,
        duration: Date.now() - startTime,
        errors: [errorMessage],
        completedFiles: []
      };
    }
  }, [downloadState.isDownloading, callbacks, downloadSequential, downloadParallel, downloadChunked]);

  // Cancelar download
  const cancelDownload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      
      setDownloadState(prev => ({
        ...prev,
        isDownloading: false
      }));

      callbacks.onCancel?.();
      toast.info('Download cancelado');
    }
  }, [callbacks]);

  // Resetar estado
  const resetDownloadState = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      totalImages: 0,
      completedImages: 0,
      failedImages: 0,
      overallProgress: 0,
      downloads: new Map(),
      strategy: 'sequential'
    });
  }, []);

  return {
    // Estado
    downloadState,
    isDownloading: downloadState.isDownloading,
    overallProgress: downloadState.overallProgress,
    completedImages: downloadState.completedImages,
    failedImages: downloadState.failedImages,
    totalImages: downloadState.totalImages,
    
    // Ações
    startBulkDownload,
    cancelDownload,
    resetDownloadState,
    
    // Utilitários
    getDownloadProgress: (imageId: string) => downloadState.downloads.get(imageId),
    getAllDownloads: () => Array.from(downloadState.downloads.values()),
    getDownloadSummary: () => ({
      total: downloadState.totalImages,
      completed: downloadState.completedImages,
      failed: downloadState.failedImages,
      inProgress: downloadState.totalImages - downloadState.completedImages - downloadState.failedImages,
      overallProgress: downloadState.overallProgress,
      isActive: downloadState.isDownloading
    })
  };
};