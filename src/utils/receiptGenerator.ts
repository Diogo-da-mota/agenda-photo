import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { processEmojisForWhatsApp, encodeTextWithEmojisForURL } from './emojiUtils';

export interface ReceiptData {
  eventoId: string;
  clienteNome: string;
  clienteTelefone?: string;
  eventoTipo: string;
  data: string;
  horario: string;
  valor: number;
  valorPago: number;
  valorRestante: number;
  observacoes?: string;
  enderecoEvento?: string;
}

export interface CompanyInfo {
  nome: string;
  telefone: string;
  email: string;
  website: string;
  logo?: string;
}

const defaultCompanyInfo: CompanyInfo = {
  nome: "Bright Spark",
  telefone: "(11) 99999-9999",
  email: "contato@brightspark.com",
  website: "www.brightspark.com"
};

/**
 * Formata um número de telefone brasileiro
 */
const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove tudo que não é número
  const numbers = phone.replace(/\D/g, '');
  
  // Se não tem números, retorna vazio
  if (!numbers) return '';
  
  // Aplica a máscara baseada no comprimento
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
  } else {
    // Para celular (11 dígitos): (00) 00000-0000
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * Gera um recibo profissional em HTML
 */
export const generateReceiptHTML = (
  receiptData: ReceiptData,
  companyInfo: CompanyInfo = defaultCompanyInfo
): string => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const agora = new Date().toLocaleString('pt-BR');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recibo - ${receiptData.eventoId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #0f172a;
          background: #ffffff;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .receipt-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #16a34a, #f59e0b);
        }

        .company-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: #3b82f6;
        }

        .company-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .company-info {
          font-size: 14px;
          opacity: 0.9;
        }

        .receipt-title {
          background: #f1f5f9;
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .receipt-title h2 {
          color: #0f172a;
          font-size: 24px;
          font-weight: 600;
        }

        .receipt-number {
          color: #64748b;
          font-size: 14px;
          margin-top: 5px;
        }

        .content {
          padding: 30px;
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          color: #0f172a;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          padding-bottom: 5px;
          border-bottom: 2px solid #3b82f6;
          display: inline-block;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .info-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .info-value {
          font-size: 16px;
          color: #0f172a;
          font-weight: 500;
        }

        .financial-summary {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          margin: 25px 0;
        }

        .financial-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .financial-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #0f172a;
          padding-top: 15px;
          border-top: 2px solid #3b82f6;
        }

        .financial-label {
          color: #475569;
          font-weight: 500;
        }

        .financial-value {
          font-weight: 600;
        }

        .valor-pago {
          color: #16a34a;
        }

        .valor-restante {
          color: #dc2626;
        }

        .observacoes {
          background: #fefce8;
          border: 1px solid #fde047;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }

        .observacoes-title {
          color: #ca8a04;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .observacoes-text {
          color: #854d0e;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-line;
        }

        .footer {
          background: #f1f5f9;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          margin-top: 30px;
        }

        .timestamp {
          color: #64748b;
          font-size: 12px;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-pago {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-parcial {
          background: #fef3c7;
          color: #d97706;
        }

        .status-pendente {
          background: #fee2e2;
          color: #dc2626;
        }

        @media print {
          body {
            padding: 0;
          }
          .receipt-container {
            box-shadow: none;
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="company-logo">BS</div>
          <div class="company-name">${companyInfo.nome}</div>
          <div class="company-info">
            ${formatPhone(companyInfo.telefone)} • ${companyInfo.email}<br>
            ${companyInfo.website}
          </div>
        </div>

        <div class="receipt-title">
          <h2>RECIBO DE PAGAMENTO</h2>
          <div class="receipt-number">Nº ${receiptData.eventoId}</div>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nome do Cliente</div>
                <div class="info-value">${receiptData.clienteNome}</div>
              </div>
              ${receiptData.clienteTelefone ? `
                <div class="info-item">
                  <div class="info-label">Telefone</div>
                  <div class="info-value">${formatPhone(receiptData.clienteTelefone)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Evento</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Tipo de Evento</div>
                <div class="info-value">${receiptData.eventoTipo}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Data</div>
                <div class="info-value">${formatDate(receiptData.data)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Horário</div>
                <div class="info-value">${receiptData.horario}</div>
              </div>
              ${receiptData.enderecoEvento ? `
                <div class="info-item">
                  <div class="info-label">Local</div>
                  <div class="info-value">${receiptData.enderecoEvento}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="financial-summary">
            <div class="financial-row">
              <span class="financial-label">Valor Total do Evento:</span>
              <span class="financial-value">${formatCurrency(receiptData.valor)}</span>
            </div>
            <div class="financial-row">
              <span class="financial-label">Valor Pago:</span>
              <span class="financial-value valor-pago">${formatCurrency(receiptData.valorPago)}</span>
            </div>
            <div class="financial-row">
              <span class="financial-label">Valor Restante:</span>
              <span class="financial-value valor-restante">${formatCurrency(receiptData.valorRestante)}</span>
            </div>
            <div class="financial-row">
              <span class="financial-label">Status do Pagamento:</span>
              <span class="status-badge ${
                receiptData.valorRestante === 0 ? 'status-pago' : 
                receiptData.valorPago > 0 ? 'status-parcial' : 'status-pendente'
              }">
                ${receiptData.valorRestante === 0 ? 'Pago' : 
                  receiptData.valorPago > 0 ? 'Parcial' : 'Pendente'}
              </span>
            </div>
          </div>

          ${receiptData.observacoes ? `
            <div class="observacoes">
              <div class="observacoes-title">Observações:</div>
              <div class="observacoes-text">${receiptData.observacoes}</div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="timestamp">
            Recibo gerado em: ${agora}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Gera um recibo em PDF a partir dos dados do evento
 */
export const generateReceiptPDF = async (
  receiptData: ReceiptData,
  companyInfo?: CompanyInfo
): Promise<Blob> => {
  const html = generateReceiptHTML(receiptData, companyInfo);
  
  // Criar um elemento temporário para renderizar o HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  document.body.appendChild(tempDiv);

  try {
    // Usar html2canvas para capturar o HTML como imagem
    const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
      width: 800,
      height: 1200,
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Criar PDF com jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Adicionar primeira página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adicionar páginas extras se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    // Limpar elemento temporário
    document.body.removeChild(tempDiv);
  }
};

/**
 * Abre o WhatsApp com uma mensagem pré-definida
 */
export const openWhatsAppWithReceipt = (
  telefone: string,
  clienteNome: string,
  eventoTipo: string,
  receiptBlob?: Blob
): void => {
  // Limpar o número de telefone (remover caracteres especiais)
  const numeroLimpo = telefone.replace(/\D/g, '');
  
  // Garantir que tenha o código do país (55 para Brasil)
  const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
  
  const mensagemTexto = 
    `Olá ${clienteNome}! 😊\n\n` +
    `Aqui está o recibo do seu ${eventoTipo}.\n\n` +
    `Obrigado por confiar em nossos serviços! 🎉\n\n` +
    `*Bright Spark* - Transformando momentos em memórias especiais ✨`;

  // Processar emojis para garantir compatibilidade com WhatsApp
  const mensagemProcessada = processEmojisForWhatsApp(mensagemTexto);
  
  // Codificar mensagem preservando emojis
  const mensagem = encodeTextWithEmojisForURL(mensagemProcessada);

  // URL do WhatsApp Web/App
  const whatsappUrl = `https://wa.me/${numeroCompleto}?text=${mensagem}`;
  
  // Abrir em nova aba
  window.open(whatsappUrl, '_blank');

  // TODO: Implementar upload do recibo para um serviço de armazenamento
  // e adicionar o link na mensagem quando disponível
  if (receiptBlob) {
    console.log('Recibo gerado:', receiptBlob);
    // Aqui você pode implementar o upload para um serviço como AWS S3, 
    // Cloudinary, ou armazenar temporariamente no Supabase Storage
  }
};

/**
 * Gera e baixa o recibo como PDF
 */
export const downloadReceiptPDF = async (
  receiptData: ReceiptData,
  companyInfo?: CompanyInfo
): Promise<void> => {
  try {
    const pdfBlob = await generateReceiptPDF(receiptData, companyInfo);
    
    // Criar URL temporária para download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo-${receiptData.eventoId}-${Date.now()}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar URL temporária
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar recibo PDF:', error);
    throw error;
  }
};
