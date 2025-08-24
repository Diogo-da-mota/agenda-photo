/**
 * Script para remover o badge do Lovable
 * Este script é executado no contexto global e remove qualquer badge do Lovable
 * que possa ser injetado dinamicamente pela plataforma
 */

(function() {
  'use strict';
  
  console.log('[Lovable Badge Remover] Script iniciado');
  
  function removeLovableBadge() {
    let removed = false;
    
    // Remove elementos com ID lovable-badge
    const badgeById = document.getElementById('lovable-badge');
    if (badgeById) {
      badgeById.remove();
      removed = true;
      console.log('[Lovable Badge Remover] Badge removido por ID');
    }
    
    // Remove links para lovable.dev
    const lovableLinks = document.querySelectorAll('a[href*="lovable.dev"]');
    if (lovableLinks.length > 0) {
      lovableLinks.forEach(link => link.remove());
      removed = true;
      console.log('[Lovable Badge Remover] Links do Lovable removidos:', lovableLinks.length);
    }
    
    // Remove elementos com classes ou IDs contendo 'lovable'
    const lovableElements = document.querySelectorAll('[class*="lovable"]:not(#root):not(#root *), [id*="lovable"]:not(#root)');
    if (lovableElements.length > 0) {
      lovableElements.forEach(element => {
        // Não remove se estiver dentro do root da aplicação
        if (!element.closest('#root')) {
          element.remove();
          removed = true;
        }
      });
      console.log('[Lovable Badge Remover] Elementos do Lovable removidos:', lovableElements.length);
    }
    
    // Remove elementos com position fixed que possam ser badges
    const fixedElements = document.querySelectorAll('*');
    fixedElements.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.position === 'fixed' && 
          (element.innerHTML.includes('lovable') || 
           element.innerHTML.includes('Lovable') ||
           element.outerHTML.includes('lovable') ||
           element.outerHTML.includes('Lovable'))) {
        if (!element.closest('#root')) {
          element.remove();
          removed = true;
          console.log('[Lovable Badge Remover] Elemento fixo do Lovable removido');
        }
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