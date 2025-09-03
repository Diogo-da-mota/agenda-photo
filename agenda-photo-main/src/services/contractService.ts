import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { registrarContratoCriado } from './atividadeService';

// Reutilizando o cliente Supabase principal para evitar múltiplas instâncias
// const publicSupabase = supabase; // Removido para evitar aviso de múltiplas instâncias

// Interface para dados do contrato
export interface Contract {
  id_contrato: string;
  user_id: string;
  cliente_id: string;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'assinado' | 'expirado' | 'cancelado';
  valor_total?: number;
  data_evento?: string;
  tipo_evento?: string;
  conteudo?: string;
  email_cliente?: string;
  nome_cliente?: string;
  cpf_cliente?: string;
  endereco_cliente?: string;
  data_assinatura?: string;
  data_expiracao?: string;
  criado_em: string;
  id_amigavel?: number;
  clientes?: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    data_nascimento?: string;
  };
}

// Interface para templates de contrato
export interface ContractTemplate {
  id: string;
  user_id: string;
  nome: string;
  conteudo: string;
  padrao: boolean;
  criado_em: string;
}

// Interface para criação de contrato
export interface CreateContractData {
  id_contrato?: string;
  cliente_id: string;
  titulo: string;
  descricao?: string;
  valor_total?: number;
  data_evento?: string;
  tipo_evento?: string;
  conteudo?: string;
  email_cliente?: string;
  nome_cliente?: string;
  cpf_cliente?: string;
  endereco_cliente?: string;
  data_expiracao?: string;
}

// Interface para criação de template de contrato
export interface CreateContractTemplateData {
  nome: string;
  conteudo: string;
  padrao?: boolean;
}

// Interface para atualização de contrato
export interface UpdateContractData {
  titulo?: string;
  descricao?: string;
  status?: Contract['status'];
  valor_total?: number;
  data_evento?: string;
  tipo_evento?: string;
  conteudo?: string;
  email_cliente?: string;
  nome_cliente?: string;
  cpf_cliente?: string;
  endereco_cliente?: string;
  data_expiracao?: string;
}

/**
 * Busca todos os contratos do usuário atual
 */
export const listContracts = async (user: User) => {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        agenda_eventos(
          id,
          titulo,
          data_inicio,
          data_fim,
          cliente_id,
          valor_total,
          data_nascimento
        ),
        clientes(
          id,
          nome,
          email,
          telefone
        )
      `)
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao listar contratos:', error);
    throw error;
  }
};

/**
 * Busca um contrato específico
 */
export const getContract = async (id: string, user: User) => {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        clientes(*),
        agenda_eventos(
          data_nascimento
        )
      `)
      .eq('id_contrato', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar contrato:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar contrato:', error);
    throw error;
  }
};

/**
 * Busca um contrato público (sem autenticação) - usado para visualização pública
 * Usa um cliente Supabase específico para consultas públicas
 */
export const getPublicContract = async (id: string) => {
  try {
    // Usar o cliente público que não tem sessão de usuário
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        clientes(*),
        agenda_eventos(
          data_nascimento
        )
      `)
      .eq('id_contrato', id)
      .single();

    if (error) {
      console.error('Erro ao buscar contrato público:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Erro ao buscar contrato público:', error);
    throw error;
  }
};

/**
 * Cria um novo contrato
 */
export const createContract = async (contractData: CreateContractData, user: User) => {
  try {
    const dataToInsert = {
      ...contractData,
      user_id: user.id,
      status: 'pendente'
    };
    
    const { data, error } = await supabase
      .from('contratos')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    
    // Registrar atividade de criação do contrato
    try {
      await registrarContratoCriado(user.id, data.titulo, data.id_contrato);
    } catch (activityError) {
      console.warn('Erro ao registrar atividade de criação do contrato:', activityError);
      // Não falhar a criação do contrato por causa do log de atividade
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    throw error;
  }
};

/**
 * Atualiza um contrato existente
 */
export const updateContract = async (id: string, contractData: UpdateContractData, user: User) => {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .update(contractData)
      .eq('id_contrato', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    throw error;
  }
};

/**
 * Atualiza o status de um contrato
 */
export const updateContractStatus = async (id: string, status: Contract['status'], user: User) => {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .update({
        status,
        data_assinatura: status === 'assinado' ? new Date().toISOString() : undefined
      })
      .eq('id_contrato', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar status do contrato:', error);
    throw error;
  }
};

/**
 * Deleta um contrato
 */
export const deleteContract = async (id: string, user: User) => {
  try {
    const { error } = await supabase
      .from('contratos')
      .delete()
      .eq('id_contrato', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar contrato:', error);
    throw error;
  }
};

/**
 * Lista todos os templates de contrato do usuário
 * Busca na tabela modelos_contrato dedicada
 */
export const listContractTemplates = async (user: User): Promise<ContractTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select('id, user_id, titulo, conteudo, criado_em')
      .eq('user_id', user.id)
      .eq('modelos_contrato', true)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar templates:', error);
      return [];
    }
    
    // Converter para formato de template
    const templates: ContractTemplate[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      nome: item.titulo.replace('Template: ', ''),
      conteudo: item.conteudo,
      padrao: false,
      criado_em: item.criado_em
    }));
    
    return templates;
  } catch (error) {
    console.error('Erro ao listar templates de contrato:', error);
    // Em caso de erro, retornar array vazio para não quebrar a funcionalidade
    return [];
  }
};

/**
 * Verifica se já existe um template com o nome especificado
 */
export const checkTemplateNameExists = async (
  templateName: string,
  user: User,
  excludeTemplateId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('contratos')
      .select('id')
      .eq('user_id', user.id)
      .eq('modelos_contrato', true)
      .ilike('titulo', `Template: ${templateName.trim()}`);
    
    // Se estamos editando um template, excluir o próprio template da verificação
    if (excludeTemplateId) {
      query = query.neq('id', excludeTemplateId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data && data.length > 0);
  } catch (error) {
    console.error('Erro ao verificar nome do template:', error);
    return false;
  }
};

/**
 * Cria um novo template de contrato
 * Salva na tabela contratos com flag modelos_contrato = true
 */
export const createContractTemplate = async (
  templateData: CreateContractTemplateData, 
  user: User
): Promise<ContractTemplate> => {
  try {
    // Verificar se já existe um template com o mesmo nome
    const nameExists = await checkTemplateNameExists(templateData.nome, user);
    if (nameExists) {
      throw new Error('Já existe um modelo com este nome. Escolha outro nome.');
    }
    
    // Salvar na tabela contratos com flag modelos_contrato = true
    const { data, error } = await supabase
      .from('contratos')
      .insert({
        user_id: user.id,
        titulo: `Template: ${templateData.nome}`,
        conteudo: templateData.conteudo,
        valor_total: 0.00,
        status: 'modelo',
        modelos_contrato: true
      })
      .select('id, user_id, titulo, conteudo, criado_em')
      .single();

    if (error) throw error;

    // Retornar no formato esperado
    const template: ContractTemplate = {
      id: data.id,
      user_id: data.user_id,
      nome: data.titulo.replace('Template: ', ''),
      conteudo: data.conteudo,
      padrao: false,
      criado_em: data.criado_em
    };
    
    return template;
  } catch (error) {
    console.error('Erro ao criar template de contrato:', error);
    throw error;
  }
};

/**
 * Atualiza um template de contrato existente
 */
export const updateContractTemplate = async (
  templateId: string,
  templateData: Partial<CreateContractTemplateData>,
  user: User
): Promise<ContractTemplate> => {
  try {
    // Logs removidos por segurança - não expor userId e dados de template
    
    const updateData: any = {};
    
    // Se estamos atualizando o nome, verificar se já existe outro template com o mesmo nome
    if (templateData.nome !== undefined) {
      // Log removido por segurança
      const nameExists = await checkTemplateNameExists(templateData.nome, user, templateId);
      if (nameExists) {
        console.log('❌ Nome já existe, lançando erro');
        throw new Error('Já existe um modelo com este nome. Escolha outro nome.');
      }
      updateData.titulo = `Template: ${templateData.nome}`;
      console.log('✅ Nome validado, título definido:', updateData.titulo);
    }
    
    if (templateData.conteudo !== undefined) {
      updateData.conteudo = templateData.conteudo;
      console.log('📝 Conteúdo definido');
    }

    console.log('🚀 Executando update no Supabase:', updateData);
    
    const { data, error } = await supabase
      .from('contratos')
      .update(updateData)
      .eq('id', templateId)
      .eq('user_id', user.id)
      .eq('modelos_contrato', true)
      .select('id, user_id, titulo, conteudo, criado_em')
      .single();

    if (error) {
      console.log('❌ Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ Dados retornados do Supabase:', data);

    // Retornar no formato esperado
    const template: ContractTemplate = {
      id: data.id,
      user_id: data.user_id,
      nome: data.titulo.replace('Template: ', ''),
      conteudo: data.conteudo,
      padrao: false,
      criado_em: data.criado_em
    };
    
    console.log('📋 Template formatado para retorno:', template);
    return template;
  } catch (error) {
    console.error('❌ Erro ao atualizar template de contrato:', error);
    throw error;
  }
};

/**
 * Deleta um template de contrato
 */
export const deleteContractTemplate = async (
  templateId: string,
  user: User
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contratos')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id)
      .eq('modelos_contrato', true);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar template de contrato:', error);
    throw error;
  }
};

/**
 * Duplica um template de contrato existente
 */
export const duplicateContractTemplate = async (
  templateId: string,
  newName: string,
  user: User
): Promise<ContractTemplate> => {
  try {
    // Buscar o template original
    const { data: originalTemplate, error: fetchError } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!originalTemplate) throw new Error('Template não encontrado');

    // Criar o novo template
    const { data, error } = await supabase
      .from('contract_templates')
      .insert({
        user_id: user.id,
        nome: newName,
        conteudo: originalTemplate.conteudo,
        padrao: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao duplicar template:', error);
    throw error;
  }
};

export async function getContractById(id: string): Promise<Contract | null> {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        *,
        clientes(*),
        agenda_eventos(
          data_nascimento
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar contrato por ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar contrato por ID:', error);
    return null;
  }
}