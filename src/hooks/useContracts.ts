import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { listContracts } from '@/services/contractService';

export const useContracts = (enabled: boolean = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: () => listContracts(user!),
    enabled: !!user && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    refetchOnWindowFocus: true,
  });
};
