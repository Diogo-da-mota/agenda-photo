
import React from 'react';
import { ArrowLeft, Send, Download, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCopyLink } from '@/hooks/useCopyLink';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from '../ContractForm';
import { generateContractUrl } from '@/utils/slugify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

import { Contract } from '@/types/contract';

interface ContractHeaderProps {
  contract: Contract;
  handleResend: () => void;
  contractStatus: string;
  contractId: string;
}

const ContractHeader = ({ contract, handleResend, contractStatus, contractId }: ContractHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { copyContractLink } = useCopyLink();
  const { configuracoes } = useEmpresa();
  const nomeContratado = configuracoes?.nome_empresa || '[Nome do Fotógrafo]';
  
  const handleBackToList = () => {
    navigate('/contratos');
  };
    const handleDownload = async () => {
      if (!contract || !configuracoes) return;

      try {
        // Gera o conteúdo completo do contrato usando o template
        const conteudoContrato = generateContractTemplate(contract, configuracoes);

        const pdfData = {
          conteudoContrato,
          includeSignature: contract.status === 'assinado',
          signatureDate: contract.status === 'assinado' && contract.signatureInfo ? format(new Date(contract.signatureInfo.timestamp), "dd/MM/yyyy", { locale: ptBR }) : undefined,
          nomeContratado: configuracoes.nome_empresa || 'Bright Spark Photography',
          clientName: contract.status === 'assinado' ? contract.signatureInfo?.name : contract.clientName
        };

        // Gerar o PDF e fazer o download
        const pdfBlob = await generateContractPdf(pdfData);
        // Usar nome_cliente ou nome do cliente relacionado, sem ID no nome do arquivo
        const clientName = contract.nome_cliente || contract.clientes?.nome || 'cliente';
        downloadBlob(pdfBlob, `${clientName}.pdf`);
        
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
  
  const handleViewSite = () => {
    const clientUrl = 'http://localhost:8082/agenda/cliente-login';
    window.open(clientUrl, '_blank');
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleBackToList}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Contrato</h1>
      </div>
      <div className="flex items-center gap-2">
        {contractStatus === 'pendente' && (
          <Button className="gap-2" onClick={handleResend}>
            <Send size={16} />
            Reenviar
          </Button>
        )}
        <Button variant="outline" className="gap-2" onClick={() => {
          if (contract.id_amigavel && contract.nome_cliente) {
            copyContractLink({
              id_contrato: contractId,
              id_amigavel: contract.id_amigavel,
              nome_cliente: contract.nome_cliente
            });
          } else {
            copyContractLink(contractId, contract.tipo_evento);
          }
        }}>
          <Copy size={16} />
          Copiar Link
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleViewSite}>
          <ExternalLink size={16} />
          Ver Site
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleDownload}>
          <Download size={16} />
          Download
        </Button>
      </div>
    </div>
  );
};

export default ContractHeader;
