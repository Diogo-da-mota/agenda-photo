import { jsPDF } from 'jspdf';

export interface ClientData {
  nome: string;
  telefone: string;
  email: string;
  tipoEvento: string;
}

export interface EventoData {
  data: string;
  local: string;
}

export interface PagamentoData {
  valorTotal: string;
  sinal: string;
  valorRestante: string;
}

export interface ContractPdfOptions {
  clientData: ClientData;
  eventoData: EventoData;
  pagamentoData: PagamentoData;
  conteudoContrato: string;
  contractId: string;
  contractStatus: string;
  includeSignature?: boolean;
  signatureDate?: string;
  nomeContratado?: string;
}

/**
 * Gera um PDF completo do contrato com todas as informações
 */
export const generateContractPdf = (options: ContractPdfOptions): Blob => {
  const {
    clientData,
    eventoData,
    pagamentoData,
    conteudoContrato,
    contractId,
    contractStatus,
    includeSignature = false,
    signatureDate = '',
    nomeContratado = 'Agenda Pro'
  } = options;

  // Criar nova instância do PDF
  const doc = new jsPDF();
  
  // Configurações de página
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 7;
  
  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`CONTRATO #${contractId}`, pageWidth/2, margin, { align: "center" });
  doc.text(`${clientData.tipoEvento}`, pageWidth/2, margin + lineHeight, { align: "center" });
  
  let y = margin + lineHeight * 3;
  
  // Status do contrato
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Status: ${contractStatus}`, pageWidth - margin, y, { align: "right" });
  doc.text(`Data de exportação: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, y + lineHeight, { align: "right" });
  
  // Seção: Informações do Cliente
  y += lineHeight * 3;
  doc.setFont("helvetica", "bold");
  doc.text("Informações de Contato", margin, y);
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${clientData.nome}`, margin, y);
  y += lineHeight;
  doc.text(`Telefone: ${clientData.telefone}`, margin, y);
  y += lineHeight;
  doc.text(`Email: ${clientData.email}`, margin, y);
  
  // Seção: Detalhes do Evento
  y += lineHeight * 2;
  doc.setFont("helvetica", "bold");
  doc.text("Detalhes do Evento", margin, y);
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${eventoData.data}`, margin, y);
  y += lineHeight;
  doc.text(`Local: ${eventoData.local}`, margin, y);
  
  // Seção: Informações de Pagamento
  y += lineHeight * 2;
  doc.setFont("helvetica", "bold");
  doc.text("Informações de Pagamento", margin, y);
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.text(`Valor Total: ${pagamentoData.valorTotal}`, margin, y);
  y += lineHeight;
  doc.text(`Sinal: ${pagamentoData.sinal}`, margin, y);
  y += lineHeight;
  doc.text(`Valor Restante: ${pagamentoData.valorRestante}`, margin, y);
  
  // Conteúdo do contrato
  y += lineHeight * 2;
  doc.setFont("helvetica", "bold");
  doc.text("Conteúdo do Contrato", margin, y);
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Função para quebrar o texto em múltiplas linhas
  const splitText = doc.splitTextToSize(conteudoContrato, pageWidth - margin * 2);
  doc.text(splitText, margin, y);
  
  // Adicionar informações de assinatura para contratos assinados
  if (includeSignature && contractStatus.toLowerCase() === 'assinado') {
    // Calcular nova posição Y para a assinatura
    const approximateTextHeight = splitText.length * 4;
    let signatureY = y + approximateTextHeight + lineHeight * 3;
    
    // Se ultrapassar o tamanho da página, adiciona nova página
    if (signatureY > 250) {
      doc.addPage();
      signatureY = margin;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Assinatura Digital", margin, signatureY);
    signatureY += lineHeight;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Contrato assinado digitalmente por ${clientData.nome}`, margin, signatureY);
    signatureY += lineHeight;
    
    doc.text(`Data da assinatura: ${signatureDate || new Date().toLocaleDateString('pt-BR')}`, margin, signatureY);
    signatureY += lineHeight;
    
    // Adicionar "carimbo" de assinatura
    doc.setDrawColor(66, 133, 244);
    doc.setLineWidth(0.5);
    doc.rect(margin, signatureY, 100, 25);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 133, 244);
    doc.text("DOCUMENTO ASSINADO DIGITALMENTE", margin + 50, signatureY + 12.5, { align: "center" });
  }
  
  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`${nomeContratado} - Agenda Pro`, pageWidth / 2, 285, { align: "center" });
  
  // Retornar o blob do PDF
  return doc.output('blob');
};

/**
 * Inicia o download de um blob como arquivo
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  // Criar URL do blob
  const url = window.URL.createObjectURL(blob);
  
  // Criar elemento de link
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Adicionar ao DOM e acionar o clique
  document.body.appendChild(link);
  link.click();
  
  // Limpar recursos
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
