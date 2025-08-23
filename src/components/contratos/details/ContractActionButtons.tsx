import React from 'react';
import { Send, Download, Copy, X, FileSignature, RefreshCw, ArrowLeft, Files, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCopyLink } from '@/hooks/useCopyLink';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from '../ContractForm';
import { generateContractUrl } from '@/utils/slugify';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Contract {
  id: string;
  status: string;
  clientName: string;
  tipo_evento?: string;
  id_amigavel?: number;
  nome_cliente?: string;
  signatureInfo?: {
    name: string;
    timestamp: string;
  };
}

interface ContractActionButtonsProps {
  contractId: string;
  contractStatus: string;
  contract: Contract;
  onResend: () => void;
  onCancel: () => void;
  onSign: () => void;
  onDownload: () => void;
  onRenew: () => void;
  onBack: () => void;
  onCopyContract?: () => void;
}

const ContractActionButtons = ({ contractId, contractStatus, contract, onResend, onCancel, onSign, onDownload, onRenew, onBack, onCopyContract }: ContractActionButtonsProps) => {
  const { toast } = useToast();
  const { copyContractLink } = useCopyLink();
  const { configuracoes } = useEmpresa();
  const navigate = useNavigate();
  
  const handleViewSite = () => {
    navigate('/agenda/cliente-contratos');
  };
  
  const handleDownload = async () => {
    try {
      if (!contract || !configuracoes) {
        toast({
          title: "Erro",
          description: "Dados do contrato não disponíveis.",
          variant: "destructive",
        });
        return;
      }

      // Gera o conteúdo completo do contrato usando o template
      const conteudoContrato = generateContractTemplate(contract, configuracoes);

      const pdfData = {
        conteudoContrato,
        includeSignature: contract.status === 'assinado',
        signatureDate: contract.status === 'assinado' && contract.signatureInfo ? 
          format(new Date(contract.signatureInfo.timestamp), "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: configuracoes.nome_empresa || 'Bright Spark Photography',
        clientName: contract.status === 'assinado' ? contract.signatureInfo?.name : contract.clientName
      };

      // Gera o PDF e faz o download
      const pdfBlob = await generateContractPdf(pdfData);
      downloadBlob(pdfBlob, `contrato-${contractId}.pdf`);
      
      toast({
        title: "Download iniciado",
        description: "O contrato está sendo baixado.",
      });
    } catch (error) {
      console.error('Erro ao fazer download do contrato:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o contrato. Tente novamente.",
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
          <Button onClick={onResend} variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Reenviar
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => {
              if (contract.id_amigavel && contract.nome_cliente) {
                copyContractLink({
                  id_contrato: contractId,
                  id_amigavel: contract.id_amigavel,
                  nome_cliente: contract.nome_cliente
                });
              } else {
                copyContractLink(contractId, contract.tipo_evento);
              }
            }}
          >
            <Copy className="h-4 w-4" />
            Copiar Link
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handleViewSite}
          >
            <ExternalLink className="h-4 w-4" />
            Ver Site
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
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
