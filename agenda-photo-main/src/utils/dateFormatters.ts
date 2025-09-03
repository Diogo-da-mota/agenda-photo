/**
 * Função para formatar data no padrão PostgreSQL (YYYY-MM-DD)
 * @param date Data a ser formatada (Date ou string)
 * @returns String no formato YYYY-MM-DD
 */
export function formatarDataPostgres(date: Date | string): string {
  if (!date) return '';
  try {
    // Garantir que a string de data seja convertida corretamente
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Extrair ano, mês e dia
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth retorna 0-11
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    // Retornar no formato YYYY-MM-DD
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erro ao formatar data para PostgreSQL:', error, date);
    return new Date().toISOString().split('T')[0]; // Fallback para data atual
  }
}

/**
 * Função para formatar data no padrão brasileiro (DD/MM/YYYY)
 * @param date Data a ser formatada (Date ou string)
 * @returns String no formato DD/MM/YYYY
 */
export function formatarDataBrasileira(date: Date | string): string {
  if (!date) return '';
  try {
    // Garantir que a string de data seja convertida corretamente
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Extrair dia, mês e ano
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth retorna 0-11
    const year = dateObj.getFullYear();
    
    // Retornar no formato DD/MM/YYYY
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erro ao formatar data para padrão brasileiro:', error, date);
    return '';
  }
}

/**
 * Função helper para validar se uma data é válida
 * @param date Data a ser validada
 * @returns true se a data for válida, false caso contrário
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
} 