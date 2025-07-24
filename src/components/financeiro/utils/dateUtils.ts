import { addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Obter data atual no fuso horário brasileiro (UTC-3)
 */
export function getBrazilDate(): Date {
  const now = new Date();
  return new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
}

/**
 * Verificar se uma data está dentro do range selecionado
 */
export function isDateInRange(
  dateString: string | Date, 
  dateRange: {start: Date | null, end: Date | null}
): boolean {
  if (!dateRange.start && !dateRange.end) return true;
  
  try {
    // Normalizar a data para comparação (apenas dia, mês, ano)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return true; // Se data inválida, não filtrar
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const startDate = dateRange.start ? new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate()) : null;
    const endDate = dateRange.end ? new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate()) : null;
    
    if (startDate && endDate) {
      return dateOnly >= startDate && dateOnly <= endDate;
    } else if (startDate) {
      return dateOnly >= startDate;
    } else if (endDate) {
      return dateOnly <= endDate;
    }
  } catch (error) {
    console.warn('Erro ao comparar datas:', error, dateString);
    return true; // Em caso de erro, não filtrar
  }
  
  return true;
}

/**
 * Selecionar mês baseado em offset (0 = atual, -1 = anterior, 1 = próximo)
 */
export function selectMonth(monthOffset: number): { start: Date, end: Date } {
  const brazilDate = getBrazilDate();
  const targetMonth = monthOffset === 0 
    ? brazilDate 
    : monthOffset > 0 
      ? addMonths(brazilDate, monthOffset) 
      : subMonths(brazilDate, Math.abs(monthOffset));
  
  return {
    start: startOfMonth(targetMonth),
    end: endOfMonth(targetMonth)
  };
}

/**
 * Selecionar ano atual
 */
export function selectCurrentYear(): { start: Date, end: Date } {
  const brazilDate = getBrazilDate();
  return {
    start: new Date(brazilDate.getFullYear(), 0, 1), // 1º janeiro
    end: new Date(brazilDate.getFullYear(), 11, 31)  // 31 dezembro
  };
}

/**
 * Selecionar últimos N meses
 */
export function selectLastMonths(months: number): { start: Date, end: Date } {
  const brazilDate = getBrazilDate();
  return {
    start: subMonths(brazilDate, months),
    end: brazilDate
  };
} 