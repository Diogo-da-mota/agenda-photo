import { createClient } from '@supabase/supabase-js';

// Configuração direta para resolver problemas de deployment
const supabaseUrl = 'https://adxwgpfkvizpqdvortpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';

// Validação simples
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials missing');
}

// Interceptador de fetch para forçar headers corretos
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Verifica se é uma requisição para o Supabase
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  if (url && url.includes('adxwgpfkvizpqdvortpu.supabase.co')) {
    // Força headers corretos para requisições Supabase
    const headers = new Headers(init?.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    
    const newInit: RequestInit = {
      ...init,
      headers: headers
    };
    
    console.log('[SUPABASE INTERCEPTOR] Forçando headers:', {
      url: url,
      accept: headers.get('Accept'),
      contentType: headers.get('Content-Type')
    });
    
    return originalFetch(input, newInit);
  }
  
  // Para outras requisições, usa fetch original
  return originalFetch(input, init);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    fetch: (url, options = {}) => {
      // Dupla garantia: interceptador customizado para Supabase
      const headers = new Headers(options.headers || {});
      headers.set('Accept', 'application/json');
      headers.set('Content-Type', 'application/json');
      
      return fetch(url, {
        ...options,
        headers: headers
      });
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    headers: {
      'Accept': 'application/json'
    }
  }
});

// console.log('[DEBUG] Supabase cliente configurado com sucesso'); // Removido para produção