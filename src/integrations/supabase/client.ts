
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sykjzikcaclutfpuwuri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5a2p6aWtjYWNsdXRmcHV3dXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODAxMTAsImV4cCI6MjA1NzA1NjExMH0.nmOHa9Bcmo7V_kIIqxgJ4ButiX2ybAyhg2U_RWDU0ng";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Função simplificada para verificar se a tabela existe
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Verificando se a tabela ${tableName} existe...`);
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error) {
      console.log(`Erro ao verificar tabela ${tableName}:`, error);
      return false;
    }
    
    console.log(`Tabela ${tableName} encontrada!`);
    return true;
  } catch (e) {
    console.error(`Exceção ao verificar tabela ${tableName}:`, e);
    return false;
  }
};
