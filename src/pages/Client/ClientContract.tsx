
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Check, Download, FileText, Calendar, 
  MapPin, DollarSign, Pen, Info,
  Clock, CheckCircle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import ContractContent from '@/components/contratos/details/ContractContent';
import ContractAttachments from '@/components/contratos/details/ContractAttachments';
import SignatureModal from '@/components/contratos/SignatureModal';
import { useContract } from '@/hooks/useContract';
import { usePublicContract } from '@/hooks/usePublicContract';
import { useAuth } from '@/hooks/useAuth';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf } from '@/utils/contractPdfGenerator';

// Mock contract data (in a real app would be fetched based on id)
const mockContract = {
  id: '1',
  clientName: 'Ana Silva',
  clientEmail: 'ana.silva@email.com',
  phoneNumber: '(11) 98765-4321',
  eventType: 'Casamento',
  eventDate: new Date(2023, 9, 15),
  eventLocation: 'Espaço Jardim Botânico, São Paulo - SP',
  sentDate: new Date(2023, 8, 1),
  value: 2500.00,
  downPayment: 500.00,
  status: 'pendente', // 'pendente', 'assinado', 'expirado', 'cancelado'
  termsAndConditions: ``,
  photographerName: "Mariana Fotografias",
  attachments: [
    { name: 'cronograma_evento.pdf', size: '145 KB' },
    { name: 'referencia_fotos.jpg', size: '1.2 MB' },
  ],
  signatureInfo: null
};

interface SignatureInfo {
  name: string;
  signature: string;
  ip: string;
  timestamp: Date;
  method: 'draw' | 'text';
}

const ClientContract = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { configuracoes } = useEmpresa();
  const { user } = useAuth();
  
  // Buscar dados reais do contrato - usar hook apropriado baseado na autenticação
  const { data: contractData, isLoading: contractLoading, error: contractError } = user 
    ? useContract(id || '') 
    : usePublicContract(id || '');
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null);
  
  const nomeContratado = configuracoes?.nome_empresa || mockContract.photographerName;
  
  // Função para extrair nome do cliente do título do contrato
  const extractClientNameFromTitle = (titulo: string) => {
    if (!titulo) return null;
    // Formato esperado: "Contrato - EventType - ClientName" ou "EventType - ClientName"
    const parts = titulo.split(' - ');
    if (parts.length >= 3) {
      return parts[2]; // Nome do cliente é a terceira parte
    } else if (parts.length === 2) {
      return parts[1]; // Nome do cliente é a segunda parte
    }
    return null;
  };
  
  // Usar dados reais do contrato quando disponíveis
  const contract = contractData ? {
    id: contractData.id,
    clientName: contractData.clientes?.nome || contractData.nome_cliente || extractClientNameFromTitle(contractData.titulo) || 'Cliente',
    clientEmail: contractData.clientes?.email || contractData.email_cliente || 'email@exemplo.com',
    phoneNumber: contractData.clientes?.telefone || contractData.telefone_cliente || '(00) 00000-0000',
    eventType: contractData.titulo?.split(' - ')[1] || contractData.tipo_evento || 'Evento',
    eventDate: contractData.data_evento ? new Date(contractData.data_evento) : new Date(),
    eventLocation: contractData.local_evento || 'Local a definir',
    sentDate: contractData.created_at ? new Date(contractData.created_at) : new Date(),
    value: contractData.valor_total || 0,
    downPayment: contractData.valor_sinal || 0,
    status: contractData.status || 'pendente',
    termsAndConditions: contractData.conteudo || '',
    photographerName: nomeContratado,
    attachments: [],
    signatureInfo: signatureInfo
  } : null;
  
  // Se não há dados do contrato e não está carregando, mostrar erro
  if (!contractLoading && !contract) {
    return (
      <ResponsiveContainer>
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          <Card className="border-primary/20">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Info className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium">Contrato não encontrado</h3>
              <p className="text-muted-foreground mt-2">
                O contrato solicitado não foi encontrado ou não está disponível.
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>
    );
  }
  
  // Loading state
  if (contractLoading) {
    return (
      <ResponsiveContainer>
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          <Card className="border-primary/20">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
              <h3 className="text-lg font-medium">Carregando contrato...</h3>
              <p className="text-muted-foreground mt-2">
                Buscando os dados do contrato.
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>
    );
  }
  
  // Error state
  if (contractError) {
    return (
      <ResponsiveContainer>
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
          <Card className="border-primary/20">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Info className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium">Erro ao carregar contrato</h3>
              <p className="text-muted-foreground mt-2">
                Não foi possível carregar os dados do contrato. Verifique se o link está correto.
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>
    );
  }
    const handleDownload = () => {
    try {
      const contractData = {
        contractId: id || '1',
        contractStatus: contract.status,
        clientData: {
          nome: contract.clientName,
          telefone: contract.phoneNumber,
          email: contract.clientEmail,
          tipoEvento: contract.eventType
        },
        eventoData: {
          data: format(contract.eventDate, "dd/MM/yyyy", { locale: ptBR }),
          local: contract.eventLocation
        },
        pagamentoData: {
          valorTotal: contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          sinal: contract.downPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          valorRestante: (contract.value - contract.downPayment).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
        conteudoContrato: contract.termsAndConditions,
        includeSignature: contract.status === 'assinado',
        signatureDate: contract.status === 'assinado' && contract.signatureInfo ? 
          format(contract.signatureInfo.timestamp, "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: contract.status === 'assinado' && contract.signatureInfo ? 
          contract.signatureInfo.name : undefined
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
  
  const handleSignConfirm = (signedBy: string, signature: string | null, ip: string) => {
    if (!signature) return;
    
    // Simulando o envio da assinatura
    setLoading(true);
    
    // Em uma aplicação real, aqui enviaríamos para a API
    setTimeout(() => {
      // Adicionando informações de assinatura
      const signatureInfo: SignatureInfo = {
        name: signedBy,
        signature: signature,
        ip: ip,
        timestamp: new Date(),
        method: signature === signedBy ? 'text' : 'draw'
      };
      
      // Atualizando as informações de assinatura
      setSignatureInfo(signatureInfo);
      
      setLoading(false);
      setShowSignatureModal(false);
      setShowSuccessDialog(true);
    }, 1500);
  };
  
  const getStatusBadge = () => {
    switch (contract.status) {
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock size={12} className="mr-1" /> Aguardando Assinatura</Badge>;
      case 'assinado':
        return <Badge variant="outline" className="text-green-500 border-green-500"><Check size={12} className="mr-1" /> Assinado</Badge>;
      case 'expirado':
        return <Badge variant="outline" className="text-red-500 border-red-500"><Clock size={12} className="mr-1" /> Expirado</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="text-destructive border-destructive"><Info size={12} className="mr-1" /> Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Contrato de {contract.eventType}</h1>
                <p className="text-muted-foreground">Fotografo {nomeContratado}</p>
              </div>
              
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={handleDownload}
                disabled={contract.status !== 'assinado'}
              >
                <Download size={16} />
                Baixar PDF
              </Button>
            </div>
            
            {/* Seção de informações do cliente - similar à página administrativa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                <h2 className="text-xl font-bold">{contract.clientName}</h2>
              </div>
              {getStatusBadge()}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Informações de Contato</h3>
                <div className="space-y-1 text-sm">
                  {contract.clientEmail && contract.clientEmail !== 'N/A' && contract.clientEmail !== 'email@exemplo.com' && (
                    <p><strong>Email:</strong> {contract.clientEmail}</p>
                  )}
                  <p><strong>Telefone:</strong> {contract.phoneNumber}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Detalhes do Evento</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{format(contract.eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </p>
                  <p><strong>Local:</strong> {contract.eventLocation}</p>
                </div>
              </div>
            </div>
            
            {/* Seção de informações de pagamento */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Informações de Pagamento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor Total</p>
                  <p className="font-medium text-lg">{contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sinal</p>
                  <p className="font-medium text-lg">{contract.downPayment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor Restante</p>
                  <p className="font-medium text-lg">{(contract.value - contract.downPayment).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="mb-6">
              <ContractContent termsAndConditions={contract.termsAndConditions} />
            </div>
            
            {contract.attachments.length > 0 && (
              <div className="mb-6">
                <ContractAttachments attachments={contract.attachments} />
              </div>
            )}
            
            <Separator className="my-6" />
            
            {contract.status === 'pendente' ? (
              <div>
                <h2 className="text-lg font-bold mb-4">Assinatura Digital</h2>
                
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Para concluir o processo, é necessário assinar digitalmente este contrato.
                    Você pode usar um mouse ou o dedo (em dispositivos touch) para desenhar sua assinatura.
                  </p>
                  
                  <Button 
                    onClick={() => setShowSignatureModal(true)} 
                    className="gap-2 w-full"
                  >
                    <Pen size={16} />
                    Assinar Digitalmente
                  </Button>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded-md">
                    <Info size={14} />
                    <p>Após a assinatura, uma cópia do contrato será enviada para seu email e estará disponível para download.</p>
                  </div>
                </div>
              </div>
            ) : contract.status === 'assinado' ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <h3 className="font-medium">Contrato Assinado</h3>
                </div>
                
                {contract.signatureInfo && (
                  <>
                    <p className="text-sm mb-4">
                        Este contrato foi assinado digitalmente por {(contract.signatureInfo || signatureInfo)?.name} em{' '}
                        {format((contract.signatureInfo || signatureInfo)?.timestamp || new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
                      </p>
                    
                    <div className="bg-white border border-green-100 rounded-md p-3 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Assinatura:</p>
                      {(contract.signatureInfo || signatureInfo)?.method === 'draw' ? (
                        <img 
                          src={(contract.signatureInfo || signatureInfo)?.signature} 
                          alt="Assinatura" 
                          className="max-h-20"
                        />
                      ) : (
                        <p className="font-medium text-xl italic">{(contract.signatureInfo || signatureInfo)?.name}</p>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded border border-green-100">
                      <p><strong>Informações de segurança:</strong></p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>IP da assinatura: {(contract.signatureInfo || signatureInfo)?.ip}</li>
                        <li>Data e hora: {format((contract.signatureInfo || signatureInfo)?.timestamp || new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</li>
                        <li>Método de assinatura: {(contract.signatureInfo || signatureInfo)?.method === 'draw' ? 'Desenho à mão' : 'Digitação de nome'}</li>
                      </ul>
                    </div>
                  </>
                )}
                
                <div className="mt-4">
                  <Button className="gap-2" onClick={handleDownload}>
                    <Download size={16} />
                    Baixar Contrato Assinado
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={20} className="text-yellow-600" />
                  <h3 className="font-medium">Este contrato não está mais disponível para assinatura</h3>
                </div>
                <p className="text-sm">
                  Este contrato foi {contract.status === 'expirado' ? 'expirado' : 'cancelado'}.
                  Entre em contato com o prestador de serviço para mais informações.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* SignatureModal for digital signature */}
      <SignatureModal
        isOpen={showSignatureModal}
        onOpenChange={setShowSignatureModal}
        onConfirm={handleSignConfirm}
        contractTerms={contract.termsAndConditions}
      />
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check size={18} />
              Contrato Assinado com Sucesso!
            </DialogTitle>
            <DialogDescription>
              Seu contrato foi assinado digitalmente e está registrado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center space-y-3">
            <div className="bg-green-50 text-green-700 p-4 rounded-md">
              <p className="font-medium">Uma cópia do contrato foi enviada para seu email.</p>
              <p className="text-sm mt-1">{contract.clientEmail}</p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Data e hora da assinatura: {(contract.signatureInfo || signatureInfo) ? 
                format((contract.signatureInfo || signatureInfo).timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 
                format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => window.location.href = '/cliente/agenda'} className="w-full">
              Ir para Minha Área
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default ClientContract;
