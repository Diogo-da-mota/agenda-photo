import { createClient } from '@supabase/supabase-js';

// Configuração direta para resolver problemas de deployment
const supabaseUrl = 'https://adxwgpfkvizpqdvortpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o';

// Validação simples
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials missing');
}

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