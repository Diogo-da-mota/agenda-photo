import { v4 as uuidv4 } from 'uuid';
import { TrabalhoPortfolio, CriarTrabalhoPortfolio, TrabalhoPortfolioResumo } from './types';

// Interface para dados do Supabase
interface TrabalhoSupabaseData {
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
}

// Converter para formato do Supabase
export const converterParaSupabase = (trabalho: CriarTrabalhoPortfolio, userId: string) => {
  const agora = new Date().toISOString();
  
  // Auto-definir imagem_capa se não foi fornecida
  const imagemCapa = trabalho.imagem_capa || 
    (trabalho.imagens && trabalho.imagens.length > 0 ? trabalho.imagens[0] : null);
  
  return {
    id: uuidv4(),
    user_id: userId,
    titulo: trabalho.titulo,
    categoria: trabalho.categoria,
    local: trabalho.local,
    descricao: trabalho.descricao,
    tags: trabalho.tags,
    imagens: trabalho.imagens,
    imagem_capa: imagemCapa,
    criado_em: agora,
    atualizado_em: agora
  };
};

// Converter do Supabase para formato do frontend
export const converterDoSupabase = (trabalho: TrabalhoSupabaseData): TrabalhoPortfolio => {
  return {
    id: trabalho.id,
    user_id: trabalho.user_id,
    titulo: trabalho.titulo,
    categoria: trabalho.categoria,
    local: trabalho.local,
    descricao: trabalho.descricao,
    tags: trabalho.tags || [],
    imagens: trabalho.imagens || [],
    imagem_capa: trabalho.imagem_capa,
    criado_em: trabalho.criado_em,
    atualizado_em: trabalho.atualizado_em
  };
};

// Converter para formato resumido
export const converterParaResumo = (trabalho: TrabalhoSupabaseData): TrabalhoPortfolioResumo => {
  // Obter imagem principal: primeiro tenta imagem_capa (manual), depois imagens[0]
  const imagemPrincipal = trabalho.imagem_capa || 
    (trabalho.imagens && trabalho.imagens.length > 0 ? trabalho.imagens[0] : null);
  
  return {
    id: trabalho.id,
    titulo: trabalho.titulo,
    categoria: trabalho.categoria,
    local: trabalho.local,
    descricao: trabalho.descricao || '',
    imagem_principal: imagemPrincipal,
    criado_em: trabalho.criado_em,
    tags_preview: trabalho.tags ? trabalho.tags.slice(0, 3) : []
  };
};
