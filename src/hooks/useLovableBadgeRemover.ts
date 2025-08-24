import { useEffect } from 'react';

/**
 * Hook para remover o badge do Lovable que é injetado dinamicamente
 * O badge aparece como um elemento com id 'lovable-badge'
 */
export const useLovableBadgeRemover = () => {
  useEffect(() => {
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

    const removeLovableBadge = () => {
      // Procura pelo badge do Lovable
      const lovableBadge = document.getElementById('lovable-badge');
      if (lovableBadge && safeRemoveElement(lovableBadge, 'Badge do Lovable removido')) {
        // Badge removido com sucesso
      }

      // Procura por elementos que contenham 'lovable' no href
      const lovableLinks = document.querySelectorAll('a[href*="lovable.dev"]');
      lovableLinks.forEach(link => {
        safeRemoveElement(link, 'Link do Lovable removido');
      });

      // Procura por elementos com classes relacionadas ao Lovable
      const lovableElements = document.querySelectorAll('[class*="lovable"], [id*="lovable"]');
      lovableElements.forEach(element => {
        if (element.id !== 'root' && !element.closest('#root')) {
          safeRemoveElement(element, 'Elemento do Lovable removido');
        }
      });
    };

    // Remove imediatamente se já existir
    removeLovableBadge();

    // Observa mudanças no DOM para remover badges que possam ser adicionados dinamicamente
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      // Usar requestIdleCallback se disponível, senão setTimeout
      const scheduleCheck = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(callback, { timeout: 1000 });
        } else {
          setTimeout(callback, 200);
        }
      };
      
      mutations.forEach((mutation) => {
        // Verificar apenas adições de nós, ignorar remoções para evitar conflitos
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
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
            }
          });
        }
      });
      
      if (shouldCheck) {
        scheduleCheck(() => {
          try {
            removeLovableBadge();
          } catch (error) {
            console.warn('[Badge Remover React] Erro durante remoção:', error);
          }
        });
      }
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