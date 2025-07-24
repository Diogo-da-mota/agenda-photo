
// ARQUIVO DEPRECIADO 
// Este arquivo é mantido apenas para compatibilidade com códigos existentes
// Por favor, importe o cliente Supabase diretamente de '@/lib/supabase'

import { supabase } from '@/lib/supabase';

// Re-exportação do cliente para compatibilidade com código existente
export default supabase;
export const supabaseTyped = supabase;

// Aviso de arquivo depreciado
console.warn('[DEPRECIADO] src/utils/supabase-client.ts está depreciado. Use @/lib/supabase diretamente.');
