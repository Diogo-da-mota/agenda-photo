import { useQuery } from '@tanstack/react-query';
import { getPublicContract } from '@/services/contractService';
import { parseContractSlug } from '@/utils/slugify';

export const usePublicContract = (id: string) => {
  // Extrair ID real do slug se necessário
  const parsedSlug = parseContractSlug(id);
  const contractId = parsedSlug.id_contrato || id;

  return useQuery({
    queryKey: ['public-contract', contractId],
    queryFn: () => getPublicContract(contractId),
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};