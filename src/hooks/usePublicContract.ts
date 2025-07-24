import { useQuery } from '@tanstack/react-query';
import { getPublicContract } from '@/services/contractService';

export const usePublicContract = (id: string) => {
  return useQuery({
    queryKey: ['public-contract', id],
    queryFn: () => getPublicContract(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};