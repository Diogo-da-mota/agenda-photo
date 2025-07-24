/**
 * Tipos TypeScript para o sistema de entrega de fotos
 * Baseado na nova estrutura unificada da tabela entregar_imagens
 */

// Interface principal unificada - combina galeria e imagens
export interface EntregarImagens {
  // Identificação
  id: string;
  
  // Informações da galeria (mesmas para todas as imagens de uma galeria)
  titulo: string;
  descricao?: string;
  slug: string;
  cliente_id?: string;
  evento_id?: string;
  data_evento?: string; // DATE
  data_entrega?: string; // DATE
  data_expiracao?: string; // TIMESTAMPTZ
  senha_acesso?: string;
  link_galeria?: string;
  status: 'ativa' | 'expirada' | 'arquivada' | 'inativa';
  total_fotos: number;
  total_acessos: number;
  total_downloads: number;
  ultimo_acesso?: string; // TIMESTAMPTZ
  permitir_download: boolean;
  permitir_compartilhamento: boolean;
  marca_dagua: boolean;
  observacoes?: string;
  
  // Informações específicas da imagem
  nome_arquivo: string;
  nome_original?: string;
  url_imagem: string;
  url_thumbnail?: string;
  url_preview?: string;
  tamanho_arquivo?: number;
  largura?: number;
  altura?: number;
  formato?: string;
  ordem?: number;
  destaque?: boolean;
  
  // Controle de usuário
  user_id: string;
  
  // Timestamps
  criado_em: string; // TIMESTAMPTZ
  atualizado_em: string; // TIMESTAMPTZ
}

// Manter interface antiga para compatibilidade (agora aponta para EntregarImagens)
export interface EntregarFotos extends EntregarImagens {}

// Tipos para formulários
export interface EntregarFotosFormData {
  titulo: string;
  descricao?: string;
  cliente_id?: string;
  evento_id?: string;
  data_evento?: string;
  data_entrega?: string; // ✅ ADICIONADO: Campo que estava faltando
  data_expiracao?: string;
  senha_acesso?: string;
  permitir_download?: boolean;
  permitir_compartilhamento?: boolean;
  marca_dagua?: boolean;
  observacoes?: string;
}

// Tipos para estatísticas
export interface EstatisticasGalerias {
  total_galerias: number;
  galerias_ativas: number;
  galerias_expiradas: number;
  total_fotos: number;
  total_acessos: number;
  total_downloads: number;
  galeria_mais_acessada?: {
    titulo: string;
    slug: string;
    total_acessos: number;
  };
}

// Tipos para inserção no banco (estrutura unificada)
export interface EntregarImagensInsert {
  // Informações da galeria
  titulo: string;
  descricao?: string;
  slug: string;
  cliente_id?: string;
  evento_id?: string;
  data_evento?: string;
  data_expiracao?: string;
  senha_acesso?: string;
  status?: 'ativa' | 'expirada' | 'arquivada' | 'inativa';
  total_fotos: number;
  permitir_download?: boolean;
  permitir_compartilhamento?: boolean;
  marca_dagua?: boolean;
  observacoes?: string;
  
  // Informações da imagem de capa (representativa)
  nome_arquivo: string;
  nome_original?: string;
  url_imagem: string;
  tamanho_arquivo?: number;

  // ✅ NOVO CAMPO: Array com todas as imagens da galeria
  imagens_galeria: {
    url: string;
    nome_arquivo: string;
    nome_original?: string;
    tamanho_arquivo?: number;
    ordem: number;
  }[];
  
  // Controle de usuário
  user_id: string;
}

// Manter interface antiga para compatibilidade
export interface EntregarFotosInsert extends EntregarImagensInsert {}



// Tipos para atualizações
export interface EntregarFotosUpdate {
  titulo?: string;
  descricao?: string;
  data_evento?: string;
  data_expiracao?: string;
  senha_acesso?: string;
  status?: 'ativa' | 'expirada' | 'arquivada' | 'inativa';
  permitir_download?: boolean;
  permitir_compartilhamento?: boolean;
  marca_dagua?: boolean;
  observacoes?: string;
}

// Tipos para resultados de processamento
export interface ProcessResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  details: string[];
}

// Tipos para visualização pública
export interface GaleriaPublica {
  id: string;
  titulo: string;
  descricao?: string;
  slug: string;
  data_evento?: string;
  total_fotos: number;
  permitir_download: boolean;
  permitir_compartilhamento: boolean;
  marca_dagua: boolean;
  status: string;
  imagens: EntregarImagens[];
}

// ✅ NOVO TIPO: GaleriaAgrupada para o serviço automático
export interface GaleriaAgrupada {
  galeria_grupo_id: string;
  slug: string;
  titulo: string;
  descricao?: string;
  data_evento?: string;
  data_entrega?: string;
  data_expiracao?: string;
  senha_acesso?: string;
  status: 'ativa' | 'expirada' | 'arquivada' | 'inativa';
  total_fotos: number;
  total_acessos: number;
  total_downloads: number;
  ultimo_acesso?: string;
  permitir_download: boolean;
  permitir_compartilhamento: boolean;
  marca_dagua: boolean;
  observacoes?: string;
  user_id: string;
  criado_em: string;
  atualizado_em?: string;
}

// Tipo para galeria completa (agrupamento de imagens por slug)
export interface GaleriaCompleta {
  // Informações da galeria (agora parte da tabela entregar_imagens)
  id: string;
  galeria_grupo_id?: string; // ✅ ADICIONADO: Campo que estava faltando
  titulo: string;
  descricao?: string;
  slug: string;
  cliente_id?: string;
  evento_id?: string;
  data_evento?: string;
  data_entrega?: string;
  data_expiracao?: string;
  senha_acesso?: string; // ✅ CORRIGIDO: Voltando para senha_acesso
  link_galeria?: string;
  status: string;
  total_fotos?: number;
  total_acessos?: number;
  total_downloads?: number;
  ultimo_acesso?: string;
  permitir_download?: boolean;
  permitir_compartilhamento?: boolean;
  marca_dagua?: boolean;
  observacoes?: string;
  user_id: string;
  criado_em?: string;
  atualizado_em?: string;
  
  // Array de imagens da galeria
  imagens: EntregarImagens[];
}