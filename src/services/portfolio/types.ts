// Tipos e interfaces para o portfólio
export interface TrabalhoPortfolio {
  id: string;
  user_id: string;
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  imagem_capa: string | null;
  criado_em: string;
  atualizado_em: string;
  is_placeholder?: boolean; // Novo campo para identificar placeholders
}

// Interface para trabalho resumido (otimizada para listagem)
export interface TrabalhoPortfolioResumo {
  id: string;
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  imagem_principal: string | null;
  criado_em: string;
  tags_preview: string[];
}

// Interface para criação de trabalho (sem campos gerados automaticamente)
export interface CriarTrabalhoPortfolio {
  titulo: string;
  categoria: string;
  local: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  imagensExistentes?: string[]; // URLs das imagens já salvas (usado na edição)
  imagem_capa: string | null;
}

// Interface para criação de trabalho com múltiplas imagens
export interface CriarTrabalhoComImagens {
  trabalho: CriarTrabalhoPortfolio;
  arquivos: File[];
  imagensARemover?: string[]; // URLs das imagens a serem removidas
}

// Interface de resultado com URL do Drive
export interface ResultadoTrabalhoComImagens {
  trabalho: TrabalhoPortfolio;
  imagens: string[]; // URLs das imagens
  urlsDrive: string[]; // Alias para imagens (compatibilidade)
  sucessos: number;
  falhas: number;
}

// Categorias pré-definidas em português
export const CATEGORIAS_PORTFOLIO = [
  'Casamento',
  'Aniversário',
  'Ensaio Casal',
  'Ensaio Individual',
  'Formatura',
  'Gestante',
  'Newborn',
  'Infantil',
  'Corporativo',
  'Eventos',
  'Família',
  'Outro'
];
