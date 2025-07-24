import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado para gerenciar portais do Radix Select
 * Previne conflitos de DOM e erros de removeChild
 */
export function useSelectPortal() {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const cleanupRef = useRef<NodeJS.Timeout>();

  // Força re-render do Select quando necessário
  const forceUpdate = () => {
    setKey(prev => prev + 1);
  };

  // Gerencia abertura/fechamento do Select
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    if (!open) {
      // Aguarda o portal fechar completamente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // Limpeza de portais órfãos
        cleanupPortals();
      }, 150);
    }
  };

  // Limpeza de portais órfãos
  const cleanupPortals = () => {
    try {
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        // Remove portais vazios ou órfãos
        if (!portal.children.length || !portal.isConnected) {
          try {
            if (portal.parentNode) {
              portal.parentNode.removeChild(portal);
            }
          } catch (e) {
            // Ignora erros de remoção - portal já pode ter sido removido
            console.debug('Portal cleanup: elemento já removido');
          }
        }
      });
    } catch (error) {
      console.debug('Portal cleanup error:', error);
    }
  };

  // Limpeza preventiva ao montar/desmontar
  useEffect(() => {
    // Limpeza inicial
    cleanupRef.current = setTimeout(cleanupPortals, 100);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cleanupRef.current) {
        clearTimeout(cleanupRef.current);
      }
      // Limpeza final
      setTimeout(cleanupPortals, 50);
    };
  }, []);

  return {
    key,
    isOpen,
    handleOpenChange,
    forceUpdate,
    cleanupPortals
  };
}