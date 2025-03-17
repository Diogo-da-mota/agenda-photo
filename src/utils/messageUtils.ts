import { supabase } from "@/integrations/supabase/client";
import { ContactMessage, MensagemDeContato, StandardizedMessage } from "@/types/messages";

/**
 * Fetch messages from all available tables
 * @returns Object with messages and tableExists flag
 */
export const fetchAllMessagesFromTables = async (): Promise<{ messages: StandardizedMessage[], tableExists: boolean }> => {
  console.log('Fetching messages from all tables...');
  
  try {
    // Check if tables exist
    const mensagensDeContatoExists = await checkTableExists('mensagens_de_contato');
    const contactMessagesExists = await checkTableExists('contact_messages');
    
    const tableExists = mensagensDeContatoExists || contactMessagesExists;
    let allMessages: StandardizedMessage[] = [];
    
    // Priorizar mensagens_de_contato se existir
    if (mensagensDeContatoExists) {
      const { data: mensagensDeContato, error: mensagensError } = await supabase
        .from('mensagens_de_contato')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (mensagensError) {
        console.error('Error fetching mensagens_de_contato:', mensagensError);
      } else if (mensagensDeContato) {
        // Map to standardized format
        const standardizedMensagens = mensagensDeContato.map((msg: MensagemDeContato) => ({
          id: msg.id,
          created_at: msg.criado_em,
          name: msg.nome,
          email: msg.e_mail,
          phone: msg.telefone,
          message: msg.mensagem,
          original_table: 'mensagens_de_contato'
        }));
        
        // Remove duplicate entries - keep only the latest entry for each user (by email or phone)
        const uniqueMessages: {[key: string]: StandardizedMessage} = {};
        
        standardizedMensagens.forEach(msg => {
          const userKey = msg.email || msg.phone || msg.id;
          
          // If we don't have this user yet OR this message is newer than what we have
          if (!uniqueMessages[userKey] || new Date(msg.created_at) > new Date(uniqueMessages[userKey].created_at)) {
            uniqueMessages[userKey] = msg;
          }
        });
        
        allMessages = [...allMessages, ...Object.values(uniqueMessages)];
      }
    }
    
    // Busca messages from contact_messages if it exists (for compatibility)
    if (contactMessagesExists) {
      // Using any type here to bypass type checking since contact_messages is not in the types
      const { data: contactMessages, error: contactError } = await (supabase as any)
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contactError) {
        console.error('Error fetching contact_messages:', contactError);
      } else if (contactMessages) {
        // Map to standardized format
        const standardizedContactMessages = contactMessages.map((msg: ContactMessage) => ({
          ...msg,
          original_table: 'contact_messages'
        }));
        
        // Deduplicate based on email/phone, merging with messages we already have
        const existingKeys = new Set(allMessages.map(msg => msg.email || msg.phone || msg.id));
        
        const newUniqueMessages = standardizedContactMessages.filter(msg => {
          const userKey = msg.email || msg.phone || msg.id;
          return !existingKeys.has(userKey);
        });
        
        allMessages = [...allMessages, ...newUniqueMessages];
      }
    }
    
    // Final sort to ensure newest messages are first
    allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return { messages: allMessages, tableExists };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { messages: [], tableExists: false };
  }
};

/**
 * Check if a table exists in Supabase
 * @param tableName Name of the table to check
 * @returns Boolean indicating if the table exists
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Checking if table '${tableName}' exists...`);
    
    if (tableName === 'mensagens_de_contato') {
      const { data, error } = await supabase
        .from('mensagens_de_contato')
        .select('*')
        .limit(1);
        
      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        return false;
      }
      return !error;
    } 
    else if (tableName === 'contact_messages') {
      // Using any type here to bypass type checking since contact_messages is not in the types
      const { data, error } = await (supabase as any)
        .from('contact_messages')
        .select('*')
        .limit(1);
        
      if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
        return false;
      }
      return !error;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
};

/**
 * Submit survey data to Supabase
 * @param contactInfo Basic contact information
 * @param responses Survey question responses
 * @param followUpResponses Follow-up responses
 * @param finalContactInfo Additional contact information
 * @returns Boolean indicating success of data submission
 */
export const submitSurveyData = async (
  contactInfo: any,
  responses: {[key: number]: string[]},
  followUpResponses: {[key: number]: {[key: string]: string}},
  finalContactInfo: string
): Promise<boolean> => {
  console.log('Submitting survey data to Supabase...');
  console.log('Contact info:', contactInfo);
  console.log('Responses:', responses);
  console.log('Follow-up responses:', followUpResponses);
  console.log('Final contact info:', finalContactInfo);
  
  if (!contactInfo) {
    console.error('No contact info provided for survey submission');
    return false;
  }
  
  try {
    // Convert survey responses to a string message
    const surveyMessage = Object.entries(responses).map(([questionIndex, answers]) => {
      const questionNum = parseInt(questionIndex);
      const questionText = `Pergunta ${questionNum + 1}`;
      let answerText = answers.join(", ");
      
      // Add follow-up responses if they exist
      if (followUpResponses[questionNum]) {
        const followUpData = followUpResponses[questionNum];
        const followUpText = Object.entries(followUpData)
          .map(([label, value]) => `${label}: ${value}`)
          .join("; ");
        answerText += ` [Detalhes adicionais: ${followUpText}]`;
      }
      
      return `${questionText}: ${answerText}`;
    }).join("\n\n");

    // Email for lookup
    const userEmail = finalContactInfo || contactInfo.email || "sem-email@exemplo.com";
    
    // Verificar se usuário já existe
    const { data: existingUsers, error: searchError } = await supabase
      .from('mensagens_de_contato')
      .select('*')
      .or(`e_mail.eq.${userEmail},telefone.eq.${contactInfo.telefone || ""}`);
      
    if (searchError) {
      console.error("Erro ao buscar usuário existente:", searchError);
    }
    
    let result;
    
    if (existingUsers && existingUsers.length > 0) {
      // Atualizar registro existente
      console.log("Usuário já existe, atualizando registro:", existingUsers[0]);
      const existingMessage = existingUsers[0].mensagem || "";
      
      result = await supabase
        .from('mensagens_de_contato')
        .update({
          mensagem: `${existingMessage}\n\n--- ATUALIZAÇÃO DO QUESTIONÁRIO ---\n\n${surveyMessage}`,
          e_mail: userEmail // Atualizar o email caso tenha mudado
        })
        .eq('id', existingUsers[0].id)
        .select();
    } else {
      // Create data for Supabase - strictly match column names para mensagens_de_contato
      const contactData = {
        nome: contactInfo.nome,
        e_mail: userEmail,
        telefone: contactInfo.telefone || contactInfo.phone || "",
        mensagem: surveyMessage,
        // Note: criado_em is automatically set by DEFAULT now()
      };

      console.log("Enviando dados para o Supabase:", contactData);

      // Usando a tabela mensagens_de_contato
      result = await supabase
        .from('mensagens_de_contato')
        .insert(contactData)
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error("Erro ao enviar dados para Supabase:", error);
      return false;
    }
    
    console.log("Dados enviados com sucesso para Supabase:", data);
    return true;
  } catch (error) {
    console.error("Exceção ao enviar dados para Supabase:", error);
    return false;
  }
};

/**
 * Submit a simple contact form to Supabase
 * @param formData Form data with name, email, phone, and message
 * @returns Boolean indicating success of data submission
 */
export const submitContactForm = async (formData: {
  nome: string;
  email?: string;
  e_mail?: string;
  telefone?: string;
  phone?: string;
  mensagem?: string;
  message?: string;
}): Promise<boolean> => {
  console.log('Submitting contact form to Supabase...');
  console.log('Form data:', formData);
  
  try {
    // Map form data to match the table column names exactly
    const contactData = {
      nome: formData.nome,
      e_mail: formData.e_mail || formData.email || "",
      telefone: formData.telefone || formData.phone || "",
      mensagem: formData.mensagem || formData.message || "",
      // criado_em is set automatically by Supabase
    };

    console.log("Enviando dados para o Supabase:", contactData);

    // Check if user already exists
    const { data: existingUsers, error: searchError } = await supabase
      .from('mensagens_de_contato')
      .select('*')
      .or(`e_mail.eq.${contactData.e_mail},telefone.eq.${contactData.telefone}`);
      
    if (searchError) {
      console.error("Erro ao buscar usuário existente:", searchError);
    }
    
    let result;
    
    if (existingUsers && existingUsers.length > 0) {
      // Atualizar registro existente
      console.log("Usuário já existe, atualizando registro:", existingUsers[0]);
      const existingMessage = existingUsers[0].mensagem || "";
      
      result = await supabase
        .from('mensagens_de_contato')
        .update({
          mensagem: `${existingMessage}\n\n--- NOVA MENSAGEM ---\n\n${contactData.mensagem}`,
          e_mail: contactData.e_mail // Atualizar o email caso tenha mudado
        })
        .eq('id', existingUsers[0].id)
        .select();
    } else {
      // Insert into mensagens_de_contato table
      result = await supabase
        .from('mensagens_de_contato')
        .insert(contactData)
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error("Erro ao enviar dados para Supabase:", error);
      return false;
    }
    
    console.log("Dados enviados com sucesso para Supabase:", data);
    return true;
  } catch (error) {
    console.error("Exceção ao enviar dados para Supabase:", error);
    return false;
  }
};
