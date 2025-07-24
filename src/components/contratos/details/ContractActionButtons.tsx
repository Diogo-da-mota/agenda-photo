import React from 'react';
import { Send, Download, Copy, X, FileSignature, RefreshCw, ArrowLeft, Files } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyLink } from '@/hooks/useCopyLink';
import { generateContractPdf } from '@/utils/contractPdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface ContractActionButtonsProps {
  contractId: string;
  contractStatus: string;
  onResend: () => void;
  onCancel: () => void;
  onSign: () => void;
  onDownload: () => void;
  onRenew: () => void;
  onBack: () => void;
  onCopyContract?: () => void;
}

const ContractActionButtons = ({ contractId, contractStatus, onResend, onCancel, onSign, onDownload, onRenew, onBack, onCopyContract }: ContractActionButtonsProps) => {
  const { toast } = useToast();
  const { copyContractLink } = useCopyLink();
  const handleDownload = () => {
    try {
      const contractData = {
        contractId: contractId,
        contractStatus: contractStatus,
        clientData: {
          nome: "Ana Silva",
          telefone: "(11) 99999-9999",
          email: "ana.silva@email.com",
          tipoEvento: "Casamento"
        },
        eventoData: {
          data: "15/06/2024",
          local: "Salão de Festas Villa Real"
        },
        pagamentoData: {
          valorTotal: "R$ 15.000,00",
          sinal: "R$ 5.000,00",
          valorRestante: "R$ 10.000,00"
        },
        conteudoContrato: ``,
        includeSignature: contractStatus === 'assinado',
        signatureDate: contractStatus === 'assinado' ? new Date().toLocaleDateString('pt-BR') : undefined,
        nomeContratado: contractStatus === 'assinado' ? "Ana Silva" : undefined
      };

      generateContractPdf(contractData);
      
      toast({
        title: "Download iniciado",
        description: "O contrato está sendo baixado em formato PDF.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {contractStatus === 'pendente' ? (
        <>
          <Button onClick={onCancel} variant="destructive">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={onSign}>
            <FileSignature className="h-4 w-4 mr-2" />
            Assinar
          </Button>
        </>
      ) : null}
      
      {contractStatus === 'assinado' ? (
        <>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => copyContractLink(contractId)}
          >
            <Copy className="h-4 w-4" />
            Copiar Link
          </Button>
          {onCopyContract && (
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={onCopyContract}
            >
              <Files className="h-4 w-4" />
              Copiar Contrato
            </Button>
          )}
        </>
      ) : null}
      
      {contractStatus === 'expirado' ? (
        <Button onClick={onRenew} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Renovar
        </Button>
      ) : null}
      
      <Button onClick={onBack} variant="ghost">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
    </div>
  );
};

export default ContractActionButtons;
