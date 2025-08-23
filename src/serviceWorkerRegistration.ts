import serviceWorkerSingleton from './utils/serviceWorkerSingleton';

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await serviceWorkerSingleton.register({
          onSuccess: (registration) => {
            // console.log('[SW Registration] Service Worker registered with scope:', registration.scope); // Removido para produção
          },
          onError: (error) => {
            console.error('[SW Registration] Service Worker registration failed:', error);
          },
          onUpdate: (registration) => {
            console.log('[SW Registration] Service Worker update available');
          }
        });
        
        if (registration) {
          // console.log('[SW Registration] Registration successful'); // Removido para produção
        }
      } catch (error) {
        console.error('[SW Registration] Registration error:', error);
      }
    });
  }
}

export async function unregister() {
  try {
    const result = await serviceWorkerSingleton.unregister();
    if (result) {
      console.log('[SW Registration] Service Worker unregistered successfully');
    } else {
      console.log('[SW Registration] No Service Worker to unregister');
    }
    return result;
  } catch (error) {
    console.error('[SW Registration] Error unregistering Service Worker:', error);
    return false;
  }
}