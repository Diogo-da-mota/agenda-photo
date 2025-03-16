
import { supabase, checkTableExists } from "@/integrations/supabase/client";
import { ContactMessage, MensagemDeContato, StandardizedMessage } from "@/types/messages";

/**
 * Fetches messages from all available message tables
 * @returns Array of standardized messages from all tables
 */
export const fetchAllMessagesFromTables = async (): Promise<{
  messages: StandardizedMessage[];
  tableExists: boolean;
}> => {
  let allMessages: StandardizedMessage[] = [];
  let contactMessagesExists = false;
  let mensagensDeContatoExists = false;

  // Check which tables exist
  contactMessagesExists = await checkTableExists('contact_messages');
  mensagensDeContatoExists = await checkTableExists('mensagens_de_contato');
  
  console.log('Tables status:', { contactMessagesExists, mensagensDeContatoExists });
  
  // If no tables exist, return empty array
  if (!contactMessagesExists && !mensagensDeContatoExists) {
    return { messages: [], tableExists: false };
  }
  
  // Fetch from contact_messages if it exists
  if (contactMessagesExists) {
    console.log('Fetching from contact_messages...');
    const { data: contactData, error: contactError } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (contactError) {
      console.error('Error fetching from contact_messages:', contactError);
    } else if (contactData) {
      console.log(`Received ${contactData.length} messages from contact_messages`);
      // Map directly as they already match StandardizedMessage format
      const standardizedContactMessages = contactData.map(msg => ({
        ...msg,
        original_table: 'contact_messages'
      } as StandardizedMessage));
      
      allMessages = [...allMessages, ...standardizedContactMessages];
    }
  }
  
  // Fetch from mensagens_de_contato if it exists
  if (mensagensDeContatoExists) {
    console.log('Fetching from mensagens_de_contato...');
    const { data: mensagensData, error: mensagensError } = await supabase
      .from('mensagens_de_contato')
      .select('*')
      .order('criado_em', { ascending: false });
      
    if (mensagensError) {
      console.error('Error fetching from mensagens_de_contato:', mensagensError);
    } else if (mensagensData) {
      console.log(`Received ${mensagensData.length} messages from mensagens_de_contato`);
      
      // Map the mensagens_de_contato fields to match StandardizedMessage format
      const standardizedMensagens = mensagensData.map(msg => ({
        id: msg.id,
        created_at: msg.criado_em,
        name: msg.nome,
        email: msg.e_mail,
        phone: msg.telefone,
        message: msg.mensagem,
        original_table: 'mensagens_de_contato'
      } as StandardizedMessage));
      
      allMessages = [...allMessages, ...standardizedMensagens];
    }
  }
  
  // Sort all messages by date (newest first)
  allMessages.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  console.log('All messages sorted:', allMessages);
  return { 
    messages: allMessages, 
    tableExists: (contactMessagesExists || mensagensDeContatoExists) 
  };
};
