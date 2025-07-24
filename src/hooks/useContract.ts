import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getContract } from '@/services/contractService';

export const useContract = (id: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contract', id, user?.id],
    queryFn: () => getContract(id, user!),
    enabled: !!user && !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};