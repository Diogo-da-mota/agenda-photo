
import { useState, useEffect } from 'react';

interface UploadProgress {
  current: number;
  total: number;
  currentFileName: string;
}

export const useUploadProgress = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  useEffect(() => {
    const handleUploadProgress = (event: CustomEvent) => {
      const { current, total, fileName, error } = event.detail;
      
      setUploadProgress({
        current,
        total,
        currentFileName: fileName
      });

      if (error) {
        setTimeout(() => {
          setUploadProgress(prev => prev ? { ...prev, currentFileName: fileName } : null);
        }, 2000);
      }
    };

    window.addEventListener('uploadProgress', handleUploadProgress as EventListener);
    return () => {
      window.removeEventListener('uploadProgress', handleUploadProgress as EventListener);
    };
  }, []);

  return {
    uploadProgress,
    setUploadProgress
  };
};
