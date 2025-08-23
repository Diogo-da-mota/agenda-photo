import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClientContract from './ClientContract';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileSignature, 
  Clock, 
  Check, 
  AlertCircle,
  Search,
  Download,
  Calendar,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from '@/components/contratos/ContractForm';
import { generateContractUrl } from '@/utils/slugify';
import { useContracts } from '@/hooks/useContracts';
import { useAuth } from '@/hooks/use-auth';
import { useCopyLink } from '@/hooks/useCopyLink';

// Status properties
const contractStatusProps = {
  assinado: {
    label: "Assinado",
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    icon: Check
  },
  pendente: {
    label: "Pendente",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    icon: Clock
  },
  expirado: {
    label: "Expirado",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    icon: AlertCircle
  }
};

const AgendaClienteContratos = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [activeTab, setActiveTab] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { configuracoes } = useEmpresa();
  const { user } = useAuth();
  const { copyContractLink } = useCopyLink();
  
  // Se há um slug, exibir o contrato individual
  if (slug) {
    return <ClientContract />;
  }
  
  // Buscar contratos reais do Supabase
  const { data: contracts = [], isLoading, error } = useContracts(true);

  // Função para extrair nome do cliente do título do contrato
  const extractClientNameFromTitle = (titulo: string) => {
    const parts = titulo?.split(' - ');
    if (parts && parts.length >= 3) {
      return parts[2];
    }
    return null;
  };

  // Mapear contratos do Supabase para o formato esperado
  const contractsToUse = contracts.map((contract: any) => {
    return {
      id: contract.id_contrato,
      title: contract.titulo || 'Contrato',
      clientName: contract.nome_cliente || contract.clientes?.nome || extractClientNameFromTitle(contract.titulo) || 'Cliente',
      clientEmail: contract.clientes?.email || contract.email_cliente || '',
      eventType: contract.tipo_evento || contract.titulo || 'Evento',
      eventDate: contract.data_evento ? new Date(contract.data_evento) : new Date(),
      sentDate: new Date(contract.criado_em),
      signedDate: contract.data_assinatura ? new Date(contract.data_assinatura) : undefined,
      status: contract.status as 'pendente' | 'assinado' | 'expirado',
      value: contract.valor_total || 0,
      id_amigavel: contract.id_amigavel,
      nome_cliente: contract.nome_cliente,
      expirationDate: contract.data_expiracao ? new Date(contract.data_expiracao) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias padrão
    };
  });
  
  // Filter contracts based on tab and search
  const filteredContracts = contractsToUse.filter(contract => {
    // Tab filter
    if (activeTab !== 'todos' && contract.status !== activeTab) return false;
    
    // Search filter
    if (searchQuery && !contract.title.toLowerCase().includes(searchQuery.toLowerCase())
        && !contract.eventType.toLowerCase().includes(searchQuery.toLowerCase())
        && !contract.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Handle download
  const handleDownload = async (contractId: string) => {
    try {
      const contract = contractsToUse.find(c => c.id === contractId);
      const originalContract = contracts.find((c: any) => c.id_contrato === contractId);
      
      if (!contract || !originalContract) {
        toast({
          title: "Erro",
          description: "Contrato não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const conteudoContrato = generateContractTemplate(originalContract, configuracoes);

      const pdfData = {
        conteudoContrato,
        includeSignature: contract.status === 'assinado',
        signatureDate: contract.status === 'assinado' && contract.signedDate ? 
          format(contract.signedDate, "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: configuracoes?.nome_empresa || 'Agenda Pro',
        clientName: contract.status === 'assinado' ? contract.clientName : undefined
      };

      const pdfBlob = await generateContractPdf(pdfData);
      downloadBlob(pdfBlob, `contrato-${contract.clientName}.pdf`);
      
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Contratos Digitais</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <h3 className="text-lg font-medium">Carregando contratos...</h3>
            <p className="text-muted-foreground mt-2">
              Buscando seus contratos no servidor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Contratos Digitais</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Erro ao carregar contratos</h3>
            <p className="text-muted-foreground mt-2">
              Não foi possível carregar os contratos. Verifique sua conexão e tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Contratos Digitais</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contratos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="assinado">Assinados</TabsTrigger>
          <TabsTrigger value="expirado">Expirados</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredContracts.length > 0 ? (
            <div className="space-y-4">
              {filteredContracts.map(contract => {
                const StatusIcon = contractStatusProps[contract.status]?.icon || Clock;
                const statusProps = contractStatusProps[contract.status] || contractStatusProps.pendente;
                
                return (
                  <Card key={contract.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-stretch">
                        <div className="flex items-center p-4 sm:w-16 sm:border-r border-border justify-center">
                          {contract.status === 'pendente' && <Clock className="h-6 w-6 text-yellow-500" />}
                          {contract.status === 'assinado' && <Check className="h-6 w-6 text-green-500" />}
                          {contract.status === 'expirado' && <X className="h-6 w-6 text-red-500" />}
                        </div>
                        
                        <div className="flex-grow p-4 sm:flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="font-medium">{contract.clientName}</h3>
                              <p className="text-sm text-muted-foreground">{contract.eventType}</p>
                            </div>
                            <div className="flex flex-col sm:items-end">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span className="text-sm">
                                  {format(contract.eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                R$ {contract.value ? contract.value.toFixed(2).replace('.', ',') : '0,00'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Enviado: {format(contract.sentDate, "dd/MM/yyyy")}
                              </p>
                              {contract.status === 'assinado' && (
                                <p className="text-green-600">
                                  Assinado: {format(contract.signedDate as Date, "dd/MM/yyyy")}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                              {contract.status === 'assinado' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDownload(contract.id)}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="hidden sm:inline">Download</span>
                                </Button>
                              )}
                              
                              <Button 
                                variant={contract.status === 'pendente' ? 'default' : 'outline'} 
                                size="sm"
                                className="gap-1"
                                onClick={async () => {
                                  try {
                                    // Usar EXATAMENTE a mesma lógica do ContractHeader.tsx linha 88
                                    let url: string;
                                    
                                    if (contract.id_amigavel && contract.nome_cliente) {
                                      // Gerar URL usando a mesma lógica do copyContractLink
                                      url = `${window.location.origin}${generateContractUrl({
                                        id_contrato: contract.id, // usar contract.id que já é o id_contrato do banco
                                        id_amigavel: contract.id_amigavel,
                                        nome_cliente: contract.nome_cliente
                                      })}`;
                                    } else {
                                      // Fallback para formato antigo
                                      url = `${window.location.origin}${generateContractUrl(contract.id, contract.eventType)}`;
                                    }
                                    
                                    // Abrir URL no navegador em nova aba
                                    window.open(url, '_blank');
                                  } catch (error) {
                                    console.error('Erro ao gerar URL do contrato:', error);
                                    toast({
                                      title: "Erro",
                                      description: "Erro ao abrir contrato",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <FileSignature className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                  {contract.status === 'pendente' ? 'Assinar Agora' : 'Visualizar'}
                                </span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery 
                  ? "Tente usar outro termo de busca." 
                  : "Você não tem contratos nesta categoria no momento."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaClienteContratos;