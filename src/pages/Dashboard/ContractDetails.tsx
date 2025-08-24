
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useContract } from '@/hooks/useContract';
import { useContractHistory } from '@/hooks/useContractHistory';
import { useContractCopy } from '@/hooks/useContractCopy';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { uploadContractAttachments } from '@/services/supabaseStorageService';
import { parseContractSlug } from '@/utils/slugify';
import { generateContractPdf } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from '@/components/contratos/ContractForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Import our components
import ContractHeader from '@/components/contratos/details/ContractHeader';
import ContractClientInfo from '@/components/contratos/details/ContractClientInfo';
import ContractPaymentInfo from '@/components/contratos/details/ContractPaymentInfo';
import ContractAttachments from '@/components/contratos/details/ContractAttachments';
import ContractContent from '@/components/contratos/details/ContractContent';
import ContractStatus from '@/components/contratos/details/ContractStatus';
import ContractHistory, { HistoryItem } from '@/components/contratos/details/ContractHistory';
import ResendDialog from '@/components/contratos/details/ResendDialog';
import ContractCopyWithSignature from '@/components/contratos/ContractCopyWithSignature';
import { formatarTelefoneExibicao } from '@/utils/formatters';



const ContractDetails = () => {
  // Usar slug como parâmetro principal para suportar URLs amigáveis
  const { slug, id_contrato } = useParams<{ slug?: string; id_contrato?: string }>();
  
  // Extrair ID do contrato do slug ou usar ID direto (retrocompatibilidade)
  const contractId = React.useMemo(() => {
    if (slug) {
      // Nova URL com slug: /contratos/titulo-slug-12345678
      const result = parseContractSlug(slug);
      if (result.success) {
        return result.id;
      }
      // Se o slug não é válido, pode ser um ID direto na posição do slug
      return slug;
    }
    // URL antiga com ID direto: /contratos/12345678
    return id_contrato || '';
  }, [slug, id_contrato]);
  
  // Debug log para verificar o parâmetro da URL
  // Log removido por segurança - não expor dados de contrato
  
  const { toast } = useToast();
  const { configuracoes } = useEmpresa();
  const { user } = useAuth();
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [eventLocation, setEventLocation] = useState<string>('N/A');
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para PDF do contrato
  const [contractPdfUrl, setContractPdfUrl] = useState<string | null>(null);
  const [savedContractPdfUrl, setSavedContractPdfUrl] = useState<string | null>(null);
  
  // Estados para upload de arquivos
  const [attachments, setAttachments] = useState<Array<{
    name: string;
    size: string;
    type?: string;
    url?: string;
    file?: File; // Adicionar suporte para arquivo File
    isNew?: boolean; // Flag para identificar novos anexos
  }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const { data: contract, isLoading, error } = useContract(contractId);
  const { data: contractHistory = [], isLoading: isLoadingHistory } = useContractHistory(contractId);
  
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
  
  // Função para gerar URL do PDF do contrato
  const generateContractPdfUrl = React.useCallback(async () => {
    if (!contract || !configuracoes) return;
    
    try {
      // Construir objeto do contrato para geração do PDF
      const contractForPdf = {
        id: (contract as any).id,
        clientName: (contract as any).clientes?.nome || (contract as any).nome_cliente || extractClientNameFromTitle((contract as any).titulo) || 'Cliente',
        clientEmail: (contract as any).clientes?.email || (contract as any).email_cliente || 'email@exemplo.com',
        phoneNumber: formatarTelefoneExibicao((contract as any).clientes?.telefone || (contract as any).telefone_cliente) || '(00) 00000-0000',
        eventType: (contract as any).titulo?.split(' - ')[1] || (contract as any).tipo_evento || 'Evento',
        eventDate: (contract as any).data_evento ? new Date((contract as any).data_evento) : new Date(),
        eventLocation: (contract as any).local_evento || eventLocation || 'Local a definir',
        sentDate: (contract as any).created_at ? new Date((contract as any).created_at) : new Date(),
        value: (contract as any).valor_total || 0,
        downPayment: (contract as any).valor_sinal || 0,
        status: (contract as any).status || 'pendente',
        termsAndConditions: (contract as any).conteudo || '',
        photographerName: configuracoes?.nome_empresa || 'Empresa',
        attachments: attachments,
        signatureInfo: null
      };

      // Gera o conteúdo completo do contrato usando o template
      const conteudoContrato = generateContractTemplate(contractForPdf, configuracoes);

      const pdfData = {
        conteudoContrato,
        includeSignature: contractForPdf.status === 'assinado',
        signatureDate: contractForPdf.status === 'assinado' ? 
          format(new Date(), "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: configuracoes?.nome_empresa || 'Empresa',
        clientName: contractForPdf.status === 'assinado' ? contractForPdf.clientName : undefined
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
      // console.error('Erro ao gerar PDF para preview:', error); // Removido para produção
    }
  }, [contract, configuracoes, eventLocation, attachments]);
  
  // Carregar anexos salvos do Supabase e buscar PDF salvo
  const loadContractAttachments = React.useCallback(async () => {
    if (!contractId) return;

    const id_contrato = contractId.split('-').pop();
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select('id')
      .eq('id_contrato', id_contrato)
      .single();

    if (contratoError) {
      // console.error('Erro ao buscar contrato:', contratoError); // Removido para produção
      throw new Error(`Erro ao buscar contrato com id_contrato ${id_contrato}`);
    }

    const id_contrato_db = contrato.id;
    
    try {
      const { data: anexos, error } = await supabase
        .from('anexos_contrato')
        .select('*')
        .eq('id_contrato', id_contrato_db);
      
      if (error) {
        // console.error('Erro ao carregar anexos:', error); // Removido para produção
        return;
      }
      
      if (anexos && anexos.length > 0) {
        const attachmentsFromDB = anexos.map(anexo => ({
          name: anexo.nome,
          size: anexo.tamanho ? `${(anexo.tamanho / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          type: anexo.tipo,
          url: anexo.url,
          isNew: false // Anexos do banco não são novos
        }));
        
        // Mesclar anexos do banco com anexos locais novos
        setAttachments(currentAttachments => {
          // Manter apenas anexos novos (locais) que ainda não foram salvos
          const localNewAttachments = currentAttachments.filter(att => att.isNew);
          
          // Combinar anexos do banco com anexos locais novos
          return [...attachmentsFromDB, ...localNewAttachments];
        });
        
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
      } else {
        // Se não há anexos no banco, manter apenas os anexos locais novos
        setAttachments(currentAttachments => 
          currentAttachments.filter(att => att.isNew)
        );
      }
    } catch (error) {
      // console.error('Erro ao buscar anexos:', error); // Removido para produção
    }
  }, [contractId]);
  
  // Carregar anexos existentes quando o contractId estiver disponível
  React.useEffect(() => {
    if (contractId) {
      loadContractAttachments();
    }
  }, [contractId, loadContractAttachments]);

  // Função para salvar anexos no Supabase
  const saveAttachments = async () => {
    if (!contractId || !user) {
      toast({
        title: "Erro",
        description: "ID do contrato ou usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Filtrar apenas anexos novos que têm arquivo
    const newAttachments = attachments.filter(attachment => attachment.isNew && attachment.file);
    
    if (newAttachments.length === 0) {
      toast({
        title: "Nenhum anexo novo",
        description: "Não há anexos novos para salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload dos arquivos usando o serviço específico para anexos de contrato
      const files = newAttachments.map(attachment => attachment.file!);
      const uploadResult = await uploadContractAttachments(files, {
        bucket: 'contratos',
        pathPrefix: `contract-${contractId}`
      });

      if (!uploadResult.success) {
        throw new Error(`Erro no upload: ${uploadResult.errors.map(e => e.error).join(', ')}`);
      }

      // Salvar informações dos anexos na tabela anexos_contrato
      for (let i = 0; i < newAttachments.length; i++) {
        const attachment = newAttachments[i];
        const publicUrl = uploadResult.urls[i];

        const id_contrato = contractId.split('-').pop();
        const { data: contrato, error: contratoError } = await supabase
          .from('contratos')
          .select('id')
          .eq('id_contrato', id_contrato)
          .single();

        if (contratoError) {
          // console.error('Erro ao buscar contrato:', contratoError); // Removido para produção
          throw new Error(`Erro ao buscar contrato com id_contrato ${id_contrato}`);
        }

        const id_contrato_db = contrato.id;
        
        const { error: dbError } = await supabase
          .from('anexos_contrato')
          .insert({
            id_contrato: id_contrato_db,
            id_user: user.id,
            nome: attachment.name,
            url: publicUrl,
            tipo: attachment.type || 'application/octet-stream',
            tamanho: attachment.file!.size
          });

        if (dbError) {
          // console.error('Erro ao salvar no banco:', dbError); // Removido para produção
          throw new Error(`Erro ao salvar informações do arquivo ${attachment.name}`);
        }
      }

      // Recarregar anexos para mostrar os salvos
      // await loadContractAttachments();
      
      toast({
        title: "Anexos salvos com sucesso",
        description: `${newAttachments.length} arquivo(s) foram salvos no contrato.`,
      });
      
    } catch (error) {
      // console.error('Erro ao salvar anexos:', error); // Removido para produção
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os anexos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Gerar PDF do contrato quando estiver disponível
  React.useEffect(() => {
    if (contract && configuracoes) {
      generateContractPdfUrl();
    }
  }, [contract?.id, configuracoes, generateContractPdfUrl]);

  // Cleanup para revogar URLs quando componente for desmontado
  React.useEffect(() => {
    return () => {
      if (contractPdfUrl) {
        URL.revokeObjectURL(contractPdfUrl);
      }
    };
  }, [contractPdfUrl]);
  
  // Logs de debug removidos por segurança
  
  // Hook para funcionalidade de cópia de contrato
  const {
    isVisible: isCopyVisible,
    copiedContract,
    eventLocation: copyEventLocation,
    createContractCopy,
    closeCopy,
    signDigitalContract,
    downloadContractCopy
  } = useContractCopy();
  
  // Buscar dados do evento se existe evento_id
  useEffect(() => {
    const fetchEventLocation = async () => {
      if ((contract as any)?.evento_id) {
        try {
          const { data: eventData } = await supabase
            .from('agenda_eventos')
            .select('local')
            .eq('id', (contract as any).evento_id)
            .single();
          
          if (eventData?.local) {
            setEventLocation(eventData.local);
          }
        } catch (error) {
          // console.error('Erro ao buscar local do evento:', error); // Removido para produção
        }
      }
    };
    
    fetchEventLocation();
  }, [contract]);

  // Inicializa o email do destinatário quando o contrato carrega
  React.useEffect(() => {
    if ((contract as any)?.email_cliente && !recipientEmail) {
      setRecipientEmail((contract as any).email_cliente);
    }
  }, [(contract as any)?.email_cliente, recipientEmail]);
  
  // Se não há contrato ou está carregando, mostra loading ou erro
  if (isLoading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando contrato...</div>
        </div>
      </ResponsiveContainer>
    );
  }
  
  if (error || !contract) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro ao carregar contrato</div>
        </div>
      </ResponsiveContainer>
    );
  }
  
  const handleResend = () => {
    setIsResendDialogOpen(true);
  };
  
  const handleConfirmResend = () => {
    // Aqui faria uma chamada para API para reenviar o contrato
    
    toast({
      title: "Contrato reenviado",
      description: `Um novo link foi enviado para ${recipientEmail}`,
    });
    setIsResendDialogOpen(false);
  };
  
  const handleCancelContract = () => {
    if (contract.status === 'cancelado') {
      toast({
        title: "Aviso",
        description: "Este contrato já está cancelado.",
      });
      return;
    }
    
    // Confirmar antes de cancelar
    if (window.confirm("Tem certeza que deseja cancelar este contrato? Esta ação não pode ser desfeita.")) {
      // Aqui faria uma chamada para API para cancelar o contrato
      
      toast({
        title: "Contrato cancelado",
        description: "O status do contrato foi alterado para cancelado."
      });
    }
  };
  
  const handleCopyContract = () => {
    if (contract) {
      createContractCopy(contract as any, eventLocation);
    }
  };

  // Funções para manipulação de arquivos
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
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: `O arquivo ${file.name} não é um tipo suportado.`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo ${file.name} excede o limite de 5MB.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    const newAttachments = validFiles.map(file => ({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file, // Incluir o arquivo File
      isNew: true // Marcar como novo anexo
    }));

    setAttachments(prev => [...prev, ...newAttachments]);

    if (newAttachments.length > 0) {
      toast({
        title: "Arquivos adicionados",
        description: `${newAttachments.length} arquivo(s) foram adicionados com sucesso.`,
      });
    }
  };

  const removeAttachment = async (index: number) => {
    // Get attachment before removing it
    const attachmentToRemove = attachments[index];
    
    if (!attachmentToRemove) {
      toast({
        title: "Erro",
        description: "Anexo não encontrado.",
        variant: "destructive",
      });
      return;
    }

    // Log attachment being removed
    // console.log("Removendo anexo:", attachmentToRemove); // Removido para produção

    // Update attachments state
    setAttachments(prev => {
      const newAttachments = [...prev];
      // Release object URL if it exists
      if (attachmentToRemove.url && attachmentToRemove.isNew) {
        URL.revokeObjectURL(attachmentToRemove.url);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });

    const path_file = attachmentToRemove.url.split('contratos/')[1];

    // need remove anexo on storage
    const { data: dataStorage, error: errorStorage } = await supabase
      .storage
      .from('contratos')
      .remove([`${path_file}`]);

    if (errorStorage) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o anexo do contrato.",
        variant: "destructive",
      });
      return;
    }

    const url_file = attachmentToRemove.url;

    // need remove anexos_contrato on database
    const { data, error } = await supabase
      .from('anexos_contrato')
      .delete()
      .eq('url', url_file);

    if (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o anexo do contrato.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Arquivo removido",
      description: "O arquivo foi removido da lista de anexos.",
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <ContractHeader 
          contract={contract}
          handleResend={handleResend} 
          contractStatus={contract.status} 
          contractId={contract.id_contrato}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <ContractClientInfo 
                  clientName={(contract as any).nome_cliente || contract.clientes?.nome || 'N/A'}
                  clientEmail={(contract as any).email_cliente || contract.clientes?.email || 'N/A'}
                  phoneNumber={formatarTelefoneExibicao((contract as any).telefone_cliente || contract.clientes?.telefone) || 'N/A'}
                  cpf_cliente={(contract as any).cpf_cliente}
                  eventType={(contract as any).tipo_evento || 'N/A'}
                  eventDate={(contract as any).data_evento ? new Date((contract as any).data_evento) : null}
                  eventLocation={eventLocation}
                  status={contract.status}
                />
                
                <Separator className="my-6" />
                
                <ContractPaymentInfo 
                  value={(contract as any).valor_total || 0} 
                  downPayment={(contract as any).valor_sinal || 0} 
                />
                
                <Separator className="my-6" />
                
                <ContractAttachments 
                  attachments={attachments} 
                  contractData={{
                    id: contract.id_contrato,
                    nome_cliente: (contract as any).nome_cliente || contract.clientes?.nome,
                    pdfUrl: savedContractPdfUrl || contractPdfUrl || undefined
                  }}
                  onRemoveAttachment={removeAttachment}
                  showRemoveButton={true}
                />
                
                {/* Seção de Upload de Arquivos */}
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Adicionar Anexos</h3>
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="space-y-2">
                      <div className="text-gray-600">
                        Arraste arquivos aqui ou clique para selecionar
                      </div>
                      <div className="text-sm text-gray-500">
                        Suporte para PDF e imagens (máx. 5MB cada)
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload-details"
                      />
                      <label
                        htmlFor="file-upload-details"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        Escolher arquivos
                      </label>
                    </div>
                  </div>
                  
                  {/* Botão para salvar anexos */}
                  {attachments.some(att => att.isNew) && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={saveAttachments}
                        disabled={isUploading}
                        className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Salvar Anexos
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <ContractContent termsAndConditions={(contract as any).conteudo || 'Conteúdo do contrato não disponível'} />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ContractStatus 
                  status={contract.status}
                  sentDate={new Date(contract.criado_em)}
                  onResend={handleResend}
                  onCancel={handleCancelContract}
                  contractId={contract.id_contrato}
                  onCopyContract={handleCopyContract}
                  contractTitle={(contract as any).tipo_evento || 'Contrato'}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <ContractHistory 
                  history={contractHistory} 
                  contractStatus={contract.status}
                  contractCreatedAt={new Date(contract.criado_em)}
                  isLoading={isLoadingHistory}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <ResendDialog 
        isOpen={isResendDialogOpen}
        onOpenChange={setIsResendDialogOpen}
        recipientEmail={recipientEmail}
        setRecipientEmail={setRecipientEmail}
        onConfirm={handleConfirmResend}
      />
      
      {/* Modal de Cópia do Contrato com Assinatura Digital */}
      {isCopyVisible && copiedContract && (
        <ContractCopyWithSignature
          originalContract={copiedContract}
          eventLocation={copyEventLocation}
          onClose={closeCopy}
          onSign={signDigitalContract}
          onDownload={downloadContractCopy}
        />
      )}
    </ResponsiveContainer>
  );
};

export default ContractDetails;
