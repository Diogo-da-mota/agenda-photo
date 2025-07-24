/**
 * Tipos TypeScript para o sistema de download múltiplo
 * FASE 1 - Core Functionality
 */

// Estado de seleção de imagens
export interface SelectionState {
  selectedImages: Set<string>;
  isSelectionMode: boolean;
  downloadProgress: Map<string, number>;
  downloadQueue: string[];
}

// Estratégias de download
export type DownloadStrategy = 'sequential' | 'parallel' | 'chunked';

export interface DownloadConfig {
  strategy: DownloadStrategy;
  maxConcurrent?: number;
  chunkSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Progresso de download individual
export interface DownloadProgress {
  imageId: string;
  imageUrl: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  startTime?: number;
  endTime?: number;
}

// Estado global de download múltiplo
export interface BulkDownloadState {
  isDownloading: boolean;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  overallProgress: number;
  downloads: Map<string, DownloadProgress>;
  strategy: DownloadStrategy;
  startTime?: number;
  endTime?: number;
}

// Configurações da barra de ações
export interface ActionBarConfig {
  showSelectAll?: boolean;
  showDownloadAll?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  position?: 'top' | 'bottom';
}

// Eventos de callback
export interface DownloadCallbacks {
  onStart?: (imageIds: string[]) => void;
  onProgress?: (progress: DownloadProgress) => void;
  onComplete?: (results: DownloadProgress[]) => void;
  onError?: (error: string, imageId?: string) => void;
  onCancel?: () => void;
}

// Configurações de UI
export interface UIConfig {
  showProgressBar: boolean;
  showIndividualProgress: boolean;
  enableKeyboardShortcuts: boolean;
  enableHoverEffects: boolean;
  animationDuration: number;
}

// Resultado de download múltiplo
export interface BulkDownloadResult {
  success: boolean;
  totalRequested: number;
  totalCompleted: number;
  totalFailed: number;
  duration: number;
  errors: string[];
  completedFiles: string[];
}