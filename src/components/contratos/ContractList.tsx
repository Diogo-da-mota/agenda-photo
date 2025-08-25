
import React, { useState } from 'react';
import { 
  Clock, Check, File, Eye, Send, MoreHorizontal, X,
  FileText, Download, Copy, Calendar, Pencil, Trash2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCopyLink } from '@/hooks/useCopyLink';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useEmpresa } from '@/hooks/useEmpresa';
import { generateContractPdf, downloadBlob } from '@/utils/contractPdfGenerator';
import { generateContractTemplate } from './ContractForm';
import { useContracts } from '@/hooks/useContracts';
import { deleteContract } from '@/services/contractService';
import { useAuth } from '@/hooks/use-auth';
import { generateContractUrl } from '@/utils/slugify';

// Dados mockados removidos - usando apenas dados reais do Supabase

interface ContractListProps {
  filter: 'todos' | 'pendentes' | 'assinados' | 'expirados';
  searchQuery: string;
}

export const ContractList: React.FC<ContractListProps> = ({ filter, searchQuery }) => {
  const { toast } = useToast();
  const { copyContractLink } = useCopyLink();
  const navigate = useNavigate();
  const { configuracoes } = useEmpresa();
  const nomeContratado = configuracoes?.nome_empresa || 'Agenda Pro';
  const { user } = useAuth();
  
  // Estados para o modal de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<{id: string, clientName: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Buscar contratos reais do Supabase
  const { data: contracts = [], isLoading, error, refetch } = useContracts(true);

  // Função para extrair nome do cliente do título do contrato
  const extractClientNameFromTitle = (titulo: string) => {
    // Formato: "Contrato - EventType - ClientName"
    const parts = titulo?.split(' - ');
    if (parts && parts.length >= 3) {
      return parts[2]; // Nome do cliente é a terceira parte
    }
    return null;
  };

  // Usar apenas contratos reais do Supabase
  const contractsToUse = contracts.map((contract: any) => {
    
    return {
      id: contract.id_contrato,
      clientName: contract.nome_cliente || contract.clientes?.nome || extractClientNameFromTitle(contract.titulo) || 'Cliente',
      clientEmail: contract.clientes?.email || contract.email_cliente || '',
      eventType: contract.tipo_evento || contract.titulo || 'Evento',
      eventDate: contract.data_evento ? new Date(contract.data_evento) : new Date(),
      sentDate: new Date(contract.criado_em),
      signedDate: contract.data_assinatura ? new Date(contract.data_assinatura) : undefined,
      status: contract.status as 'pendente' | 'assinado' | 'expirado',
      value: contract.valor_total || 0,
    };
  });
  
  // Filter contracts based on selected tab and search query
  const filteredContracts = contractsToUse
    .filter(contract => 
      filter === 'todos' || 
      (filter === 'pendentes' && contract.status === 'pendente') ||
      (filter === 'assinados' && contract.status === 'assinado') ||
      (filter === 'expirados' && contract.status === 'expirado')
    )
    .filter(contract => 
      contract.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.eventType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const handleView = (id_contrato: string, titulo?: string) => {
    // Buscar dados completos do contrato para gerar URL no novo formato
    const originalContract = contracts.find((c: any) => c.id_contrato === id_contrato);
    
    if (originalContract && originalContract.id_amigavel && originalContract.nome_cliente) {
      // Usar novo formato com dados completos
      const contractUrl = generateContractUrl({
        id_contrato,
        id_amigavel: originalContract.id_amigavel,
        nome_cliente: originalContract.nome_cliente
      });
      navigate(contractUrl.replace('/contrato/', '/contratos/'));
    } else {
      // Fallback para formato antigo se dados não estão disponíveis
      const contractUrl = generateContractUrl(id_contrato, titulo);
      navigate(contractUrl.replace('/contrato/', '/contratos/'));
    }
  };
  
  const handleResend = (id: string, email: string) => {
    
  };
  
  // Função de cópia de link agora centralizada no hook useCopyLink
  
  const handleDownload = async (id: string) => {
    try {
      // Buscar dados do contrato específico pelo ID nos dados originais do Supabase
      const originalContract = contracts.find((c: any) => c.id_contrato === id);
      const mappedContract = contractsToUse.find(c => c.id === id);
      
      if (!originalContract || !mappedContract) {
        toast({
          title: "Erro",
          description: "Contrato não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Gera o conteúdo completo do contrato usando o template
      const conteudoContrato = generateContractTemplate(originalContract, configuracoes);

      const contractData = {
        conteudoContrato,
        includeSignature: mappedContract.status === 'assinado',
        signatureDate: mappedContract.status === 'assinado' && mappedContract.signedDate ? format(mappedContract.signedDate, "dd/MM/yyyy", { locale: ptBR }) : undefined,
        nomeContratado: nomeContratado,
        clientName: mappedContract.status === 'assinado' ? mappedContract.clientName : undefined
      };

      // Gerar o PDF e fazer o download
      const pdfBlob = await generateContractPdf(contractData);
      downloadBlob(pdfBlob, `contrato-${mappedContract.clientName}.pdf`);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para abrir o modal de confirmação de exclusão
  const handleDeleteClick = (id: string, clientName: string) => {
    setContractToDelete({ id, clientName });
    setDeleteDialogOpen(true);
  };

  // Função para confirmar a exclusão
  const handleConfirmDelete = async () => {
    if (!contractToDelete || !user) return;

    setIsDeleting(true);
    try {
      await deleteContract(contractToDelete.id, user);

      // Recarregar a lista de contratos
      refetch();
      
      // Fechar o modal
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o contrato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  // Função auxiliar para converter números em palavras (simplificada)
  const numberToWords = (num: number): string => {
    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    
    if (num === 0) return 'zero';
    if (num === 100) return 'cem';
    if (num === 1000) return 'mil';
    if (num === 2500) return 'dois mil e quinhentos';
    if (num === 800) return 'oitocentos';
    if (num === 1200) return 'mil e duzentos';
    
    return num.toString(); // Fallback para números não mapeados
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
            <h3 className="text-lg font-medium">Carregando contratos...</h3>
            <p className="text-muted-foreground mt-2">
              Buscando seus contratos no servidor.
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <X className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium">Erro ao carregar contratos</h3>
            <p className="text-muted-foreground mt-2">
              Não foi possível carregar os contratos. Verifique sua conexão e tente novamente.
            </p>
          </CardContent>
        </Card>
      ) : filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery 
                ? "Tente usar outro termo de busca." 
                : "Crie seu primeiro contrato clicando no botão 'Novo Contrato'."}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredContracts.map((contract) => (
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
                        R$ {contract.value.toFixed(2).replace('.', ',')}
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1"
                        onClick={() => handleView(contract.id, contract.eventType)}
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">Visualizar</span>
                      </Button>
                      
                      {contract.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleResend(contract.id, contract.clientEmail)}
                        >
                          <Send size={14} />
                          <span className="hidden sm:inline">Reenviar</span>
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleView(contract.id, contract.eventType)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => copyContractLink(contract.id, contract.eventType)}
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar link
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDownload(contract.id)}
                            className="cursor-pointer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          {contract.status === 'pendente' && (
                            <DropdownMenuItem 
                              onClick={() => handleResend(contract.id, contract.clientEmail)}
                              className="cursor-pointer"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Reenviar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(contract.id, contract.clientName)}
                            className="text-destructive cursor-pointer focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contrato de <strong>{contractToDelete?.clientName}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. Todos os dados do contrato serão permanentemente removidos do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sim, Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
