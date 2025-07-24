import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Paperclip } from 'lucide-react';
import { useEmpresa } from '@/hooks/useEmpresa';
import { sanitizeContractContent } from '@/utils/sanitization';

interface ContractData {
  clientName: string;
  clientEmail: string;
  phoneNumber: string;
  eventType: string;
  eventDate: Date;
  eventLocation?: string;
  price: number;
  downPayment?: number;
  termsAndConditions: string;
}

interface ContractPreviewProps {
  contract: Partial<ContractData>;
  attachments: File[];
}

export const ContractPreview: React.FC<ContractPreviewProps> = ({ contract, attachments }) => {
  // Hook para buscar configurações da empresa
  const { configuracoes } = useEmpresa();
  
  // Nome do fotógrafo vem das configurações da empresa com fallback
  const nomeFotografo = configuracoes?.nome_empresa || '[Nome do Fotógrafo]';
  
  const eventTypeMap: Record<string, string> = {
    'casamento': 'Casamento',
    'aniversario': 'Aniversário',
    'ensaio': 'Ensaio Fotográfico',
    'evento_corporativo': 'Evento Corporativo',
    'outro': 'Outro'
  };

  const formattedEventDate = contract.eventDate 
    ? format(contract.eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '';
  const formattedPrice = contract.price 
    ? contract.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '0';
  const formattedDownPayment = contract.downPayment 
    ? contract.downPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
    : '0';
  const todayDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    return (
    <div className="border rounded-lg p-6 bg-contract-bg shadow-sm text-white">
      <div className="max-h-[60vh] overflow-y-auto px-4 py-2">
          <div className="space-y-6">
            <section>
            <div className="whitespace-pre-wrap text-sm text-gray-200">
              <style dangerouslySetInnerHTML={{
                __html: `
                  .contract-content {
                    white-space: pre-wrap;
                    line-height: 1.6;
                  }
                  /* Centralizar título do contrato */
                  .contract-content::first-line {
                    text-align: center;
                    font-weight: bold;
                    display: block;
                    margin-bottom: 1rem;
                  }
                  /* Centralizar qualquer linha que contenha "CONTRATO" em maiúsculas */
                  .contract-content {
                    text-align: left;
                  }
                  .contract-title {
                    text-align: center !important;
                    font-weight: bold;
                    margin: 1rem 0;
                    display: block;
                  }
                  .contract-signatures {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center !important;
                    margin: 3rem auto;
                    padding: 2rem 0;
                    width: 100%;
                    max-width: 600px;
                  }
                  .signature-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 1.5rem 0;
                    width: 100%;
                  }
                  .signature-line {
                    border-bottom: 1px solid #9CA3AF;
                    width: 350px;
                    margin: 0 auto 0.5rem auto;
                    height: 1px;
                  }
                  .signature-name {
                    font-weight: 500;
                    margin: 0.5rem 0 0.25rem 0;
                    text-align: center;
                  }
                  .signature-role {
                    font-size: 0.875rem;
                    color: #D1D5DB;
                    margin: 0;
                    text-align: center;
                  }
                `
              }} />
              
              {(() => {
                const contractText = contract.termsAndConditions || '[Termos e Condições]';
                
                // Regex para capturar as assinaturas (últimas 6 linhas do padrão)
                const signatureRegex = /\n\n______________________________________________________\n([^\n]+)\n([^\n]+)\n\n______________________________________________________\n([^\n]+)\n([^\n]+)$/;
                const match = contractText.match(signatureRegex);
                
                // Usar função segura de sanitização
                const processContractTitle = (text: string) => sanitizeContractContent(text);
                
                if (match) {
                  // Separar o conteúdo principal das assinaturas
                  const mainContent = contractText.replace(signatureRegex, '');
                  const [, clientName, clientRole, photographerName, photographerRole] = match;
                  
                  return (
                    <>
                      <div 
                        className="contract-content"
                        dangerouslySetInnerHTML={{ 
                          __html: processContractTitle(mainContent)
                        }}
                      />
                      
                      <div className="contract-signatures">
                        <div className="signature-block">
                          <div className="signature-line"></div>
                          <div className="signature-name">{clientName}</div>
                          <div className="signature-role">{clientRole}</div>
                        </div>
                        
                        <div className="signature-block">
                          <div className="signature-line"></div>
                          <div className="signature-name">{photographerName}</div>
                          <div className="signature-role">{photographerRole}</div>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  // Fallback se não encontrar o padrão de assinaturas
                  return (
                    <div 
                      className="contract-content"
                      dangerouslySetInnerHTML={{ 
                        __html: processContractTitle(contractText)
                      }}
                    />
                  );
                }
              })()}
            </div>
          </section>
          
          {attachments.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold border-b border-gray-400 pb-2 mb-3 text-white">ANEXOS</h3>
              <ul className="space-y-1">
                {attachments.map((file, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-200">
                    <Paperclip size={14} className="text-gray-300" />
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
