import { jsPDF } from 'jspdf';

export interface ContractPdfOptions {
  conteudoContrato: string;
  includeSignature?: boolean;
  signatureDate?: string;
  nomeContratado?: string;
  clientName?: string; // Apenas para assinatura, se necessário
}

/**
 * Gera um PDF do contrato contendo APENAS o conteúdo legal do contrato
 * Remove dados sensíveis como informações pessoais, financeiras e do evento
 */
export const generateContractPdf = (options: ContractPdfOptions): Blob => {
  const {
    conteudoContrato,
    includeSignature = false,
    signatureDate = '',
    nomeContratado = 'Agenda Pro',
    clientName = ''
  } = options;

  // Criar nova instância do PDF
  const doc = new jsPDF();
  
  // Configurações de página - Otimizado com rodapé mais baixo
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 18; // 1cm = aproximadamente 28 pontos
  const lineHeight = 5;
  const footerHeight = 5; // Reduzido para aproveitar melhor o espaço com rodapé mais baixo
  const maxContentHeight = pageHeight - margin - footerHeight;
  
  // Título simples - sem dados sensíveis
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", pageWidth/2, margin, { align: "center" });
  
  let currentY = margin + lineHeight * 3; // Reduzido de 4 para 3 para economizar espaço
  
  // Detectar e separar assinaturas do conteúdo principal
  const signatureRegex = /\n\n______________________________________________________\n([^\n]+)\n([^\n]+)\n\n______________________________________________________\n([^\n]+)\n([^\n]+)$/;
  const signatureMatch = conteudoContrato.match(signatureRegex);
  
  let mainContent = conteudoContrato;
  let signatures = null;
  
  if (signatureMatch) {
    // Separar conteúdo principal das assinaturas
    mainContent = conteudoContrato.replace(signatureRegex, '');
    signatures = {
      clientName: signatureMatch[1],
      clientRole: signatureMatch[2],
      photographerName: signatureMatch[3],
      photographerRole: signatureMatch[4]
    };
  }
  
  // Conteúdo do contrato - ÚNICO conteúdo que deve aparecer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  // Função para quebrar o texto em múltiplas linhas
  const splitText = doc.splitTextToSize(mainContent, pageWidth - margin * 2);
  
  // Implementar paginação automática
  for (let i = 0; i < splitText.length; i++) {
    // Verificar se precisa de nova página
    if (currentY + lineHeight > maxContentHeight) {
      // Nova página (sem rodapé nas páginas intermediárias)
      doc.addPage();
      currentY = margin;
      
      // Resetar cor do texto
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }
    
    // Adicionar linha de texto
    doc.text(splitText[i], margin, currentY);
    currentY += lineHeight;
  }
  
  // Renderizar assinaturas centralizadas se detectadas
  if (signatures) {
    // Espaço antes das assinaturas - aumentado para dar mais espaço visual
    currentY += lineHeight * 3.5;
    
    // Verificar se há espaço suficiente para as assinaturas (aproximadamente 55 pontos)
    const signatureSpaceNeeded = 55;
    if (currentY + signatureSpaceNeeded > maxContentHeight) {
      // Nova página para assinaturas (sem rodapé na página anterior)
      doc.addPage();
      currentY = margin + lineHeight;
    }
    
    // Resetar formatação
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Primeira assinatura (Contratante) - CENTRALIZADA
    const lineWidth = 120;
    const lineX = (pageWidth - lineWidth) / 2;
    
    // Linha de assinatura 1
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(.5);
    doc.line(lineX, currentY, lineX + lineWidth, currentY);
    currentY += lineHeight * 1.5;
    
    // Nome do contratante - CENTRALIZADO
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(signatures.clientName, pageWidth / 2, currentY, { align: "center" });
    currentY += lineHeight;
    
    // Papel do contratante - CENTRALIZADO
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(signatures.clientRole, pageWidth / 2, currentY, { align: "center" });
    currentY += lineHeight * 4.5; // Aumentado para dar mais espaço entre as assinaturas
    
    // Segunda assinatura (Contratado) - CENTRALIZADA
    // Linha de assinatura 2
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(lineX, currentY, lineX + lineWidth, currentY);
    currentY += lineHeight * 1.5;
    
    // Nome do contratado - CENTRALIZADO
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(signatures.photographerName, pageWidth / 2, currentY, { align: "center" });
    currentY += lineHeight;
    
    // Papel do contratado - CENTRALIZADO
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(signatures.photographerRole, pageWidth / 2, currentY, { align: "center" });
    currentY += lineHeight * 1; // Otimizado de 1.5 para 1
  }
  
  // Adicionar informações de assinatura para contratos assinados
  if (includeSignature && clientName) {
    // Espaço adicional antes da assinatura - otimizado
    currentY += lineHeight * 1;
    
    // Verificar se há espaço suficiente para a seção de assinatura (aproximadamente 45 pontos)
    const signatureSpaceNeeded = 45;
    if (currentY + signatureSpaceNeeded > maxContentHeight) {
      // Nova página para assinatura (sem rodapé na página anterior)
      doc.addPage();
      currentY = margin;
    }
    
    // Resetar formatação
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Assinatura Digital", margin, currentY);
    currentY += lineHeight * 1.2; // Otimizado de 1.5 para 1.2
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Contrato assinado digitalmente por ${clientName}`, margin, currentY);
    currentY += lineHeight * 1; // Otimizado de 1.2 para 1
    
    doc.text(`Data da assinatura: ${signatureDate || new Date().toLocaleDateString('pt-BR')}`, margin, currentY);
    currentY += lineHeight * 1.2; // Otimizado de 1.5 para 1.2
    
    // Adicionar "carimbo" de assinatura
    doc.setDrawColor(66, 133, 244);
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY, 100, 25);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(66, 133, 244);
    doc.text("DOCUMENTO ASSINADO DIGITALMENTE", margin + 50, currentY + 12.5, { align: "center" });
    
    // Atualizar posição Y após o carimbo
    currentY += 25;
  }
  
  // Rodapé final na última página - posicionado mais baixo (10 pontos da borda)
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`${nomeContratado} - Agenda Pro 2025`, pageWidth / 2, pageHeight - 10, { align: "center" });
  
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
