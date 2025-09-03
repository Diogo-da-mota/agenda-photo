
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { TestResult, UseRateLimitTestReturn } from './types';
import { executeAuthRateLimit } from './authTesting';
import { executeFinanceiroRateLimit } from './financeiroTesting';
import { createResultAdder, createToastHandler } from './testUtils';

export const useRateLimitTest = (): UseRateLimitTestReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const addResult = createResultAdder(setResults);
  const toastHandler = createToastHandler(toast);

  const testAuthRateLimit = async () => {
    setIsRunning(true);
    
    try {
      await executeAuthRateLimit(addResult, toastHandler);
    } catch (error) {
      logger.error('Erro no teste de rate limiting auth', error, 'RateLimitTest');
      toastHandler(
        "Erro no teste",
        (error as Error).message,
        "destructive"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const testFinanceiroRateLimit = async () => {
    setIsRunning(true);
    
    try {
      await executeFinanceiroRateLimit(addResult, toastHandler);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    toastHandler(
      "Resultados limpos",
      "Histórico de testes removido.",
      "default"
    );
  };

  return {
    isRunning,
    results,
    testAuthRateLimit,
    testFinanceiroRateLimit,
    clearResults
  };
};
