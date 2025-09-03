
import { useState, useEffect } from 'react';
import { useAdvancedDebounce } from './useAdvancedDebounce';

/**
 * Hook de debounce para scroll
 * Otimizado para eventos de scroll
 */
export const useScrollDebounce = (delay: number = 16) => { // 60fps
  const [scrollPosition, setScrollPosition] = useState({
    x: typeof window !== 'undefined' ? window.pageXOffset : 0,
    y: typeof window !== 'undefined' ? window.pageYOffset : 0
  });

  const debouncedPosition = useAdvancedDebounce(scrollPosition, delay, {
    trailing: true,
    leading: true // Resposta imediata para scroll
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    x: debouncedPosition.x,
    y: debouncedPosition.y,
    isScrolling: scrollPosition.x !== debouncedPosition.x || 
                 scrollPosition.y !== debouncedPosition.y
  };
};
