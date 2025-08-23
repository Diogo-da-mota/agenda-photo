import { useEffect } from 'react';

/**
 * Hook para remover o badge do Lovable que é injetado dinamicamente
 * O badge aparece como um elemento com id 'lovable-badge'
 */
export const useLovableBadgeRemover = () => {
  useEffect(() => {
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