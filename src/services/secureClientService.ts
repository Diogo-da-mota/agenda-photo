import { supabase } from "@/lib/supabase";
import { Cliente, ClienteFormData } from "@/types/clients";
import { executeSecureSelect, secureSearch } from "@/utils/secureQuery";
import { sanitizeObject } from "@/utils/securityUtils";

// Sanitizar dados antes de enviar
const sanitizeClientData = (data: ClienteFormData): ClienteFormData => {
  const sanitized = sanitizeObject(data);
  
  return {
    nome: sanitized.nome?.trim().substring(0, 100) || '',
    telefone: sanitized.telefone?.trim().substring(0, 20) || null,
    data_nascimento: sanitized.data_nascimento || null,
    evento: sanitized.evento?.trim().substring(0, 100) || null,
    data_evento: sanitized.data_evento || null,
    valor_evento: sanitized.valor_evento ? Number(sanitized.valor_evento) : null
  };
};

// Validar dados antes de processar
const validateClientData = (data: ClienteFormData): void => {
  if (!data.nome || data.nome.trim().length === 0) {
    throw new Error('Nome é obrigatório');
  }
  
  if (data.telefone && !/^[\d\s\(\)\-\+]+$/.test(data.telefone)) {
    throw new Error('Telefone contém caracteres inválidos');
  }
};

// Obter todos os clientes com segurança usando consultas seguras
export const getClientesSecure = async (): Promise<Cliente[]> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Usar consulta segura em vez de query builder direto
    const result = await executeSecureSelect<Cliente>('clientes', '*', {
      user_id: user.id
    });

    if (result.error) {
      throw result.error;
    }

    return result.data?.map(cliente => ({
      ...cliente,
      telefone: cliente.telefone || null
    })) || [];

  } catch (error) {
    console.error('Erro ao processar busca de clientes:', error);
    throw error;
  }
};

// Buscar clientes com termo de pesquisa seguro
export const searchClientesSecure = async (searchTerm: string): Promise<Cliente[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Usar busca segura que escapa caracteres especiais
    const result = await secureSearch<Cliente>('clientes', 'nome', searchTerm);

    if (result.error) {
      throw result.error;
    }

    // Filtrar apenas clientes do usuário autenticado
    return result.data?.filter(cliente => cliente.user_id === user.id) || [];

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};

// Criar cliente com validações de segurança
export const createClienteSecure = async (clienteData: ClienteFormData): Promise<Cliente> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Validar e sanitizar dados
    validateClientData(clienteData);
    const sanitizedData = sanitizeClientData(clienteData);

    // Adicionar user_id e criar cliente
    const clienteWithUserId = {
      ...sanitizedData,
      user_id: user.id
    };
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([clienteWithUserId])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }

    return data as Cliente;

  } catch (error) {
    console.error('Erro ao processar criação de cliente:', error);
    throw error;
  }
};

// Atualizar cliente com segurança
export const updateClienteSecure = async (id: string, clienteData: Partial<ClienteFormData>): Promise<Cliente> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Validar ID
    if (!id || typeof id !== 'string') {
      throw new Error('ID do cliente inválido');
    }

    // Sanitizar dados de atualização
    const sanitizedData = sanitizeClientData(clienteData as ClienteFormData);
    
    const { data, error } = await supabase
      .from('clientes')
      .update(sanitizedData)
      .eq('id', id)
      .eq('user_id', user.id) // Garantir que só atualiza seus próprios clientes
      .select()
      .single();

    if (error) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
      throw error;
    }

    return data as Cliente;

  } catch (error) {
    console.error(`Erro ao processar atualização de cliente com ID ${id}:`, error);
    throw error;
  }
};

// Excluir cliente com segurança
export const deleteClienteSecure = async (id: string): Promise<void> => {
  try {
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Validar ID
    if (!id || typeof id !== 'string') {
      throw new Error('ID do cliente inválido');
    }

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Garantir que só exclui seus próprios clientes

    if (error) {
      console.error(`Erro ao excluir cliente com ID ${id}:`, error);
      throw error;
    }

  } catch (error) {
    console.error(`Erro ao processar exclusão de cliente com ID ${id}:`, error);
    throw error;
  }
};
