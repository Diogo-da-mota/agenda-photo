import { supabase } from '@/lib/supabase';
import { isValidUUID } from '@/utils/sanitization';

/**
 * Interface do Usuário
 */
interface Usuario {
  id: string;
  email: string;
  papel: string;
  nome?: string;
  telefone?: string;
  criado_em: string;
}

/**
 * Busca um usuário pelo ID usando métodos seguros do Supabase
 * @param id ID do usuário (deve ser UUID válido)
 * @returns O usuário encontrado ou null
 */
export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  try {
    // Validar UUID antes de fazer a consulta
    if (!isValidUUID(id)) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.warn('ID inválido fornecido para getUsuarioById');
      }
      return null;
    }

    // Usar método seguro do Supabase com parâmetros
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao buscar usuário:', error.message);
      }
      return null;
    }
    
    return data as Usuario;
  } catch (error: any) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro inesperado ao buscar usuário:', error);
    }
    return null;
  }
};

/**
 * Cria um novo usuário usando métodos seguros do Supabase
 * @param usuario Dados do usuário validados
 * @returns O usuário criado ou null em caso de erro
 */
export const createUsuario = async (usuario: Omit<Usuario, 'id' | 'criado_em'>): Promise<Usuario | null> => {
  try {
    // Validação básica de entrada
    if (!usuario.email || !usuario.papel) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.warn('Dados obrigatórios não fornecidos para createUsuario');
      }
      return null;
    }

    // Usar método seguro do Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        email: usuario.email,
        papel: usuario.papel,
        nome: usuario.nome || null,
        telefone: usuario.telefone || null
      }])
      .select()
      .single();
    
    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao criar usuário:', error.message);
      }
      return null;
    }
    
    return data as Usuario;
  } catch (error: any) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro inesperado ao criar usuário:', error);
    }
    return null;
  }
};

/**
 * Atualiza um usuário existente usando métodos seguros do Supabase
 * @param id ID do usuário (deve ser UUID válido)
 * @param usuario Dados parciais do usuário para atualização
 * @returns O usuário atualizado ou null em caso de erro
 */
export const updateUsuario = async (id: string, usuario: Partial<Usuario>): Promise<Usuario | null> => {
  try {
    // Validar UUID antes de fazer a consulta
    if (!isValidUUID(id)) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.warn('ID inválido fornecido para updateUsuario');
      }
      return null;
    }

    // Filtrar apenas campos permitidos para atualização
    const allowedFields = ['email', 'papel', 'nome', 'telefone'];
    const updateData = Object.keys(usuario)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = usuario[key as keyof Usuario];
        return obj;
      }, {} as Partial<Usuario>);

    // Verificar se há dados para atualizar
    if (Object.keys(updateData).length === 0) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.warn('Nenhum dado válido fornecido para updateUsuario');
      }
      return null;
    }

    // Usar método seguro do Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      // Log apenas em desenvolvimento
      if (import.meta.env.MODE === 'development') {
        console.error('Erro ao atualizar usuário:', error.message);
      }
      return null;
    }
    
    return data as Usuario;
  } catch (error: any) {
    // Log apenas em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('Erro inesperado ao atualizar usuário:', error);
    }
    return null;
  }
};