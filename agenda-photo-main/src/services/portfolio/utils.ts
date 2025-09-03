import { TrabalhoPortfolio, CriarTrabalhoPortfolio } from './types';

// Função para gerar placeholders
export const gerarPlaceholders = (quantidade: number = 6): TrabalhoPortfolio[] => {
  return Array.from({ length: quantidade }, (_, index) => ({
    id: `placeholder-${index}`,
    user_id: 'placeholder',
    titulo: `Trabalho ${index + 1}`,
    categoria: 'Fotografia',
    local: 'São Paulo, SP',
    descricao: `Descrição do trabalho ${index + 1}`,
    tags: ['placeholder'],
    imagens: [],
    imagem_capa: null,
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
    is_placeholder: true
  }));
};

export const trabalhoVazio: CriarTrabalhoPortfolio = {
  titulo: '',
  categoria: '',
  local: '',
  descricao: '',
  tags: [],
  imagens: [],
  imagem_capa: null,
};
