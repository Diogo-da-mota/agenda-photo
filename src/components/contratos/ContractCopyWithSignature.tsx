import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileSignature, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContractClientInfo from './details/ContractClientInfo';
import ContractPaymentInfo from './details/ContractPaymentInfo';
import ContractAttachments from './details/ContractAttachments';
import ContractContent from './details/ContractContent';

interface ContractData {
  id: string;
  status: string;
  nome_cliente?: string;
  email_cliente?: string;
  telefone_cliente?: string;
  tipo_evento?: string;
  data_evento?: string;
  valor_total?: number;
  conteudo?: string;
  criado_em: string;
  clientes?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

interface ContractCopyWithSignatureProps {
  originalContract: ContractData;
  eventLocation?: string;
  onClose: () => void;
  onSign: () => void;
  onDownload: () => void;
}

const ContractCopyWithSignature = ({
  originalContract,
  eventLocation = 'N/A',
  onClose,
  onSign,
  onDownload
}: ContractCopyWithSignatureProps) => {
  const { toast } = useToast();

  const handleDigitalSignature = () => {
    // Simular processo de assinatura digital
    toast({
      title: "Assinatura Digital",
      description: "Iniciando processo de assinatura digital...",
    });
    
    // Chamar função de assinatura
    onSign();
  };

  const handleDownloadCopy = () => {
    toast({
      title: "Download da Cópia",
      description: "Baixando cópia do contrato com assinatura digital...",
    });
    
    onDownload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header da Cópia */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Cópia do Contrato</h2>
              <p className="text-muted-foreground">Contrato com funcionalidade de assinatura digital</p>
            </div>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Conteúdo do Contrato Copiado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <ContractClientInfo 
                    clientName={originalContract.nome_cliente || originalContract.clientes?.nome || 'N/A'}
                    clientEmail={originalContract.email_cliente || originalContract.clientes?.email || 'N/A'}
                    phoneNumber={originalContract.telefone_cliente || originalContract.clientes?.telefone || 'N/A'}
                    eventType={originalContract.tipo_evento || 'N/A'}
                    eventDate={originalContract.data_evento ? new Date(originalContract.data_evento) : new Date()}
                    eventLocation={eventLocation}
                    status="pendente" // Cópia sempre inicia como pendente
                  />
                  
                  <Separator className="my-6" />
                  
                  <ContractPaymentInfo 
                    value={originalContract.valor_total || 0} 
                    downPayment={0} 
                  />
                  
                  <Separator className="my-6" />
                  
                  <ContractAttachments attachments={[]} />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <ContractContent 
                    termsAndConditions={originalContract.conteudo || 'Conteúdo do contrato não disponível'} 
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar com Ações da Cópia */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Ações da Cópia</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full gap-2" 
                      onClick={handleDigitalSignature}
                    >
                      <FileSignature size={16} />
                      Assinatura Digital
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2" 
                      onClick={handleDownloadCopy}
                    >
                      <Download size={16} />
                      Baixar Cópia
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Informações da Cópia</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Contrato Original:</strong> #{originalContract.id}</p>
                    <p><strong>Data da Cópia:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                    <p><strong>Status:</strong> Pendente de Assinatura</p>
                    <p><strong>Funcionalidade:</strong> Assinatura Digital Habilitada</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Rodapé com Assinatura Digital */}
          <div className="mt-8 p-6 bg-muted/20 rounded-lg border-2 border-dashed border-primary/20">
            <div className="text-center">
              <h4 className="font-medium mb-2">Área de Assinatura Digital</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Esta cópia do contrato inclui funcionalidade de assinatura digital.
                Clique no botão abaixo para iniciar o processo de assinatura.
              </p>
              <Button 
                size="lg" 
                className="gap-2" 
                onClick={handleDigitalSignature}
              >
                <FileSignature size={20} />
                Assinar Digitalmente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCopyWithSignature;