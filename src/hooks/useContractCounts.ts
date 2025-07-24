import { useMemo } from 'react';
import { useContracts } from '@/hooks/useContracts';

interface UseContractCountsOptions {
  enabled?: boolean;
}

export const useContractCounts = (options: UseContractCountsOptions = {}) => {
  const { enabled = true } = options;
  const { data: contracts = [], isLoading, error } = useContracts(enabled);

  const counts = useMemo(() => {
    if (!contracts.length) {
      return {
        total: 0,
        pendentes: 0,
        assinados: 0,
        expirados: 0,
        cancelados: 0
      };
    }

    return {
      total: contracts.length,
      pendentes: contracts.filter(contract => contract.status === 'pendente').length,
      assinados: contracts.filter(contract => contract.status === 'assinado').length,
      expirados: contracts.filter(contract => contract.status === 'expirado').length,
      cancelados: contracts.filter(contract => contract.status === 'cancelado').length,
    };
  }, [contracts]);

  return {
    counts,
    contracts,
    isLoading,
    error
  };
};
