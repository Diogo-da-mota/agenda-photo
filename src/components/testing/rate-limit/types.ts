
export interface TestResult {
  timestamp: string;
  action: string;
  success: boolean;
  error?: string;
  responseTime?: number;
}

export interface UseRateLimitTestReturn {
  isRunning: boolean;
  results: TestResult[];
  testAuthRateLimit: () => Promise<void>;
  testFinanceiroRateLimit: () => Promise<void>;
  clearResults: () => void;
}
