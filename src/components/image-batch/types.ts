
export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'waiting' | 'processing' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface BatchProgress {
  current: number;
  total: number;
}
