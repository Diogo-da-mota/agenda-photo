
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
 * Check if a user already exists in database by email or phone
 * @param email Email to check
 * @param phone Phone to check
 * @returns Existing record or null if not found
 */
export const checkExistingUser = async (email: string, phone: string): Promise<MensagemDeContato | null> => {
  if (!email && !phone) return null;
  
  try {
    // Primeiro busca por email se disponível
    if (email) {
      const { data: emailMatch, error: emailError } = await supabase
        .from('mensagens_de_contato')
        .select('*')
        .eq('e_mail', email)
        .maybeSingle();
      
      if (emailError) {
        console.error('Error checking existing user by email:', emailError);
      } else if (emailMatch) {
        console.log('Found existing user by email:', emailMatch);
        return emailMatch;
      }
    }
    
    // Se não encontrou por email, busca por telefone se disponível
    if (phone) {
      const { data: phoneMatch, error: phoneError } = await supabase
        .from('mensagens_de_contato')
        .select('*')
        .eq('telefone', phone)
        .maybeSingle();
      
      if (phoneError) {
        console.error('Error checking existing user by phone:', phoneError);
      } else if (phoneMatch) {
        console.log('Found existing user by phone:', phoneMatch);
        return phoneMatch;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking existing user:', error);
    return null;
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
  finalContactInfo: any
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
    // Extrair informações de contato consolidadas
    const nome = contactInfo.nome || contactInfo.name || "";
    const email = finalContactInfo?.email || contactInfo.e_mail || contactInfo.email || "";
    const telefone = finalContactInfo?.phone || contactInfo.telefone || contactInfo.phone || "";
    const valorSugerido = finalContactInfo?.sugestedValue || "";
    
    // Verificar se o usuário já existe no banco de dados
    const existingUser = await checkExistingUser(email, telefone);
    
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
    
    // Anexando valor sugerido à mensagem se existir
    const fullMessage = valorSugerido 
      ? `${surveyMessage}\n\nValor sugerido: ${valorSugerido}`
      : surveyMessage;

    if (existingUser) {
      console.log("Usuário existente encontrado, atualizando registro:", existingUser.id);
      
      // Combinar mensagem antiga com a nova
      const combinedMessage = existingUser.mensagem 
        ? `${existingUser.mensagem}\n\n--- Nova resposta (${new Date().toLocaleDateString()}) ---\n${fullMessage}`
        : fullMessage;
      
      // Atualizar registro existente
      const { data, error } = await supabase
        .from('mensagens_de_contato')
        .update({
          mensagem: combinedMessage,
          // Atualizar outros campos apenas se estiverem vazios no registro existente
          nome: existingUser.nome || nome,
          e_mail: existingUser.e_mail || email,
          telefone: existingUser.telefone || telefone
        })
        .eq('id', existingUser.id)
        .select();

      if (error) {
        console.error("Erro ao atualizar dados para Supabase:", error);
        return false;
      }
      
      console.log("Dados atualizados com sucesso para Supabase:", data);
      return true;
    } else {
      console.log("Criando novo registro para o usuário");
      
      // Create data for Supabase - strictly match column names para mensagens_de_contato
      const contactData = {
        nome: nome,
        e_mail: email,
        telefone: telefone,
        mensagem: fullMessage,
        // Note: criado_em is automatically set by DEFAULT now()
      };

      console.log("Enviando dados para o Supabase:", contactData);

      // Usando a tabela mensagens_de_contato
      const { data, error } = await supabase
        .from('mensagens_de_contato')
        .insert(contactData)
        .select();

      if (error) {
        console.error("Erro ao enviar dados para Supabase:", error);
        return false;
      }
      
      console.log("Dados enviados com sucesso para Supabase:", data);
      return true;
    }
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
    const nome = formData.nome;
    const email = formData.e_mail || formData.email || "";
    const telefone = formData.telefone || formData.phone || "";
    const mensagem = formData.mensagem || formData.message || "";
    
    // Verificar se o usuário já existe no banco de dados
    const existingUser = await checkExistingUser(email, telefone);
    
    if (existingUser) {
      console.log("Usuário existente encontrado, atualizando registro:", existingUser.id);
      
      // Combinar mensagem antiga com a nova
      const combinedMessage = existingUser.mensagem 
        ? `${existingUser.mensagem}\n\n--- Nova mensagem (${new Date().toLocaleDateString()}) ---\n${mensagem}`
        : mensagem;
      
      // Atualizar registro existente
      const { data, error } = await supabase
        .from('mensagens_de_contato')
        .update({
          mensagem: combinedMessage,
          // Atualizar outros campos apenas se estiverem vazios no registro existente
          nome: existingUser.nome || nome,
          e_mail: existingUser.e_mail || email,
          telefone: existingUser.telefone || telefone
        })
        .eq('id', existingUser.id)
        .select();

      if (error) {
        console.error("Erro ao atualizar dados para Supabase:", error);
        return false;
      }
      
      console.log("Dados atualizados com sucesso para Supabase:", data);
      return true;
    } else {
      console.log("Criando novo registro para o usuário");
      
      // Map form data to match the table column names exactly
      const contactData = {
        nome: nome,
        e_mail: email,
        telefone: telefone,
        mensagem: mensagem,
        // criado_em is set automatically by Supabase
      };

      console.log("Enviando dados para o Supabase:", contactData);

      // Insert into mensagens_de_contato table
      const { data, error } = await supabase
        .from('mensagens_de_contato')
        .insert(contactData)
        .select();

      if (error) {
        console.error("Erro ao enviar dados para Supabase:", error);
        return false;
      }
      
      console.log("Dados enviados com sucesso para Supabase:", data);
      return true;
    }
  } catch (error) {
    console.error("Exceção ao enviar dados para Supabase:", error);
    return false;
  }
};
