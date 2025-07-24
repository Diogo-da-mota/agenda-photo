/**
 * Tenta executar uma função que retorna uma Promise várias vezes com um backoff exponencial.
 * @param promiseFn A função que retorna a Promise a ser executada.
 * @param maxRetries O número máximo de tentativas.
 * @param initialDelayMs O atraso inicial em milissegundos.
 * @returns Uma Promise que resolve com o resultado da promiseFn ou rejeita após todas as tentativas.
 */
export const asyncRetry = async <T>(
  promiseFn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await promiseFn();
    } catch (error) {
      lastError = error;
      console.warn(`Tentativa ${attempt} de ${maxRetries} falhou. Erro:`, error);

      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`Aguardando ${delay}ms para a próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error("Todas as tentativas falharam. Último erro:", lastError);
  throw lastError;
}; 