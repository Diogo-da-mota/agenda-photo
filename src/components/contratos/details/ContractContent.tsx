
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sanitizeContractContent } from '@/utils/sanitization';

interface ContractContentProps {
  termsAndConditions: string;
}

const ContractContent = ({ termsAndConditions }: ContractContentProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(termsAndConditions);
    setCopied(true);
    toast({
      title: "Conteúdo copiado",
      description: "O conteúdo do contrato foi copiado para a área de transferência.",
    });
    
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
              color: #6B7280;
              margin: 0;
              text-align: center;
            }
          `
        }} />
        
        {(() => {
          // Regex para capturar as assinaturas (últimas 6 linhas do padrão)
          const signatureRegex = /\n\n______________________________________________________\n([^\n]+)\n([^\n]+)\n\n______________________________________________________\n([^\n]+)\n([^\n]+)$/;
          const match = termsAndConditions.match(signatureRegex);
          
          // Usar função segura de sanitização
          const processContractTitle = (text: string) => sanitizeContractContent(text);
          
          if (match) {
            // Separar o conteúdo principal das assinaturas
            const mainContent = termsAndConditions.replace(signatureRegex, '');
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
                  __html: processContractTitle(termsAndConditions)
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
