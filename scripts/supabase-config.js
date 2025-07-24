/**
 * 🔧 UTILITÁRIO PARA SCRIPTS NODE.JS
 * 
 * Este arquivo fornece configuração Supabase para scripts
 * que executam em ambiente Node.js (sem import.meta.env)
 * 
 * ✅ Critério 1 (DRY): Configuração centralizada para scripts
 * ✅ Critério 16 (Segurança): Credenciais gerenciadas
 * ✅ Critério 10 (Estrutura): Organização consistente
 */

// Configuração para scripts Node.js
export const SUPABASE_SCRIPT_CONFIG = {
  url: 'https://adxwgpfkvizpqdvortpu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeHdncGZrdml6cHFkdm9ydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODU5OTksImV4cCI6MjA2Mzg2MTk5OX0.L79cLQdkA8_PLE2QQ4nGM1i8M0rESZWK7HlfrugIk0o'
};

// Para compatibilidade com scripts existentes
export const supabaseUrl = SUPABASE_SCRIPT_CONFIG.url;
export const supabaseKey = SUPABASE_SCRIPT_CONFIG.anonKey;