import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// Importar diagnósticos para verificação automática
import './utils/env/envDiagnostic';
import './utils/dom/selectorUtils';

// Desabilitar React DevTools em desenvolvimento para evitar conflitos
if (import.meta.env && import.meta.env.MODE === 'development') {
  // Prevenir erros do React DevTools
  if (typeof window !== 'undefined') {
    // Desabilitar React DevTools temporariamente
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: true,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
    };
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
