/**
 * Versão alternativa do gerador de recibo usando apenas APIs nativas do navegador
 * Não requer dependências externas como html2canvas ou jspdf
 */

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
  logo?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  cnpj?: string | null;
}

const defaultCompanyInfo: CompanyInfo = {
  nome: "Bright Spark",
  telefone: "(11) 99999-9999",
  email: "contato@brightspark.com",
  website: "www.brightspark.com"
};

/**
 * Gera um recibo profissional em HTML para impressão
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

  const formatPhone = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos (padrão brasileiro com DDD) - formato (00)0 0000-0000
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }
    // Verifica se tem 10 dígitos (número fixo com DDD) - formato (00) 0000-0000
    else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    // Se não estiver no padrão esperado, retorna o original
    return phone;
  };

  const formatCPF = (cpf: string) => {
    // Remove todos os caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos (padrão CPF) - formato 000.000.000-00
    if (cleanCPF.length === 11) {
      return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    // Se não estiver no padrão esperado, retorna o original
    return cpf;
  };

  const formatCNPJ = (cnpj: string) => {
    // Remove todos os caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos (padrão CNPJ) - formato 00.000.000/0000-00
    if (cleanCNPJ.length === 14) {
      return cleanCNPJ.substring(0,2) + '.' + 
             cleanCNPJ.substring(2,5) + '.' + 
             cleanCNPJ.substring(5,8) + '/' + 
             cleanCNPJ.substring(8,12) + '-' + 
             cleanCNPJ.substring(12,14);
    }
    // Se não estiver no padrão esperado, retorna o original
    return cnpj;
  };

  const formatCPFOrCNPJ = (document: string) => {
    // Remove todos os caracteres não numéricos
    const cleanDocument = document.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos (CPF) - formato 000.000.000-00
    if (cleanDocument.length === 11) {
      return cleanDocument.substring(0,3) + '.' + 
             cleanDocument.substring(3,6) + '.' + 
             cleanDocument.substring(6,9) + '-' + 
             cleanDocument.substring(9,11);
    }
    // Verifica se tem 14 dígitos (CNPJ) - formato 00.000.000/0000-00
    else if (cleanDocument.length === 14) {
      return cleanDocument.substring(0,2) + '.' + 
             cleanDocument.substring(2,5) + '.' + 
             cleanDocument.substring(5,8) + '/' + 
             cleanDocument.substring(8,12) + '-' + 
             cleanDocument.substring(12,14);
    }
    // Se não estiver no padrão esperado, retorna o original
    return document;
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --background: #ffffff;
          --foreground: #0f172a;
          --primary: #3b82f6;
          --primary-foreground: #ffffff;
          --secondary: #f1f5f9;
          --secondary-foreground: #1e293b;
          --muted: #f1f5f9;
          --muted-foreground: #64748b;
          --accent: #f8fafc;
          --accent-foreground: #0f172a;
          --destructive: #ef4444;
          --destructive-foreground: #ffffff;
          --border: #e2e8f0;
          --input: #e2e8f0;
          --ring: #3b82f6;
          --radius: 0.75rem;
          --success: #10b981;
          --warning: #f59e0b;
          
          /* Enhanced colors */
          --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
          --header-bg: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          --header-overlay: radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.12) 0%, transparent 50%), 
                            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.12) 0%, transparent 50%);
          --card-hover-transform: translateY(-2px);
          --card-hover-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
          --gradient-bar: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: var(--foreground);
          background: var(--background);
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .receipt-container {
          background: var(--background);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: var(--card-shadow);
          position: relative;
          isolation: isolate;
        }

        .receipt-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: var(--gradient-bar);
          z-index: 10;
        }

        .header {
          background: var(--header-bg);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .header::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: var(--header-overlay);
          z-index: 1;
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .company-logo {
          width: 90px;
          height: 90px;
          margin: 0 auto 20px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          color: var(--primary);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
        }

        .company-logo::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
          border-radius: 50%;
        }

        .company-name {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
          background: linear-gradient(to right, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .company-info {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.5;
          font-weight: 400;
        }

        .social-links {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 13px;
          opacity: 0.9;
          flex-wrap: wrap;
        }

        .social-links span {
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: transform 0.2s ease;
        }

        .social-links span:hover {
          transform: translateY(-2px);
        }

        .receipt-title {
          background: var(--background);
          padding: 24px 30px;
          text-align: center;
          border-bottom: 1px solid var(--border);
          position: relative;
        }

        .receipt-title h2 {
          color: var(--foreground);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin: 0;
          position: relative;
          display: inline-block;
        }

        .receipt-title h2::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary);
          border-radius: 3px;
          transform: scaleX(0.6);
          opacity: 0.7;
        }

        .content {
          padding: 30px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          color: var(--foreground);
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--primary);
          display: inline-block;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 40%;
          height: 2px;
          background: var(--success);
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .info-item {
          background: var(--accent);
          padding: 16px;
          border-radius: var(--radius);
          border-left: 4px solid var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .info-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
          z-index: 0;
        }

        .info-item:hover {
          transform: var(--card-hover-transform);
          box-shadow: var(--card-hover-shadow);
        }

        .info-label {
          font-size: 12px;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .info-value {
          font-size: 16px;
          color: var(--foreground);
          font-weight: 600;
          position: relative;
          z-index: 1;
        }

        .financial-summary {
          background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
          padding: 30px;
          border-radius: var(--radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin: 30px 0;
          position: relative;
          overflow: hidden;
        }

        .financial-summary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
          z-index: 1;
        }

        .financial-content {
          position: relative;
          z-index: 2;
        }

        .financial-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(30, 41, 59, 0.1);
        }

        .financial-row:last-child {
          border-bottom: none;
          font-weight: 700;
          font-size: 18px;
          color: var(--foreground);
          padding-top: 20px;
          margin-top: 8px;
          border-top: 2px solid var(--primary);
        }

        .financial-label {
          color: var(--secondary-foreground);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .financial-value {
          font-weight: 600;
        }

        .valor-pago {
          color: var(--success);
        }

        .valor-restante {
          color: var(--destructive);
        }

        .observacoes {
          background: #fffbeb;
          border-radius: var(--radius);
          padding: 20px;
          margin-top: 25px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          position: relative;
          border-left: 4px solid var(--warning);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .observacoes:hover {
          transform: var(--card-hover-transform);
          box-shadow: var(--card-hover-shadow);
        }

        .observacoes-title {
          color: #b45309;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .observacoes-title::before {
          content: '📝';
          font-size: 18px;
        }

        .observacoes-text {
          color: #92400e;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-line;
        }

        .footer {
          background: var(--secondary);
          padding: 24px;
          text-align: center;
          border-top: 1px solid var(--border);
          margin-top: 30px;
          font-size: 13px;
          color: var(--muted-foreground);
          position: relative;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 1px;
          background: var(--primary);
        }

        .timestamp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .timestamp::before {
          content: '🕒';
          font-size: 14px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .status-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .status-badge::before {
          margin-right: 6px;
          font-size: 14px;
        }

        .status-pago {
          background: #dcfce7;
          color: #16a34a;
        }

        .status-pago::before {
          content: '✅';
        }

        .status-parcial {
          background: #fef3c7;
          color: #d97706;
        }

        .status-parcial::before {
          content: '⚠️';
        }

        .status-pendente {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-pendente::before {
          content: '❌';
        }

        .icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 6px;
          font-size: 14px;
        }

        .no-print {
          display: block;
        }

        /* Glass effect for cards */
        .glass-card {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        @media print {
          body {
            padding: 0;
          }
          .receipt-container {
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .header {
            padding: 30px 20px;
          }
          .content {
            padding: 20px;
          }
          .financial-summary {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="header-content">
            ${companyInfo.logo ? `
              <img src="${companyInfo.logo}" alt="Logo" class="company-logo-img" style="width: 90px; height: 90px; margin: 0 auto 20px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" />
            ` : `
              <div class="company-logo">${companyInfo.nome.charAt(0).toUpperCase()}</div>
            `}
            <div class="company-name">${companyInfo.nome}</div>
            <div class="company-info">
              ${formatPhone(companyInfo.telefone)} • ${companyInfo.email}<br>
              ${companyInfo.website}
              ${companyInfo.endereco && companyInfo.cidade && companyInfo.estado && companyInfo.cep ? 
                `<br>${companyInfo.endereco}, ${companyInfo.cidade}, ${companyInfo.estado} - Cep ${companyInfo.cep}${companyInfo.cnpj ? ` CNPJ: ${formatCPFOrCNPJ(companyInfo.cnpj)}` : ''}` : 
                `${companyInfo.cnpj ? `<br>CPF/CNPJ: ${formatCPFOrCNPJ(companyInfo.cnpj)}` : ''}${companyInfo.endereco ? `<br>${companyInfo.endereco}` : ''}${companyInfo.cidade && companyInfo.estado ? `<br>${companyInfo.cidade}, ${companyInfo.estado}` : ''}${companyInfo.cep ? ` - ${companyInfo.cep}` : ''}`
              }
            </div>
            ${(companyInfo.instagram || companyInfo.facebook || companyInfo.whatsapp) ? `
              <div class="social-links">
                ${companyInfo.instagram ? `
                  <span>📱 Instagram: ${companyInfo.instagram}</span>
                ` : ''}
                ${companyInfo.facebook ? `
                  <span>👥 Facebook: ${companyInfo.facebook}</span>
                ` : ''}
                ${companyInfo.whatsapp ? `
                  <span>💬 WhatsApp: ${formatPhone(companyInfo.whatsapp)}</span>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="receipt-title">
          <h2>RECIBO DE PAGAMENTO</h2>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <span class="icon">👤</span>Nome do Cliente
                </div>
                <div class="info-value">${receiptData.clienteNome}</div>
              </div>
              ${receiptData.clienteTelefone ? `
                <div class="info-item">
                  <div class="info-label">
                    <span class="icon">📞</span>Telefone
                  </div>
                  <div class="info-value">${formatPhone(receiptData.clienteTelefone)}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Dados do Evento</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">
                  <span class="icon">🎉</span>Tipo de Evento
                </div>
                <div class="info-value">${receiptData.eventoTipo}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <span class="icon">📅</span>Data
                </div>
                <div class="info-value">${formatDate(receiptData.data)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">
                  <span class="icon">⏰</span>Horário
                </div>
                <div class="info-value">${receiptData.horario}</div>
              </div>
              ${receiptData.enderecoEvento ? `
                <div class="info-item">
                  <div class="info-label">
                    <span class="icon">📍</span>Local
                  </div>
                  <div class="info-value">${receiptData.enderecoEvento}</div>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="financial-summary glass-card">
            <div class="financial-content">
              <div class="financial-row">
                <span class="financial-label">
                  <span class="icon">💰</span>Valor Total do Evento:
                </span>
                <span class="financial-value">${formatCurrency(receiptData.valor)}</span>
              </div>
              <div class="financial-row">
                <span class="financial-label">
                  <span class="icon">✅</span>Valor Pago:
                </span>
                <span class="financial-value valor-pago">${formatCurrency(receiptData.valorPago)}</span>
              </div>
              <div class="financial-row">
                <span class="financial-label">
                  <span class="icon">⚠️</span>Valor Restante:
                </span>
                <span class="financial-value valor-restante">${formatCurrency(receiptData.valorRestante)}</span>
              </div>
              <div class="financial-row">
                <span class="financial-label">Status do Pagamento:</span>
                <span class="status-badge ${
                  receiptData.valorRestante === 0 ? 'status-pago' : 
                  receiptData.valorPago > 0 ? 'status-parcial' : 'status-pendente'
                }">
                  ${receiptData.valorRestante === 0 ? '✅ Pago' : 
                    receiptData.valorPago > 0 ? '⚠️ Parcial' : '❌ Pendente'}
                </span>
              </div>
            </div>
          </div>

          ${receiptData.observacoes ? `
            <div class="observacoes">
              <div class="observacoes-title">
                <span class="icon">📝</span>Observações
              </div>
              <div class="observacoes-text">${receiptData.observacoes}</div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="timestamp">
            <span class="icon">🕒</span>
            Recibo gerado em: ${agora}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Gera e exibe recibo para impressão usando window.print()
 */
export const generateAndPrintReceipt = (
  receiptData: ReceiptData,
  companyInfo?: CompanyInfo
): void => {
  const html = generateReceiptHTML(receiptData, companyInfo);
  
  // Criar uma nova janela para impressão
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.');
  }

  // Escrever o HTML na nova janela
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Aguardar carregamento e iniciar impressão
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Opcional: fechar a janela após impressão
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 250);
  };
};

/**
 * Gera recibo e salva como blob para download
 */
export const generateReceiptBlob = (
  receiptData: ReceiptData,
  companyInfo?: CompanyInfo
): Blob => {
  const html = generateReceiptHTML(receiptData, companyInfo);
  return new Blob([html], { type: 'text/html;charset=utf-8' });
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
  
  const mensagem = encodeURIComponent(
    `Olá ${clienteNome}! 😊\n\n` +
    `Aqui está o recibo do seu ${eventoTipo}.\n\n` +
    `Obrigado por confiar em nossos serviços! 🎉\n\n` +
    `*Bright Spark* - Transformando momentos em memórias especiais ✨`
  );

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
 * Baixa o recibo como arquivo HTML
 */
export const downloadReceiptHTML = (
  receiptData: ReceiptData,
  companyInfo?: CompanyInfo
): void => {
  try {
    const htmlBlob = generateReceiptBlob(receiptData, companyInfo);
    
    // Criar URL temporária para download
    const url = URL.createObjectURL(htmlBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo-${receiptData.eventoId}-${Date.now()}.html`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar URL temporária
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar recibo HTML:', error);
    throw error;
  }
};

/**
 * Formata um número de telefone brasileiro para o padrão (00)0 0000-0000
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos (padrão brasileiro com DDD) - formato (00)0 0000-0000
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
  }
  // Verifica se tem 10 dígitos (número fixo com DDD) - formato (00) 0000-0000
  else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  // Se não estiver no padrão esperado, retorna o original
  return phone;
};

/**
 * Formata um CPF brasileiro para o padrão 000.000.000-00
 */
export const formatCPF = (cpf: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos (padrão CPF) - formato 000.000.000-00
  if (cleanCPF.length === 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  // Se não estiver no padrão esperado, retorna o original
  return cpf;
};

/**
 * Formata um CNPJ brasileiro para o padrão 00.000.000/0000-00
 */
export const formatCNPJ = (cnpj: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos (padrão CNPJ) - formato 00.000.000/0000-00
  if (cleanCNPJ.length === 14) {
    return cleanCNPJ.substring(0,2) + '.' + 
           cleanCNPJ.substring(2,5) + '.' + 
           cleanCNPJ.substring(5,8) + '/' + 
           cleanCNPJ.substring(8,12) + '-' + 
           cleanCNPJ.substring(12,14);
  }
  // Se não estiver no padrão esperado, retorna o original
  return cnpj;
};

/**
 * Formata automaticamente CPF (11 dígitos) ou CNPJ (14 dígitos)
 */
export const formatCPFOrCNPJ = (document: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanDocument = document.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos (CPF) - formato 000.000.000-00
  if (cleanDocument.length === 11) {
    return cleanDocument.substring(0,3) + '.' + 
           cleanDocument.substring(3,6) + '.' + 
           cleanDocument.substring(6,9) + '-' + 
           cleanDocument.substring(9,11);
  }
  // Verifica se tem 14 dígitos (CNPJ) - formato 00.000.000/0000-00
  else if (cleanDocument.length === 14) {
    return cleanDocument.substring(0,2) + '.' + 
           cleanDocument.substring(2,5) + '.' + 
           cleanDocument.substring(5,8) + '/' + 
           cleanDocument.substring(8,12) + '-' + 
           cleanDocument.substring(12,14);
  }
  // Se não estiver no padrão esperado, retorna o original
  return document;
};
