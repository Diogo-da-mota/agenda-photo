import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formatar data para exibição no padrão brasileiro
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  try {
    // Garantir que estamos usando a data no fuso horário local (Brasil)
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Corrigir o fuso horário para evitar problemas com a data
    // Quando uma data é '2025-06-10', o JavaScript pode interpretar como UTC
    // e ao converter para o fuso local, pode mudar o dia
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    
    // Criar uma nova data usando os componentes para evitar problemas de fuso
    const localDate = new Date(year, month, day);
    
    // Formatar no padrão brasileiro usando o locale ptBR
    return format(localDate, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error, date);
    return String(date);
  }
}

/**
 * Formatar valor monetário no padrão brasileiro
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formatar intervalo de datas para exibição
 */
export function formatDateRange(dateRange: {start: Date | null, end: Date | null}): string {
  const inicio = dateRange.start ? format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : '';
  const fim = dateRange.end ? format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : '';
  
  if (inicio && fim) {
    return `${inicio} até ${fim}`;
  } else if (inicio) {
    return `A partir de ${inicio}`;
  } else if (fim) {
    return `Até ${fim}`;
  }
  
  return '';
} 