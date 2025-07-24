
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileSignature, 
  Clock, 
  Check, 
  AlertCircle,
  Search,
  ChevronRight,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from '@/components/contratos/ContractForm';
import { generateContractUrl } from '@/utils/slugify';

// Sample data for client contracts
const sampleContracts = [
  {
    id: "1",
    title: "Contrato de Book Gestante",
    event: "Book de Gestante - 15/12/2023",
    sentDate: new Date("2023-11-05"),
    status: "pending",
    expirationDate: new Date("2023-12-05"),
    id_amigavel: 7,
    nome_cliente: "GESTANTE-MARIA"
  },
  {
    id: "2",
    title: "Contrato de Ensaio Pré-Wedding",
    event: "Ensaio Pré-Wedding - 10/11/2023",
    sentDate: new Date("2023-10-01"),
    signedDate: new Date("2023-10-05"),
    status: "signed",
    expirationDate: new Date("2023-11-01"),
    id_amigavel: 8,
    nome_cliente: "CASAL-SILVA"
  },
  {
    id: "3",
    title: "Contrato de Sessão Familiar",
    event: "Sessão Fotográfica Familiar - 22/09/2023",
    sentDate: new Date("2023-08-15"),
    status: "expired",
    expirationDate: new Date("2023-09-15"),
    id_amigavel: 9,
    nome_cliente: "FAMILIA-SANTOS"
  }
];

// Status properties
const contractStatusProps = {
  signed: {
    label: "Assinado",
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    icon: Check
  },
  pending: {
    label: "Pendente",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    icon: Clock
  },
  expired: {
    label: "Expirado",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    icon: AlertCircle
  }
};

const ClientContracts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { configuracoes } = useEmpresa();
  
  // Filter contracts based on tab and search
  const filteredContracts = sampleContracts.filter(contract => {
    // Tab filter
    if (activeTab !== 'all' && contract.status !== activeTab) return false;
    
    // Search filter
    if (searchQuery && !contract.title.toLowerCase().includes(searchQuery.toLowerCase())
        && !contract.event.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });
    // Handle download
  const handleDownload = async (contractId: string) => {
    try {
      // Buscar dados do contrato específico pelo ID
      const contract = sampleContracts.find(c => c.id === contractId);
      if (!contract) {
        toast({
          title: "Erro",
          description: "Contrato não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Gera o conteúdo completo do contrato usando o template
      const conteudoContrato = generateContractTemplate(contract, configuracoes);

      const pdfData = {
        conteudoContrato,
        includeSignature: contract.status === 'signed',
        signatureDate: contract.status === 'signed' && contract.signedDate ? 
          format(contract.signedDate, "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: configuracoes?.nome_empresa || 'Bright Spark Photography',
        clientName: contract.status === 'signed' ? contract.title : undefined
      };

      // Gerar o PDF e fazer o download
      const pdfBlob = await generateContractPdf(pdfData);
      downloadBlob(pdfBlob, `contrato-${contract.title}.pdf`);
      
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Meus Contratos</h1>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="signed">Assinados</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredContracts.length > 0 ? (
            <div className="space-y-4">
              {filteredContracts.map(contract => {
                const StatusIcon = contractStatusProps[contract.status].icon;
                
                return (
                  <Card key={contract.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${
                            contract.status === 'signed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            contract.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{contract.title}</h3>
                              <Badge className={contractStatusProps[contract.status].badge}>
                                {contractStatusProps[contract.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contract.event}</p>
                            <p className="text-sm text-muted-foreground">
                              {contract.status === 'signed' 
                                ? `Assinado em: ${format(contract.signedDate, "dd/MM/yyyy", { locale: ptBR })}` 
                                : contract.status === 'pending'
                                ? `Expira em: ${format(contract.expirationDate, "dd/MM/yyyy", { locale: ptBR })}`
                                : `Expirado em: ${format(contract.expirationDate, "dd/MM/yyyy", { locale: ptBR })}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          {contract.status === 'signed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="gap-1"
                              onClick={() => handleDownload(contract.id)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          )}
                          
                          <Link to={(() => {
                            // Usar novo formato se dados estão disponíveis
                            if (contract.id_amigavel && contract.nome_cliente) {
                              return generateContractUrl({
                                id_contrato: contract.id,
                                id_amigavel: contract.id_amigavel,
                                nome_cliente: contract.nome_cliente
                              }).replace('/contrato/', '/cliente/contrato/');
                            } else {
                              // Fallback para formato antigo
                              return generateContractUrl(contract.id, contract.event).replace('/contrato/', '/cliente/contrato/');
                            }
                          })()}>
                            <Button 
                              variant={contract.status === 'pending' ? 'default' : 'outline'} 
                              size="sm"
                              className="gap-1"
                            >
                              <FileSignature className="h-4 w-4" />
                              {contract.status === 'pending' ? 'Assinar Agora' : 'Visualizar'}
                            </Button>
                          </Link>
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

export default ClientContracts;
