
import { TestResult } from './types';

export const createResultAdder = (
  setResults: React.Dispatch<React.SetStateAction<TestResult[]>>
) => {
  return (result: TestResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Manter apenas os últimos 10 resultados
  };
};

export const createToastHandler = (
  toast: (options: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive';
  }) => void
) => {
  return (title: string, description: string, variant?: 'default' | 'destructive') => {
    toast({ title, description, variant });
  };
};
