import { useEffect } from 'react';

/**
 * Hook para remover o badge do Lovable que é injetado dinamicamente
 * O badge aparece como um elemento com id 'lovable-badge'
 */
export const useLovableBadgeRemover = () => {
  useEffect(() => {
<<<<<<< Updated upstream
    // Função auxiliar para verificar se um elemento ainda está no DOM
    const isElementInDOM = (element: Element | null): element is Element => {
      if (!element) return false;
      try {
        return element.parentNode !== null && document.contains(element) && element.isConnected;
      } catch {
        return false;
      }
    };

    // Função auxiliar para remover elemento com segurança
    const safeRemoveElement = (element: Element, description: string): boolean => {
      try {
        // Verificações adicionais de segurança
        if (!isElementInDOM(element)) {
          return false;
        }
        
        // Verificar se o elemento não é crítico para a aplicação
        if (element.closest('#root') || element.id === 'root' || element.tagName === 'HTML' || element.tagName === 'BODY') {
          console.warn(`[Badge Remover React] Elemento crítico ignorado: ${description}`);
          return false;
        }
        
        // NOVO: Evitar elementos dentro de modais, dialogs ou portals
        if (element.closest('[data-radix-portal]') || 
            element.closest('[role="dialog"]') || 
            element.closest('[role="modal"]') ||
            element.closest('.modal') ||
            element.closest('iframe') ||
            element.closest('[data-state]')) {
          console.log(`[Badge Remover React] Elemento em modal/dialog ignorado: ${description}`);
          return false;
        }
        
        // Usar requestAnimationFrame para evitar conflitos de renderização
        requestAnimationFrame(() => {
          try {
            if (isElementInDOM(element)) {
              element.remove();
              console.log(`[Badge Remover React] ${description}`);
            }
          } catch (error) {
            console.warn(`[Badge Remover React] Erro durante remoção assíncrona de ${description}:`, error);
          }
        });
        
        return true;
      } catch (error) {
        console.warn(`[Badge Remover React] Erro ao remover ${description}:`, error);
      }
      return false;
    };

=======
>>>>>>> Stashed changes
    const removeLovableBadge = () => {
      // Procura pelo badge do Lovable
      const lovableBadge = document.getElementById('lovable-badge');
      if (lovableBadge) {
        lovableBadge.remove();
        console.log('[Badge Remover] Badge do Lovable removido');
      }

      // Procura por elementos que contenham 'lovable' no href
      const lovableLinks = document.querySelectorAll('a[href*="lovable.dev"]');
      lovableLinks.forEach(link => {
        link.remove();
        console.log('[Badge Remover] Link do Lovable removido');
      });

      // Procura por elementos com classes relacionadas ao Lovable
      const lovableElements = document.querySelectorAll('[class*="lovable"], [id*="lovable"]');
      lovableElements.forEach(element => {
        if (element.id !== 'root' && !element.closest('#root')) {
          element.remove();
          console.log('[Badge Remover] Elemento do Lovable removido:', element);
        }
      });
    };

    // Remove imediatamente se já existir
    removeLovableBadge();

    // Observa mudanças no DOM para remover badges que possam ser adicionados dinamicamente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
<<<<<<< Updated upstream
        // Verificar apenas adições de nós, ignorar remoções para evitar conflitos
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // NOVO: Evitar processar mudanças em modais/dialogs ativos
          const target = mutation.target as Element;
          if (target && (
            target.closest('[data-radix-portal]') || 
            target.closest('[role="dialog"]') || 
            target.closest('[role="modal"]') ||
            target.closest('.modal') ||
            target.closest('iframe')
          )) {
            return; // Pular processamento de mudanças em modais
          }
          
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              try {
                // Verificar se o elemento ainda está conectado antes de processar
                if (!element.isConnected) return;
                
                // Verifica se o elemento adicionado é o badge do Lovable
                if (
                  element.id === 'lovable-badge' ||
                  (element.querySelector && element.querySelector('#lovable-badge')) ||
                  (element.matches && element.matches('a[href*="lovable.dev"]')) ||
                  (element.querySelector && element.querySelector('a[href*="lovable.dev"]')) ||
                  (element.matches && element.matches('[class*="lovable"], [id*="lovable"]')) ||
                  (element.querySelector && element.querySelector('[class*="lovable"], [id*="lovable"]'))
                ) {
                  shouldCheck = true;
                }
              } catch (error) {
                // Ignora erros de elementos que podem ter sido removidos durante a verificação
                console.warn('[Badge Remover React] Erro ao verificar elemento:', error);
              }
=======
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Verifica se o elemento adicionado é o badge do Lovable
            if (
              element.id === 'lovable-badge' ||
              element.querySelector('#lovable-badge') ||
              element.matches('a[href*="lovable.dev"]') ||
              element.querySelector('a[href*="lovable.dev"]') ||
              element.matches('[class*="lovable"], [id*="lovable"]') ||
              element.querySelector('[class*="lovable"], [id*="lovable"]')
            ) {
              setTimeout(() => {
                removeLovableBadge();
              }, 100); // Pequeno delay para garantir que o elemento foi totalmente renderizado
>>>>>>> Stashed changes
            }
          }
        });
      });
    });

    // Observa mudanças no body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
};