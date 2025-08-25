// import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { formatDate } from './formatters';
import { toast } from '@/hooks/use-toast';

// Interface para dados de exportação
export interface ExportData {
  Data: string;
  Tipo: string;
  Descrição: string;
  Categoria: string;
  Valor: number;
  Status: string;
}

// Interface para grupo de transações (simplificada para exportação)
export interface ExportTransactionGroup {
  transactions: Array<{
    data_transacao: string | Date;
    tipo: 'receita' | 'despesa';
    descricao: string;
    categoria: string;
    valor: number;
    status: string;
  }>;
  despesas: Array<{
    data_transacao: Date;
    descricao: string;
    categoria: string | undefined;
    valor: number;
    status: string;
  }>;
}

/**
 * Preparar dados para exportação
 */
export function prepareExportData(groupedTransactions: ExportTransactionGroup[]): ExportData[] {
  const exportData: ExportData[] = [];
  
  groupedTransactions.forEach(group => {
    // Adicionar transações regulares
    group.transactions.forEach(t => {
      exportData.push({
        Data: formatDate(t.data_transacao),
        Tipo: 'Receita',
        Descrição: t.descricao,
        Categoria: t.categoria,
        Valor: t.valor,
        Status: t.status
      });
    });
    
    // Adicionar despesas
    group.despesas.forEach(d => {
      exportData.push({
        Data: formatDate(d.data_transacao),
        Tipo: 'Despesa',
        Descrição: d.descricao,
        Categoria: d.categoria || '',
        Valor: d.valor,
        Status: d.status
      });
    });
  });

  return exportData;
}

/**
 * Exporta uma lista de transações para um arquivo Excel (XLSX).
 * @param {any[]} data - Os dados a serem exportados.
 * @param {string} filename - O nome do arquivo sem a extensão.
 *
 * @DIRETRIZ DE SEGURANÇA: A funcionalidade de exportação para Excel foi temporariamente
 * desativada em [Data da Modificação] devido a uma vulnerabilidade de segurança de
 * "Prototype Pollution" (GHSA-4r6h-8v6p-xvw6) na biblioteca 'xlsx' (v0.18.5).
 * Não há uma correção disponível até o momento.
 *
 * Para reativar, remova os comentários deste bloco de código e da importação de 'XLSX'
 * assim que uma versão segura da biblioteca for publicada e atualizada no projeto.
 */
export const exportToExcel = (data: any[], filename: string) => {
  toast({
    title: "Funcionalidade Indisponível",
    description: "A exportação para Excel está temporariamente desativada por motivos de segurança. Por favor, tente a exportação para CSV.",
    variant: "destructive",
  });

  /*
  if (!Array.isArray(data) || data.length === 0) {
    toast({
      title: "Nenhum dado para exportar",
      description: "Não há informações para gerar o arquivo Excel.",
      variant: "destructive"
    });
    return;
  }

  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `${filename}.xlsx`);
    
  } catch (error) {
    console.error("Erro ao exportar para Excel:", error);
    toast({
      title: "Erro na Exportação",
      description: "Não foi possível gerar o arquivo Excel. Tente novamente.",
      variant: "destructive",
    });
  }
  */
};

/**
 * Exportar dados para PDF
 */
export function exportToPDF(exportData: ExportData[], filename: string = 'relatorio-financeiro'): void {
  try {
    const doc = new jsPDF();
    doc.text('Relatório Financeiro', 14, 16);
    
    autoTable(doc, {
      head: [["Data", "Tipo", "Descrição", "Categoria", "Valor", "Status"]],
      body: exportData.map(row => [
        row.Data, 
        row.Tipo, 
        row.Descrição, 
        row.Categoria, 
        row.Valor.toString(), 
        row.Status
      ]),
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 131, 246] }
    });
    
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao exportar relatório PDF');
  }
}

/**
 * Função principal para lidar com exportação
 */
export function handleExportReport(
  format: 'pdf' | 'excel', 
  groupedTransactions: ExportTransactionGroup[],
  filename?: string
): void {
  const exportData = prepareExportData(groupedTransactions);
  
  if (format === 'excel') {
    exportToExcel(exportData, filename);
  } else if (format === 'pdf') {
    exportToPDF(exportData, filename);
  } else {
    throw new Error('Formato de exportação não suportado');
  }
} 