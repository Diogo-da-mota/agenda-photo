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
        
        allMessages = [...allMessages, ...standardizedMensagens];
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
        
        allMessages = [...allMessages, ...standardizedContactMessages];
      }
    }
    
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
 * Check if a user already exists by email or phone
 * @param email User's email
 * @param phone User's phone
 * @returns Object with exists flag and the existing message if found
 */
export const checkExistingUser = async (
  email?: string,
  phone?: string
): Promise<{ exists: boolean, message?: MensagemDeContato }> => {
  if (!email && !phone) {
    return { exists: false };
  }

  try {
    console.log('Verificando se o usuário já existe por e-mail ou telefone...');
    
    let query = supabase.from('mensagens_de_contato').select('*');
    
    if (email) {
      query = query.eq('e_mail', email);
    } else if (phone) {
      query = query.eq('telefone', phone);
    }
    
    const { data, error } = await query.limit(1);
    
    if (error) {
      console.error('Erro ao verificar usuário existente:', error);
      return { exists: false };
    }
    
    if (data && data.length > 0) {
      console.log('Usuário existente encontrado:', data[0]);
      return { exists: true, message: data[0] as MensagemDeContato };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Exceção ao verificar usuário existente:', error);
    return { exists: false };
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

    // Create data for Supabase
    const contactData = {
      nome: contactInfo.nome,
      e_mail: finalContactInfo || contactInfo.email || contactInfo.e_mail || "sem-email@exemplo.com",
      telefone: contactInfo.telefone || contactInfo.phone || "",
      mensagem: surveyMessage,
      // Note: criado_em is automatically set by DEFAULT now()
    };

    console.log("Enviando dados para o Supabase:", contactData);

    // Check if user already exists by email or phone
    const { exists, message: existingMessage } = await checkExistingUser(
      contactData.e_mail,
      contactData.telefone
    );

    let result;
    
    if (exists && existingMessage) {
      // Update existing record with combined messages
      const updatedMessage = existingMessage.mensagem 
        ? `${existingMessage.mensagem}\n\n--- NOVA SUBMISSÃO ---\n\n${contactData.mensagem}`
        : contactData.mensagem;
        
      result = await supabase
        .from('mensagens_de_contato')
        .update({ 
          mensagem: updatedMessage,
          // Update timestamp
          criado_em: new Date().toISOString()
        })
        .eq('id', existingMessage.id)
        .select();
        
      console.log("Registro existente atualizado:", result);
    } else {
      // Insert new record
      result = await supabase
        .from('mensagens_de_contato')
        .insert(contactData)
        .select();
        
      console.log("Novo registro criado:", result);
    }

    if (result.error) {
      console.error("Erro ao enviar dados para Supabase:", result.error);
      return false;
    }
    
    console.log("Dados enviados com sucesso para Supabase:", result.data);
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

    // Check if user already exists by email or phone
    const { exists, message: existingMessage } = await checkExistingUser(
      contactData.e_mail,
      contactData.telefone
    );

    let result;
    
    if (exists && existingMessage) {
      // Update existing record with combined messages
      const updatedMessage = existingMessage.mensagem 
        ? `${existingMessage.mensagem}\n\n--- NOVA SUBMISSÃO ---\n\n${contactData.mensagem}`
        : contactData.mensagem;
        
      result = await supabase
        .from('mensagens_de_contato')
        .update({ 
          mensagem: updatedMessage,
          // Update timestamp
          criado_em: new Date().toISOString()
        })
        .eq('id', existingMessage.id);
        
      console.log("Registro existente atualizado:", result);
    } else {
      // Insert new record
      result = await supabase
        .from('mensagens_de_contato')
        .insert(contactData);
        
      console.log("Novo registro criado:", result);
    }

    if (result.error) {
      console.error("Erro ao enviar dados para Supabase:", result.error);
      return false;
    }
    
    console.log("Dados enviados com sucesso para Supabase:", result.data);
    return true;
  } catch (error) {
    console.error("Exceção ao enviar dados para Supabase:", error);
    return false;
  }
};
