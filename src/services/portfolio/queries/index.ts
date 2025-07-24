
// Exportações centralizadas das consultas de portfólio
export { 
  buscarTrabalhosPortfolio, 
  buscarTrabalhoPorId,
  buscarTrabalhoPorTitulo
} from './basicQueries';

export { 
  buscarTrabalhoPublicoPorId, 
  buscarTrabalhosPortfolioPublicos
} from './publicQueries';

export { 
  buscarTrabalhosPortfolioOtimizado 
} from './optimizedQueries';
