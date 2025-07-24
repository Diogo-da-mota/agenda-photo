import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getContract } from '@/services/contractService';
import { parseContractSlug } from '@/utils/slugify';

export const useContract = (id: string) => {
  const { user } = useAuth();

  // Extrair ID real do slug se necessário
  const parsedSlug = parseContractSlug(id);
  const contractId = parsedSlug.id_contrato || id;

  // Logs removidos por segurança - não expor userId e dados de contrato

  return useQuery({
    queryKey: ['contract', contractId, user?.id],
    queryFn: () => {
      // Log removido por segurança
      return getContract(contractId, user!);
    },
    enabled: !!user && !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};