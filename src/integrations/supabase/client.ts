
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sykjzikcaclutfpuwuri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5a2p6aWtjYWNsdXRmcHV3dXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODAxMTAsImV4cCI6MjA1NzA1NjExMH0.nmOHa9Bcmo7V_kIIqxgJ4ButiX2ybAyhg2U_RWDU0ng";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Verifica se a tabela mensagem_agenda existe
export const checkMensagemAgendaExists = async (): Promise<boolean> => {
  try {
    console.log('Verificando se a tabela mensagem_agenda existe...');
    const { data, error } = await supabase
      .from('mensagem_agenda')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Erro ao verificar tabela mensagem_agenda:', error);
      return false;
    }
    
    console.log('Tabela mensagem_agenda encontrada!');
    return true;
  } catch (e) {
    console.error('Exceção ao verificar tabela mensagem_agenda:', e);
    return false;
  }
};

// Função genérica para verificar tabelas com verificação de tipos
export const checkTableExists = async (tableName: 'mensagem_agenda'): Promise<boolean> => {
  try {
    console.log(`Verificando se a tabela ${tableName} existe...`);
    
    if (tableName === 'mensagem_agenda') {
      return await checkMensagemAgendaExists();
    }
    
    // Adicione mais casos aqui se precisar verificar outras tabelas
    return false;
  } catch (e) {
    console.error(`Exceção ao verificar tabela ${tableName}:`, e);
    return false;
  }
};
