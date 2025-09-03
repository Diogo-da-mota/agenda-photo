
// Interface para os resultados da RPC pg_table_exists
export interface TableExistsResult {
  table_found: boolean;
  count?: number;
}

// Interface para os resultados da RPC execute_sql
export interface ExecuteSqlResult<T = any> {
  [key: string]: any;
}

// Interface para app_settings - exportando para uso em outros arquivos
export interface AppSettingsData {
  id?: string;
  user_id: string | null;
  nome_empresa: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  modo_escuro?: boolean;
  notificacoes?: boolean;
  idioma?: string;
  custom_domain?: string | null;
  imagem_url?: string | null;
  logo_empresa?: string | null;
  cor_primaria?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Interface para configuracoes_empresa
export interface ConfiguracoesEmpresa {
  id?: string;
  id_usuario: string;
  nome_empresa: string | null;
  cnpj: string | null;
  inscricao_estadual: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  site: string | null;
  logo_url: string | null;
  logo_empresa: string | null;
  banner_url: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  url_imagem: string | null;
  modo_escuro: boolean | null;
  notificacoes: boolean | null;
  idioma: string | null;
  dominio_personalizado: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

// Interface para configuracoes_app - versão em português
export interface ConfiguracoesApp {
  id?: string;
  id_usuario: string | null;
  nome_empresa: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  modo_escuro?: boolean;
  notificacoes?: boolean;
  idioma?: string;
  dominio_personalizado?: string | null;
  url_imagem?: string | null;
  logo_empresa?: string | null;
  cor_primaria?: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
}

// Interface para logs de auditoria
export interface AuditLogData {
  id: string;
  table_name: string;
  operation: string;
  timestamp: string;
  user_id?: string | null;
  record_id?: string | null;
  old_data?: any;
  new_data?: any;
}

// Interface para imagens (mantida para compatibilidade)
export interface ImageData {
  id: string;
  url: string;
  user_id: string | null;
  referencia_id?: string | null;
  tipo?: string | null;
  criado_em: string;
  filesize?: number | null;
  filename?: string | null;
  mimetype?: string | null;
  created_at?: string | null;
}
