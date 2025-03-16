
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sykjzikcaclutfpuwuri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5a2p6aWtjYWNsdXRmcHV3dXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODAxMTAsImV4cCI6MjA1NzA1NjExMH0.nmOHa9Bcmo7V_kIIqxgJ4ButiX2ybAyhg2U_RWDU0ng";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Função para CRIAR a tabela contact_messages diretamente via SQL
export const createContactMessagesTable = async (): Promise<boolean> => {
  try {
    console.log('Tentando criar a tabela contact_messages diretamente...');
    
    // Executar SQL diretamente para criar a tabela
    const { data, error } = await supabase.rpc('create_contact_messages_table');
    
    if (error) {
      console.error('Erro ao criar tabela contact_messages:', error);
      return false;
    }
    
    console.log('Tabela contact_messages criada com sucesso:', data);
    return true;
  } catch (e) {
    console.error('Exceção ao criar tabela contact_messages:', e);
    return false;
  }
};

// Função para VERIFICAR se a tabela contact_messages existe
export const checkContactMessagesExists = async (): Promise<boolean> => {
  try {
    console.log('Verificando se a tabela contact_messages existe...');
    const { data, error } = await supabase
      .from('contact_messages')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Erro ao verificar tabela contact_messages:', error);
      return false;
    }
    
    console.log('Tabela contact_messages encontrada!');
    return true;
  } catch (e) {
    console.error('Exceção ao verificar tabela contact_messages:', e);
    return false;
  }
};

// Função que tenta criar a tabela se ela não existir
export const ensureContactMessagesTable = async (): Promise<boolean> => {
  try {
    console.log('Verificando e criando tabela contact_messages se necessário...');
    
    // Primeiro verificamos se a tabela existe
    const tableExists = await checkContactMessagesExists();
    
    if (tableExists) {
      console.log('Tabela contact_messages já existe!');
      return true;
    }
    
    // Se não existir, tentamos criar
    console.log('Tabela contact_messages não existe, tentando criar...');
    return await createContactMessagesTable();
  } catch (e) {
    console.error('Erro ao garantir que a tabela contact_messages existe:', e);
    return false;
  }
};

// Função para verificar se a tabela mensagem_agenda existe
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
export const checkTableExists = async (tableName: 'mensagem_agenda' | 'contact_messages'): Promise<boolean> => {
  try {
    console.log(`Verificando se a tabela ${tableName} existe...`);
    
    if (tableName === 'mensagem_agenda') {
      return await checkMensagemAgendaExists();
    } else if (tableName === 'contact_messages') {
      return await checkContactMessagesExists();
    }
    
    // Adicione mais casos aqui se precisar verificar outras tabelas
    return false;
  } catch (e) {
    console.error(`Exceção ao verificar tabela ${tableName}:`, e);
    return false;
  }
};
