
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Check, Download, FileText, Calendar, 
  MapPin, DollarSign, Pen, Info,
  Clock, CheckCircle, Loader2, Upload, X, Eye
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
import PdfPreview from '@/components/contratos/details/PdfPreview';
import SignatureModal from '@/components/contratos/SignatureModal';
import { useContract } from '@/hooks/useContract';
import { usePublicContract } from '@/hooks/usePublicContract';
import { useAuth } from '@/hooks/useAuth';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from '@/components/contratos/ContractForm';
import { parseContractSlug } from '@/utils/slugify';
import { formatarTelefoneExibicao } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';
import { uploadContractAttachments } from '../../services/supabaseStorageService';

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
  termsAndConditions: `# CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS - TESTE CONTEÚDO PERSONALIZADO

## CONTRATANTE
**Nome:** {{CLIENTE_NOME}}
**Email:** {{CLIENTE_EMAIL}}
**Telefone:** {{CLIENTE_TELEFONE}}

## CONTRATADA
**Empresa:** {{EMPRESA_NOME}}
**CNPJ:** {{EMPRESA_CNPJ}}
**Email:** {{EMPRESA_EMAIL}}

## OBJETO DO CONTRATO
O presente contrato tem por objeto a prestação de serviços fotográficos para o evento **{{EVENTO_TIPO}}**, a ser realizado no dia **{{DATA_EVENTO}}**.

## VALOR E FORMA DE PAGAMENTO
O valor total dos serviços é de **R$ {{VALOR_TOTAL}}**, sendo:
- Entrada: R$ {{VALOR_ENTRADA}}
- Saldo: R$ {{VALOR_SALDO}}

## CLÁUSULAS ESPECIAIS - CONTEÚDO PERSONALIZADO DA COLUNA "conteudo"
1. **EXCLUSIVIDADE**: A contratada terá exclusividade fotográfica durante todo o evento.

2. **ENTREGA**: As fotos editadas serão entregues em até 30 dias após o evento via galeria online.

3. **DIREITOS DE IMAGEM**: O contratante autoriza o uso das imagens para divulgação do trabalho da contratada.

4. **CANCELAMENTO**: Em caso de cancelamento com mais de 30 dias de antecedência, será devolvido 50% do valor pago.

## ASSINATURA
Este contrato foi gerado automaticamente em **{{DATA_ATUAL}}** e é válido mediante aceite eletrônico.

---
**ESTE É UM TESTE DO CONTEÚDO PERSONALIZADO DA COLUNA "conteudo" COM PLACEHOLDERS DINÂMICOS**`,
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

interface FileAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  file?: File;
}

const ClientContract = () => {
  // Usar slug como parâmetro principal para suportar URLs amigáveis
  const { slug, id_contrato } = useParams<{ slug?: string; id_contrato?: string }>();
  const { toast } = useToast();
  const { configuracoes } = useEmpresa();
  const { user } = useAuth();
  
  // Extrair ID do contrato do slug ou usar ID direto (retrocompatibilidade)
  const contractId = React.useMemo(() => {
    if (slug) {
      // Nova URL com slug: /contrato/titulo-slug-12345678 ou /cliente/contrato/titulo-slug-12345678
      const result = parseContractSlug(slug);
      if (result.isValid && result.id_contrato) {
        return result.id_contrato;
      }
      // Se o slug não é válido, pode ser um ID direto na posição do slug
      return slug;
    }
    // URL antiga com ID direto: /contrato/12345678 ou /cliente/contrato/12345678
    return id_contrato || '';
  }, [slug, id_contrato]);
  
  // Buscar dados reais do contrato - usar hook apropriado baseado na autenticação
  const { data: contractData, isLoading: contractLoading, error: contractError } = user 
    ? useContract(contractId) 
    : usePublicContract(contractId);
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null);
  
  // Estados para upload de arquivos
  const [clientAttachments, setClientAttachments] = useState<FileAttachment[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Estado para PDF do contrato
  const [contractPdfUrl, setContractPdfUrl] = useState<string | null>(null);
  const [savedContractPdfUrl, setSavedContractPdfUrl] = useState<string | null>(null);
  
  // Estados para preview de imagens
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<FileAttachment | null>(null);

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
  
  // Usar dados reais do contrato quando disponíveis - MEMOIZADO para evitar loop infinito
  const contract = React.useMemo(() => {
    if (!contractData) {
      // Fallback para mock contract para demonstração/teste
      if (contractId === '1' || contractId === 'mock' || contractId === 'demo') {
        return {
          id: mockContract.id,
          clientName: mockContract.clientName,
          clientEmail: mockContract.clientEmail,
          phoneNumber: mockContract.phoneNumber,
          eventType: mockContract.eventType,
          eventDate: mockContract.eventDate,
          eventLocation: mockContract.eventLocation,
          sentDate: mockContract.sentDate,
          value: mockContract.value,
          downPayment: mockContract.downPayment,
          status: mockContract.status,
          termsAndConditions: mockContract.termsAndConditions,
          photographerName: nomeContratado,
          attachments: existingAttachments,
          signatureInfo: signatureInfo
        };
      }
      return null;
    }
    
    return {
      id: contractData.id,
      clientName: contractData.clientes?.nome || contractData.nome_cliente || extractClientNameFromTitle(contractData.titulo) || 'Cliente',
      clientEmail: contractData.clientes?.email || contractData.email_cliente || 'email@exemplo.com',
      phoneNumber: formatarTelefoneExibicao(contractData.clientes?.telefone || contractData.telefone_cliente) || '(00) 00000-0000',
      eventType: contractData.titulo?.split(' - ')[1] || contractData.tipo_evento || 'Evento',
      eventDate: contractData.data_evento ? new Date(contractData.data_evento) : new Date(),
      eventLocation: contractData.local_evento || 'Local a definir',
      sentDate: contractData.created_at ? new Date(contractData.created_at) : new Date(),
      value: contractData.valor_total || 0,
      downPayment: contractData.valor_sinal || 0,
      status: contractData.status || 'pendente',
      termsAndConditions: contractData.conteudo || '',
      photographerName: nomeContratado,
      attachments: existingAttachments,
      signatureInfo: signatureInfo
    };
  }, [contractData, existingAttachments, signatureInfo, nomeContratado, contractId]);

  // Função para carregar anexos existentes do contrato
  const loadExistingAttachments = React.useCallback(async () => {
    if (!contractId) return;

    try {
      // Verificar se contract existe antes de acessar a propriedade id
      if (!contract) return;
      
      const id_contrato = contract.id;
      if (!id_contrato) return;

      const { data: anexos, error } = await supabase
        .from('anexos_contrato')
        .select('*')
        .eq('id_contrato', id_contrato);
      
      if (error) {
        console.error('Erro ao carregar anexos existentes:', error);
        return;
      }
      
      if (anexos && anexos.length > 0) {
        const attachments = anexos.map(anexo => {
          // Gerar URL pública do arquivo no bucket se necessário
          let fileUrl = anexo.url;
          
          // Se a URL não for completa, gerar URL pública do bucket
          if (fileUrl && !fileUrl.startsWith('http')) {
            const { data: urlData } = supabase.storage
              .from('contratos')
              .getPublicUrl(fileUrl);
            fileUrl = urlData.publicUrl;
          }
          
          return {
            name: anexo.nome,
            size: anexo.tamanho ? `${(anexo.tamanho / 1024 / 1024).toFixed(2)} MB` : 'Desconhecido',
            type: anexo.tipo,
            url: fileUrl
          };
        });
        
        setExistingAttachments(attachments);
        
        // Buscar especificamente o PDF do contrato principal
        const contractPdf = anexos.find(anexo => 
          anexo.tipo === 'application/pdf' && 
          (anexo.nome.toLowerCase().includes('contrato') || anexo.nome.toLowerCase().includes('contract'))
        );
        
        if (contractPdf && contractPdf.url) {
          let pdfUrl = contractPdf.url;
          
          // Se a URL não for completa, gerar URL pública do bucket
          if (!pdfUrl.startsWith('http')) {
            const { data: urlData } = supabase.storage
              .from('contratos')
              .getPublicUrl(pdfUrl);
            pdfUrl = urlData.publicUrl;
          }
          
          setSavedContractPdfUrl(pdfUrl);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    }
  }, [contractId, contract]);

  // Função para gerar URL do PDF do contrato - OTIMIZADA para evitar loop
  const generateContractPdfUrl = React.useCallback(async () => {
    if (!contractData || !configuracoes) return;
    
    try {
      // Construir objeto do contrato apenas para geração do PDF
      const contractForPdf = {
        id: contractData.id,
        clientName: contractData.clientes?.nome || contractData.nome_cliente || extractClientNameFromTitle(contractData.titulo) || 'Cliente',
        clientEmail: contractData.clientes?.email || contractData.email_cliente || 'email@exemplo.com',
        phoneNumber: formatarTelefoneExibicao(contractData.clientes?.telefone || contractData.telefone_cliente) || '(00) 00000-0000',
        eventType: contractData.titulo?.split(' - ')[1] || contractData.tipo_evento || 'Evento',
        eventDate: contractData.data_evento ? new Date(contractData.data_evento) : new Date(),
        eventLocation: contractData.local_evento || 'Local a definir',
        sentDate: contractData.created_at ? new Date(contractData.created_at) : new Date(),
        value: contractData.valor_total || 0,
        downPayment: contractData.valor_sinal || 0,
        status: contractData.status || 'pendente',
        termsAndConditions: contractData.conteudo || '',
        photographerName: nomeContratado,
        attachments: existingAttachments,
        signatureInfo: signatureInfo
      };

      // Gera o conteúdo completo do contrato usando o template
      const conteudoContrato = generateContractTemplate(contractForPdf, configuracoes);

      const pdfData = {
        conteudoContrato,
        includeSignature: contractForPdf.status === 'assinado',
        signatureDate: contractForPdf.status === 'assinado' && (contractForPdf.signatureInfo || signatureInfo) ? 
          format((contractForPdf.signatureInfo || signatureInfo)!.timestamp, "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: nomeContratado,
        clientName: contractForPdf.status === 'assinado' ? (contractForPdf.signatureInfo?.name || signatureInfo?.name || contractForPdf.clientName) : undefined
      };

      // Gerar o PDF blob
      const pdfBlob = generateContractPdf(pdfData);
      
      // Criar URL temporária para o blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setContractPdfUrl(prevUrl => {
        // Limpar URL anterior se existir
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return pdfUrl;
      });
    } catch (error) {
      console.error('Erro ao gerar PDF para preview:', error);
    }
  }, [contractData, configuracoes, signatureInfo, nomeContratado, existingAttachments]);

  // Carregar anexos existentes quando o contractId estiver disponível
  React.useEffect(() => {
    if (contractId) {
      loadExistingAttachments();
    }
  }, [contractId, loadExistingAttachments]);

  // Gerar PDF do contrato quando estiver disponível - OTIMIZADO para evitar loop
  React.useEffect(() => {
    if (contractData && configuracoes) {
      generateContractPdfUrl();
    }
  }, [contractData?.id, configuracoes, generateContractPdfUrl]);

  // Cleanup para revogar URLs quando componente for desmontado
  React.useEffect(() => {
    return () => {
      if (contractPdfUrl) {
        URL.revokeObjectURL(contractPdfUrl);
      }
    };
  }, [contractPdfUrl]);

  // Logs de debug removidos por segurança
  
  // Se não há dados do contrato e não está carregando, mostrar erro (exceto para IDs de teste)
  if (!contractLoading && !contract && contractId !== '1' && contractId !== 'mock' && contractId !== 'demo') {
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
  
  // Loading state (exceto para IDs de teste)
  if (contractLoading && contractId !== '1' && contractId !== 'mock' && contractId !== 'demo') {
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
  
  // Error state (exceto para IDs de teste)
  if (contractError && contractId !== '1' && contractId !== 'mock' && contractId !== 'demo') {
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
  
  // Função para verificar se um arquivo é uma imagem
  const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? imageExtensions.includes(extension) : false;
  };
  
  // Função para abrir preview de imagem
  const handlePreviewImage = (attachment: FileAttachment) => {
    setPreviewAttachment(attachment);
    setPreviewOpen(true);
  };
  
  const handleDownload = async () => {
    try {
      if (!contract) return;

      // Gera o conteúdo completo do contrato usando o template
      const conteudoContrato = generateContractTemplate(contract, configuracoes);

      const pdfData = {
        conteudoContrato,
        includeSignature: contract.status === 'assinado',
        signatureDate: contract.status === 'assinado' && (contract.signatureInfo || signatureInfo) ? 
          format((contract.signatureInfo || signatureInfo)!.timestamp, "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: nomeContratado,
        clientName: contract.status === 'assinado' ? (contract.signatureInfo?.name || signatureInfo?.name || contract.clientName) : undefined
      };

      // Gerar o PDF e fazer o download
      const pdfBlob = await generateContractPdf(pdfData);
      downloadBlob(pdfBlob, `contrato-${contract.clientName}.pdf`);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  // Função para salvar (nova funcionalidade)
  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!contract?.id || clientAttachments.length === 0) {
        toast({
          title: "Nenhum anexo para salvar",
          description: "Adicione anexos antes de salvar.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Filtrar apenas anexos que têm arquivo (novos uploads)
      const newAttachments = clientAttachments.filter(attachment => attachment.file);
      
      if (newAttachments.length === 0) {
        toast({
          title: "Nenhum anexo novo para salvar",
          description: "Todos os anexos já foram salvos.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload dos arquivos usando o serviço específico para anexos de contrato
      const files = newAttachments.map(attachment => attachment.file!);
      const uploadResult = await uploadContractAttachments(files, {
        bucket: 'contratos',
        pathPrefix: `contract-${contract.id}`
      });

      if (!uploadResult.success) {
        throw new Error(`Erro no upload: ${uploadResult.errors.map(e => e.error).join(', ')}`);
      }

      // Salvar informações dos anexos na tabela anexos_contrato
      for (let i = 0; i < newAttachments.length; i++) {
        const attachment = newAttachments[i];
        const publicUrl = uploadResult.urls[i];
        
        const { error: dbError } = await supabase
          .from('anexos_contrato')
          .insert({
            id_contrato: contract.id,
            id_user: user?.id, // Adicionar o ID do usuário logado
            nome: attachment.name,
            url: publicUrl,
            tipo: attachment.type,
            tamanho: attachment.file!.size
          });

        if (dbError) {
          console.error('Erro ao salvar no banco:', dbError);
          throw new Error(`Erro ao salvar informações do arquivo ${attachment.name}`);
        }
      }

      // Limpar anexos após salvar
      setClientAttachments([]);
      
      // Recarregar anexos existentes para mostrar os novos
      await loadExistingAttachments();

      setLoading(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os anexos. Tente novamente.",
        variant: "destructive",
      });
      setLoading(false);
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

  // Funções para upload de arquivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Validar tipo de arquivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `O arquivo "${file.name}" não é um tipo suportado.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo "${file.name}" excede o limite de 5MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    const newAttachments: FileAttachment[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
      file: file
    }));

    setClientAttachments(prev => [...prev, ...newAttachments]);
    
    if (newAttachments.length > 0) {
      
    }
  };

  const removeClientAttachment = (id: string) => {
    setClientAttachments(prev => prev.filter(attachment => attachment.id !== id));
    
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📎';
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
                  <p><strong>Telefone:</strong> {formatarTelefoneExibicao(contract.phoneNumber)}</p>
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
                <ContractAttachments 
                  attachments={contract.attachments}
                  contractData={{
                    id: contract.id,
                    nome_cliente: contract.clientName,
                    pdfUrl: savedContractPdfUrl || contractPdfUrl || undefined
                  }}
                />
              </div>
            )}
            
            {/* Seção de Upload de Arquivos do Cliente - Apenas para contratos pendentes */}
            {contract.status === 'pendente' && (
              <div className="mb-6">
                <h3 className="font-medium mb-4">Adicionar Documentos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você pode anexar documentos adicionais relacionados ao contrato (opcional).
                </p>
                
                {/* Anexos Existentes */}
                {/* {existingAttachments.length > 0 && (
                  <div className="mb-6">
                    <ContractAttachments 
                      attachments={existingAttachments}
                      contractData={{
                        id: contract.id,
                        nome_cliente: contract.clientName,
                        pdfUrl: savedContractPdfUrl || contractPdfUrl || undefined
                      }}
                    />
                  </div>
                )} */}

                {/* Área de Upload */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, Word, Excel ou Imagens (máx. 5MB cada)
                  </p>
                  
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                    id="client-file-upload"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('client-file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Arquivos
                  </Button>
                </div>
                
                {/* Lista de Arquivos Anexados pelo Cliente */}
                {clientAttachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Documentos Anexados:</h4>
                    <div className="space-y-2">
                      {clientAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getFileIcon(attachment.type)}</span>
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">{attachment.size}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {isImageFile(attachment.name) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreviewImage(attachment)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                title="Visualizar imagem"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeClientAttachment(attachment.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Separator className="my-6" />
            
            {/* Botão de Salvar - substituindo a seção de Assinatura Digital */}
            <div className="flex justify-center">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="gap-2 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
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
      
      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visualizar Imagem
            </DialogTitle>
            <DialogDescription>
              {previewAttachment?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg max-h-[70vh] overflow-auto">
            {previewAttachment?.file ? (
              <img
                src={URL.createObjectURL(previewAttachment.file)}
                alt={previewAttachment.name}
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Não foi possível carregar a imagem</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default ClientContract;
