/**
 * Script para remover o badge do Lovable
 * Este script é executado no contexto global e remove qualquer badge do Lovable
 * que possa ser injetado dinamicamente pela plataforma
 */

(function() {
  'use strict';
  
  console.log('[Lovable Badge Remover] Script iniciado');
  
  // Função auxiliar para verificar se um elemento ainda está no DOM
  function isElementInDOM(element) {
    return element && element.parentNode && document.contains(element);
  }
  
  // Função auxiliar para remover elemento com segurança
  function safeRemoveElement(element, description) {
    try {
      if (isElementInDOM(element)) {
        element.remove();
        console.log(`[Lovable Badge Remover] ${description}`);
        return true;
      }
    } catch (error) {
      console.warn(`[Lovable Badge Remover] Erro ao remover ${description}:`, error);
    }
    return false;
  }

  function removeLovableBadge() {
    let removed = false;
    
    // Remove elementos com ID lovable-badge
    const badgeById = document.getElementById('lovable-badge');
    if (badgeById && safeRemoveElement(badgeById, 'Badge removido por ID')) {
      removed = true;
    }
    
    // Remove links para lovable.dev
    const lovableLinks = document.querySelectorAll('a[href*="lovable.dev"]');
    if (lovableLinks.length > 0) {
      let linksRemoved = 0;
      lovableLinks.forEach(link => {
        if (safeRemoveElement(link, 'Link do Lovable removido')) {
          linksRemoved++;
          removed = true;
        }
      });
      if (linksRemoved > 0) {
        console.log('[Lovable Badge Remover] Links do Lovable removidos:', linksRemoved);
      }
    }
    
    // Remove elementos com classes ou IDs contendo 'lovable'
    const lovableElements = document.querySelectorAll('[class*="lovable"]:not(#root):not(#root *), [id*="lovable"]:not(#root)');
    if (lovableElements.length > 0) {
      let elementsRemoved = 0;
      lovableElements.forEach(element => {
        // Não remove se estiver dentro do root da aplicação
        if (!element.closest('#root') && safeRemoveElement(element, 'Elemento do Lovable removido')) {
          elementsRemoved++;
          removed = true;
        }
      });
      if (elementsRemoved > 0) {
        console.log('[Lovable Badge Remover] Elementos do Lovable removidos:', elementsRemoved);
      }
    }
    
    // Remove elementos com position fixed que possam ser badges
    const fixedElements = document.querySelectorAll('*');
    fixedElements.forEach(element => {
      try {
        if (!isElementInDOM(element)) return;
        
        const style = window.getComputedStyle(element);
        if (style.position === 'fixed' && 
            (element.innerHTML.includes('lovable') || 
             element.innerHTML.includes('Lovable') ||
             element.outerHTML.includes('lovable') ||
             element.outerHTML.includes('Lovable'))) {
          if (!element.closest('#root') && safeRemoveElement(element, 'Elemento fixo do Lovable removido')) {
            removed = true;
          }
        }
      } catch (error) {
        // Ignora erros de elementos que podem ter sido removidos durante a iteração
        console.warn('[Lovable Badge Remover] Erro ao processar elemento fixo:', error);
      }
    });
    
    return removed;
  }
  
  // Remove imediatamente
  removeLovableBadge();
  
  // Observer para mudanças no DOM
  const observer = new MutationObserver(function(mutations) {
    let shouldCheck = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            const html = element.outerHTML || '';
            
            // Verifica se o elemento adicionado contém referências ao Lovable
            if (html.toLowerCase().includes('lovable') || 
                element.id === 'lovable-badge' ||
                (element.querySelector && element.querySelector('[id*="lovable"], [class*="lovable"], a[href*="lovable.dev"]'))) {
              shouldCheck = true;
            }
          }
        });
      }
    });
    
    if (shouldCheck) {
      // Pequeno delay para garantir que o elemento foi renderizado
      setTimeout(removeLovableBadge, 100);
    }
  });
  
  // Inicia o observer quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Verifica periodicamente (fallback)
  setInterval(removeLovableBadge, 5000);
  
  console.log('[Lovable Badge Remover] Observer configurado');
})();