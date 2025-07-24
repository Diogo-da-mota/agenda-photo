
import React from 'react';
import { ArrowLeft, Send, Download, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCopyLink } from '@/hooks/useCopyLink';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface ContractHeaderProps {
  handleResend: () => void;
  contractStatus: string;
  contractId: string;
}

const ContractHeader = ({ handleResend, contractStatus, contractId }: ContractHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { copyContractLink } = useCopyLink();
  const { configuracoes } = useEmpresa();
  const nomeContratado = configuracoes?.nome_empresa || '[Nome do Fotógrafo]';
  
  const handleBackToList = () => {
    navigate('/contratos');
  };
    const handleDownload = () => {
    try {
      // Dados do cliente - em produção, estes dados viriam de props ou API
      const clientData = {
        nome: "Ana Silva",
        telefone: "(11) 98765-4321",
        email: "ana.silva@email.com",
        tipoEvento: "Casamento"
      };
      
      const eventoData = {
        data: "15 de outubro de 2023",
        local: "Espaço Jardim Botânico, São Paulo - SP"
      };
      
      const pagamentoData = {
        valorTotal: "R$ 2.500,00",
        sinal: "R$ 500,00",
        valorRestante: "R$ 2.000,00"
      };
      
      // Texto completo do contrato
      const conteudoContrato = ``;

      // Gerar o PDF usando o utilitário
      const pdfBlob = generateContractPdf({
        clientData,
        eventoData,
        pagamentoData,
        conteudoContrato,
        contractId,
        contractStatus,
        includeSignature: contractStatus.toLowerCase() === 'assinado',
        nomeContratado
      });
      
      // Fazer o download
      downloadBlob(pdfBlob, `contrato-${clientData.nome.replace(/\s+/g, '-')}-${contractId}.pdf`);
      
      toast({
        title: "Download concluído",
        description: "O contrato foi baixado em formato PDF.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleViewSite = () => {
    // Abre o contrato na visualização pública do cliente em uma nova aba
    const publicContractUrl = `/contrato/${contractId}`;
    window.open(publicContractUrl, '_blank');
    
    toast({
      title: "Site aberto",
      description: "O contrato foi aberto na visualização do cliente.",
    });
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
        <Button variant="outline" className="gap-2" onClick={() => copyContractLink(contractId)}>
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
