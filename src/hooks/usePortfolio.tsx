import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TrabalhoPortfolio } from '@/services/portfolio/types';
import { CACHE_KEYS, queryConfigs } from '@/lib/react-query-config';

const fetchPortfolio = async (userId: string): Promise<TrabalhoPortfolio[]> => {
  const { data, error } = await supabase
    .from('portfolio_trabalhos')
    .select('id, titulo, descricao, imagem_capa, imagens, criado_em, atualizado_em, user_id, categoria, local, tags')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const usePortfolioQuery = (userId: string | undefined) => {
  return useQuery<TrabalhoPortfolio[], Error>({
    queryKey: [CACHE_KEYS.PORTFOLIO.TRABALHO_INDIVIDUAL, userId],
    queryFn: () => fetchPortfolio(userId!),
    enabled: !!userId,
    ...queryConfigs.portfolio,
  });
};
