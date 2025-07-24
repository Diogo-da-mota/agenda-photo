import { supabase } from '@/lib/supabase';
import { sanitizeTableName } from './validation';

// Definindo interfaces para o projeto
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  data_nascimento: string | null;
  criado_em: string;
  user_id: string;
  observacoes?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface ClienteInsert {
  nome: string;
  email: string;
  telefone?: string | null;
  empresa?: string | null;
  user_id: string;
  data_nascimento?: string | null;
  observacoes?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  data_nascimento?: string | null;
  observacoes?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface ClienteCompleto {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  criado_em: string;
  user_id: string;
  data_nascimento?: string | null;
  observacoes?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string;
  timestamp: string;
  event_type: string;
  resource: string;
  details: string;
}

export interface Contrato {
  id: string;
  cliente_id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  status: string;
  criado_em: string;
}

export interface ConfiguracaoEmpresa {
  id: string;
  user_id: string;
  nome_empresa: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email_empresa?: string;
  logo_url?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  instagram?: string;
  facebook?: string;
  site?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface ConfiguracaoIntegracao {
  id: string;
  user_id: string;
  webhook_enabled: boolean;
  webhook_url?: string;
  custom_domain?: string;
  company_logo?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AppSetting {
  id: string;
  nome: string;
  valor: string;
  user_id: string;
}

export interface Mensagem {
  id: string;
  conteudo: string;
  user_id: string;
  cliente_id?: string;
  criado_em: string;
}

export interface Notificacao {
  id: string;
  user_id: string;
  titulo?: string;
  corpo?: string;
  lida: boolean;
  criado_em: string;
}

export interface Pagamento {
  id: string;
  user_id: string;
  cliente_id?: string;
  valor: number;
  status: string;
  forma?: string;
  vencimento?: string;
  criado_em: string;
}

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  criado_em?: string;
  role?: string;
}

export interface Profile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
  billing_address: string;
  billing_city: string;
  billing_country: string;
  payment_method?: string;
  user_id?: string;
  email?: string;
  phone?: string;
}

export interface Imagem {
  id: string;
  url: string;
  user_id: string;
  nome?: string;
  criado_em: string;
}

// Definição do tipo Database para as tabelas existentes
export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: Cliente;
        Insert: ClienteInsert;
        Update: Partial<ClienteInsert>;
        Relationships: [];
      };
      imagens: {
        Row: Imagem;
        Insert: {
          url: string;
          user_id: string;
          nome?: string;
          criado_em?: string;
        };
        Update: {
          url?: string;
          user_id?: string;
          nome?: string;
          criado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

// Função auxiliar para interagir com o Supabase de forma tipada
export const supabaseTyped = {
  from: function<T extends string>(table: T) {
    const safeTable = sanitizeTableName(table);
    return supabase.from(safeTable as any);
  }
};

// Tipo para garantir que apenas tabelas conhecidas sejam acessadas
export type SupabaseTableName = string;

// Função auxiliar para acesso seguro às tabelas
export const getSupabaseTable = (tableName: string) => {
  const safeTable = sanitizeTableName(tableName);
  return supabase.from(safeTable as any);
};

// Função auxiliar para selects seguros - versão com validação
export const safeSelect = async (tableName: string, columns = '*', filters?: Record<string, any>) => {
  try {
    const safeTable = sanitizeTableName(tableName);
    let query = supabase.from(safeTable as any).select(columns);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Erro ao buscar dados de ${safeTable}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error(`Erro geral ao acessar ${tableName}:`, err);
    return { data: null, error: err };
  }
};

// Função auxiliar para inserts seguros - versão com validação
export const safeInsert = async (tableName: string, data: any) => {
  try {
    const safeTable = sanitizeTableName(tableName);
    const { data: result, error } = await supabase
      .from(safeTable as any)
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error(`Erro ao inserir em ${safeTable}:`, error);
      return { data: null, error };
    }
    
    return { data: result, error: null };
  } catch (err) {
    console.error(`Erro geral ao inserir em ${tableName}:`, err);
    return { data: null, error: err };
  }
};

// Função auxiliar para updates seguros - versão com validação
export const safeUpdate = async (tableName: string, updates: any, filters: Record<string, any>) => {
  try {
    const safeTable = sanitizeTableName(tableName);
    let query = supabase.from(safeTable as any).update(updates);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.select().single();
    
    if (error) {
      console.error(`Erro ao atualizar ${safeTable}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error(`Erro geral ao atualizar ${tableName}:`, err);
    return { data: null, error: err };
  }
};
