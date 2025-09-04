
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, Printer, Eye, Copy, Check } from "lucide-react";
import { contractsService } from "@/services/contractsService";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import type { ContractData } from "@/types/contract";
import ContractPreviewModal from "@/components/contratos/ContractPreviewModal";
import { useState } from "react";
import { sanitizeHtml } from "@/utils/sanitize";

interface ContractContentProps {
  termsAndConditions: string;
}

const ContractContent = ({ termsAndConditions }: ContractContentProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(termsAndConditions);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Conteúdo do Contrato</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={handleCopyContent}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <div 
        className="whitespace-pre-wrap text-sm border p-4 rounded-md max-h-[500px] overflow-y-auto bg-muted/20" 
        style={{ 
          whiteSpace: 'pre-wrap', 
          wordWrap: 'break-word', 
          lineHeight: '1.6',
          fontFamily: 'inherit',
          overflowWrap: 'break-word'
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            .contract-content {
              white-space: pre-wrap;
              line-height: 1.6;
            }
            /* Centralizar título do contrato */
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
              margin: 3rem auto 1rem auto;
              padding: 2rem 1rem 0.5rem 1rem;
              width: 100%;
              max-width: 600px;
            }
            .signature-block {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 1.5rem 0;
              width: 100%;
              max-width: 400px;
            }
            .signature-block:first-child {
              margin-bottom: 3rem;
            }
            .signature-block:last-child {
              margin-bottom: 0;
            }
            .signature-line {
              border-bottom: 1px solid #9CA3AF;
              width: 100%;
              max-width: 350px;
              min-width: 250px;
              margin: 0 auto 0.5rem auto;
              height: 1px;
            }
            .signature-name {
              font-weight: 500;
              margin: 0.5rem 0 0.25rem 0;
              text-align: center;
              font-size: 1rem;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .signature-role {
              font-size: 0.875rem;
              color: #6B7280;
              margin: 0;
              text-align: center;
              font-weight: 400;
            }
            
            /* Responsividade para dispositivos móveis */
            @media (max-width: 768px) {
              .contract-signatures {
                padding: 1.5rem 0.5rem;
                margin: 2rem auto;
              }
              .signature-block {
                margin: 1.5rem 0;
                max-width: 100%;
              }
              .signature-line {
                min-width: 200px;
                max-width: 300px;
              }
              .signature-name {
                font-size: 0.95rem;
                padding: 0 0.5rem;
              }
              .signature-role {
                font-size: 0.8rem;
              }
            }
            
            @media (max-width: 480px) {
              .contract-signatures {
                padding: 1rem 0.25rem;
                margin: 1.5rem auto;
              }
              .signature-block {
                margin: 1rem 0;
              }
              .signature-line {
                min-width: 180px;
                max-width: 250px;
              }
              .signature-name {
                font-size: 0.9rem;
                padding: 0 0.25rem;
              }
              .signature-role {
                font-size: 0.75rem;
              }
            }
          `
        }} />
        
        {(() => {
          // Regex para capturar as assinaturas (últimas 6 linhas do padrão)
          const signatureRegex = /\n\n______________________________________________________\n([^\n]+)\n([^\n]+)\n\n______________________________________________________\n([^\n]+)\n([^\n]+)$/;
          const match = termsAndConditions.match(signatureRegex);
          
          // Usar função segura de sanitização
          const processContractTitle = (text: string) => sanitizeHtml(text);
          
          if (match) {
            // Separar o conteúdo principal das assinaturas
            const mainContent = termsAndConditions.replace(signatureRegex, '');
            const [, clientName, clientRole, photographerName, photographerRole] = match;
            
            return (
              <>
                <div 
                  className="contract-content"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(processContractTitle(mainContent))
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
                  __html: sanitizeHtml(processContractTitle(termsAndConditions))
                }}
              />
            );
          }
        })()}
      </div>
    </div>
  );
};

export default ContractContent;
