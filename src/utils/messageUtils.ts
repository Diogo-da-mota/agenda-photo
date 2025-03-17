
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
      // Fetch with a large page size to get all messages
      const { data: mensagensDeContato, error: mensagensError } = await supabase
        .from('mensagens_de_contato')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(1000); // Set a higher limit to ensure we get all messages
      
      if (mensagensError) {
        console.error('Error fetching mensagens_de_contato:', mensagensError);
      } else if (mensagensDeContato) {
        console.log(`Retrieved ${mensagensDeContato.length} messages from mensagens_de_contato`);
        
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
        
        // Add all messages - we'll deduplicate later if needed
        allMessages = [...allMessages, ...standardizedMensagens];
      }
    }
    
    // Busca messages from contact_messages if it exists (for compatibility)
    if (contactMessagesExists) {
      // Using any type here to bypass type checking since contact_messages is not in the types
      const { data: contactMessages, error: contactError } = await (supabase as any)
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Set a higher limit
      
      if (contactError) {
        console.error('Error fetching contact_messages:', contactError);
      } else if (contactMessages) {
        console.log(`Retrieved ${contactMessages.length} messages from contact_messages`);
        
        // Map to standardized format
        const standardizedContactMessages = contactMessages.map((msg: ContactMessage) => ({
          ...msg,
          original_table: 'contact_messages'
        }));
        
        // Add all messages
        allMessages = [...allMessages, ...standardizedContactMessages];
      }
    }
    
    // If we retrieved messages but need to deduplicate
    if (allMessages.length > 0) {
      console.log(`Retrieved a total of ${allMessages.length} messages before deduplication`);
      
      // Optional deduplication - only if we have messages from multiple tables
      if (mensagensDeContatoExists && contactMessagesExists) {
        const uniqueMessages: {[key: string]: StandardizedMessage} = {};
        
        allMessages.forEach(msg => {
          // Use ID as primary key since it's guaranteed unique within a table
          // Only use email/phone as fallback if we're comparing across tables
          const userKey = msg.id;
          
          if (!uniqueMessages[userKey]) {
            uniqueMessages[userKey] = msg;
          }
        });
        
        allMessages = Object.values(uniqueMessages);
        console.log(`After deduplication: ${allMessages.length} unique messages`);
      }
      
      // Final sort to ensure newest messages are first
      allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      console.log('No messages retrieved from any table');
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

/**
 * Delete a message from Supabase
 * @param id ID of the message to delete
 * @returns Boolean indicating success of deletion
 */
export const deleteMessage = async (id: string): Promise<boolean> => {
  console.log('Deleting message with ID:', id);
  
  try {
    // First, try to delete from mensagens_de_contato
    let { error } = await supabase
      .from('mensagens_de_contato')
      .delete()
      .eq('id', id);
    
    if (!error) {
      console.log('Message deleted successfully from mensagens_de_contato');
      return true;
    }
    
    // If that fails, try to delete from contact_messages (for backward compatibility)
    if (error) {
      console.log('Message not found in mensagens_de_contato, trying contact_messages...');
      
      // Using any type here to bypass type checking since contact_messages is not in the types
      const result = await (supabase as any)
        .from('contact_messages')
        .delete()
        .eq('id', id);
      
      if (result.error) {
        console.error('Error deleting message from contact_messages:', result.error);
        return false;
      }
      
      console.log('Message deleted successfully from contact_messages');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

/**
 * Update a message in Supabase
 * @param id ID of the message to update
 * @param data Data to update
 * @returns Object with success flag and updated message
 */
export const updateMessage = async (
  id: string, 
  data: Partial<StandardizedMessage>
): Promise<{success: boolean, updatedMessage: StandardizedMessage | null}> => {
  console.log('Updating message with ID:', id, 'Data:', data);
  
  try {
    // First, determine which table contains this message
    // Try to get the message from mensagens_de_contato
    const { data: existingMessages, error: fetchError } = await supabase
      .from('mensagens_de_contato')
      .select('*')
      .eq('id', id);
      
    if (fetchError) {
      console.error('Error fetching message:', fetchError);
      return { success: false, updatedMessage: null };
    }
    
    if (existingMessages && existingMessages.length > 0) {
      // Message exists in mensagens_de_contato, update it
      const updateData = {
        nome: data.name,
        e_mail: data.email,
        telefone: data.phone || '',
        mensagem: data.message
      };
      
      const { data: updatedData, error: updateError } = await supabase
        .from('mensagens_de_contato')
        .update(updateData)
        .eq('id', id)
        .select();
        
      if (updateError) {
        console.error('Error updating message in mensagens_de_contato:', updateError);
        return { success: false, updatedMessage: null };
      }
      
      if (updatedData && updatedData.length > 0) {
        console.log('Message updated successfully in mensagens_de_contato');
        
        // Map updated data to standardized format
        const updatedMessage: StandardizedMessage = {
          id: updatedData[0].id,
          created_at: updatedData[0].criado_em,
          name: updatedData[0].nome,
          email: updatedData[0].e_mail,
          phone: updatedData[0].telefone,
          message: updatedData[0].mensagem,
          original_table: 'mensagens_de_contato'
        };
        
        return { success: true, updatedMessage };
      }
    } else {
      // Try to get the message from contact_messages (for backward compatibility)
      // Using any type here to bypass type checking since contact_messages is not in the types
      const { data: existingContactMessages, error: fetchContactError } = await (supabase as any)
        .from('contact_messages')
        .select('*')
        .eq('id', id);
        
      if (fetchContactError) {
        console.error('Error fetching message from contact_messages:', fetchContactError);
        return { success: false, updatedMessage: null };
      }
      
      if (existingContactMessages && existingContactMessages.length > 0) {
        // Message exists in contact_messages, update it
        const updateData = {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message
        };
        
        const result = await (supabase as any)
          .from('contact_messages')
          .update(updateData)
          .eq('id', id)
          .select();
          
        if (result.error) {
          console.error('Error updating message in contact_messages:', result.error);
          return { success: false, updatedMessage: null };
        }
        
        if (result.data && result.data.length > 0) {
          console.log('Message updated successfully in contact_messages');
          
          // Map updated data to standardized format
          const updatedMessage: StandardizedMessage = {
            id: result.data[0].id,
            created_at: result.data[0].created_at,
            name: result.data[0].name,
            email: result.data[0].email,
            phone: result.data[0].phone,
            message: result.data[0].message,
            original_table: 'contact_messages'
          };
          
          return { success: true, updatedMessage };
        }
      }
    }
    
    console.error('Message not found in any table');
    return { success: false, updatedMessage: null };
  } catch (error) {
    console.error('Error updating message:', error);
    return { success: false, updatedMessage: null };
  }
};
