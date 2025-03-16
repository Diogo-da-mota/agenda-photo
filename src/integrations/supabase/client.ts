
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sykjzikcaclutfpuwuri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5a2p6aWtjYWNsdXRmcHV3dXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODAxMTAsImV4cCI6MjA1NzA1NjExMH0.nmOHa9Bcmo7V_kIIqxgJ4ButiX2ybAyhg2U_RWDU0ng";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Função para criar a tabela diretamente, sem depender do RPC
const createTableDirectly = async () => {
  try {
    console.log('Tentando criar a tabela mensagem_agenda diretamente...');
    
    const { error } = await supabase.from('mensagem_agenda')
      .insert({ 
        name: 'Test User', 
        email: 'test@example.com', 
        message: 'This is a test message to create the table' 
      })
      .select();
    
    if (error && error.code !== '23505') { // Ignorar erro de chave duplicada
      console.log('Erro ao criar tabela diretamente:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exceção ao criar tabela diretamente:', e);
    return false;
  }
};

// Helper function to check if tables exist and create them if they don't
export const initializeDatabase = async () => {
  console.log('Verificando tabelas do banco de dados...');
  
  try {
    // Check if table exists first
    console.log('Verificando se a tabela mensagem_agenda existe...');
    const { error: checkError } = await supabase
      .from('mensagem_agenda')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('Tabela mensagem_agenda já existe');
      return true;
    }
    
    // Try SQL function approach first
    console.log('Tabela não encontrada, tentando criar via RPC...');
    const { error: createTableError } = await supabase.rpc(
      'create_mensagem_agenda_table',
      {}
    );
    
    if (createTableError) {
      console.error('Erro ao criar tabela mensagem_agenda via RPC:', createTableError);
      console.log('Tentando abordagem alternativa...');
      
      // Try direct table creation approach
      const created = await createTableDirectly();
      if (created) {
        console.log('Tabela criada com sucesso através do método alternativo');
        return true;
      }
    } else {
      console.log('Chamada RPC para criar tabela concluída sem erros');
    }
    
    // Final verification
    console.log('Verificando novamente se a tabela mensagem_agenda existe...');
    const { error: finalCheckError } = await supabase
      .from('mensagem_agenda')
      .select('id')
      .limit(1);
    
    if (!finalCheckError) {
      console.log('Tabela mensagem_agenda verificada e existe');
      return true;
    } else {
      console.error('Tabela ainda não existe após tentativas de criação:', finalCheckError);
      return false;
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
};
