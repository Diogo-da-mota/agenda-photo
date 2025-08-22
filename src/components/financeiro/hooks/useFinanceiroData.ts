import { useState, useEffect } from 'react';

export const useFinanceiroData = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setIsLoading(false);
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refetch: () => {}
  };
};

export default useFinanceiroData;