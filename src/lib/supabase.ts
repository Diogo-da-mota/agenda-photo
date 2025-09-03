import { createClient } from '@supabase/supabase-js';

// Configuração direta para resolver problemas de deployment
const supabaseUrl = 'https://adxwgpfkvizpqdvortpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';

// Validação simples
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials missing');
}

// Interceptador para garantir headers Accept corretos em todas as requisições
// Corrige erro 406 Not Acceptable no macOS
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Verifica se é uma requisição para o Supabase
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const isSupabaseRequest = url.includes('supabase.co') || url.includes('/rest/v1/');
  
  if (isSupabaseRequest) {
    // Garante que o header Accept seja sempre application/json para requisições Supabase
    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    
    const newInit: RequestInit = {
      ...init,
      headers
    };
    
    return originalFetch(input, newInit);
  }
  
  // Para outras requisições, usa o comportamento padrão
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
    }
  }
});

// console.log('[DEBUG] Supabase cliente configurado com sucesso'); // Removido para produção