import { ImagemPortfolio, UploadImagemPortfolio } from './types';

// Funções antigas removidas - agora não fazemos upload para Supabase Storage
export const uploadImagensPortfolio = async (): Promise<ImagemPortfolio[]> => {
  throw new Error('uploadImagensPortfolio foi removida. Use enviarImagensParaN8N.');
};

export const buscarImagensTrabalho = async (trabalhoId: string): Promise<string[]> => {
  throw new Error('buscarImagensTrabalho foi removida. As URLs estão em portfolio_trabalhos.imagens e portfolio_trabalhos.imagem_capa.');
};

export const excluirImagemPortfolio = async (): Promise<void> => {
  throw new Error('excluirImagemPortfolio foi removida.');
};

export const atualizarOrdemImagens = async (): Promise<void> => {
  throw new Error('atualizarOrdemImagens foi removida.');
};
