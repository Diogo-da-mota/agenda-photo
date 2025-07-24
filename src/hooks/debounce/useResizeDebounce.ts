
import { useState, useEffect } from 'react';
import { useAdvancedDebounce } from './useAdvancedDebounce';

/**
 * Hook de debounce para resize
 * Otimizado para redimensionamento de janela
 */
export const useResizeDebounce = (delay: number = 100) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const debouncedSize = useAdvancedDebounce(windowSize, delay, {
    trailing: true,
    maxWait: 500 // Máximo de 500ms para responsividade
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: debouncedSize.width,
    height: debouncedSize.height,
    isResizing: windowSize.width !== debouncedSize.width || 
                windowSize.height !== debouncedSize.height
  };
};
