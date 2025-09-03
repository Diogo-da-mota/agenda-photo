import React, { useState, useEffect } from 'react';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Phone, DollarSign, FileText, LogOut, User, Clock, Check, X, Eye, Search, Filter, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useCopyLink } from '@/hooks/useCopyLink';
import { generateContractUrl } from '@/utils/slugify';
import ModernContractCard from '@/components/ui/modern-contract-card';

interface Contrato {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  nome_cliente: string;
  cpf_cliente: string;
  valor_total: number;
  data_inicio: string;
  data_fim: string;
  local_evento: string;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
  id_contrato?: string;
  id_amigavel?: number;
}

const ClienteContratos: React.FC = () => {
  const { cliente, logout } = useClienteAuth();
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const { copyContractLink } = useCopyLink();

  useEffect(() => {
    console.log('🔍 [DEBUG-CONTRATOS] useEffect triggered');
    console.log('🔍 [DEBUG-CONTRATOS] Cliente object:', cliente);
    console.log('🔍 [DEBUG-CONTRATOS] Cliente nome_completo:', cliente?.nome_completo);
    console.log('🔍 [DEBUG-CONTRATOS] Cliente titulo:', cliente?.titulo);
    
    if (cliente) {
      console.log('✅ [DEBUG-CONTRATOS] Cliente exists, calling fetchContratos');
      fetchContratos();
    } else {
      console.log('❌ [DEBUG-CONTRATOS] No cliente found, skipping fetchContratos');
    }
  }, [cliente]);

  const fetchContratos = async () => {
    console.log('🔍 [DEBUG-CONTRATOS] fetchContratos called');
    
    if (!cliente) {
      console.log('❌ [DEBUG-CONTRATOS] No cliente available, returning early');
      return;
    }

    console.log('🔍 [DEBUG-CONTRATOS] Cliente data for query:', {
      id: cliente.id,
      titulo: cliente.titulo,
      nome_completo: cliente.nome_completo,
      cpf_cliente: cliente.cpf_cliente
    });

    try {
      setIsLoading(true);
      console.log('🔍 [DEBUG-CONTRATOS] Starting Supabase query');
      console.log('🔍 [DEBUG-CONTRATOS] Query filter - nome_cliente:', cliente.nome_completo);
      
      // Buscar contratos na tabela 'contratos' pelo nome EXATO do cliente
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('nome_cliente', cliente.nome_completo)
        .order('criado_em', { ascending: false });

      console.log('🔍 [DEBUG-CONTRATOS] Supabase response:');
      console.log('🔍 [DEBUG-CONTRATOS] - Error:', error);
      console.log('🔍 [DEBUG-CONTRATOS] - Data:', data);
      console.log('🔍 [DEBUG-CONTRATOS] - Data length:', data?.length || 0);

      if (error) {
        console.error('❌ [DEBUG-CONTRATOS] Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error('Erro ao carregar seus contratos.');
        return;
      }

      console.log('✅ [DEBUG-CONTRATOS] Setting contratos state with:', data?.length || 0, 'items');
      setContratos(data || []);
      
      // Log individual contracts for debugging
      if (data && data.length > 0) {
        data.forEach((contrato, index) => {
          console.log(`🔍 [DEBUG-CONTRATOS] Contract ${index + 1}:`, {
            id: contrato.id,
            titulo: contrato.titulo,
            nome_cliente: contrato.nome_cliente,
            status: contrato.status,
            valor_total: contrato.valor_total
          });
        });
      }
      
    } catch (error) {
      console.error('❌ [DEBUG-CONTRATOS] Catch block error:', error);
      console.error('❌ [DEBUG-CONTRATOS] Error stack:', error.stack);
      toast.error('Erro ao carregar seus contratos.');
    } finally {
      setIsLoading(false);
      console.log('🔍 [DEBUG-CONTRATOS] Loading set to false');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmado':
        return 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-800';
      case 'pendente':
        return 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800';
      case 'cancelado':
        return 'bg-gray-100 border-gray-300 dark:bg-gray-900/20 dark:border-gray-800';
      case 'concluido':
        return 'bg-purple-100 border-purple-300 dark:bg-purple-900/20 dark:border-purple-800';
      default:
        return 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmado':
      case 'concluido':
        return <Check className="h-5 w-5 text-brand-green" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-brand-yellow" />;
      case 'cancelado':
        return <X className="h-5 w-5 text-brand-red" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR
      });
    } catch {
      return dateString;
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Filtrar contratos baseado na busca e status
  const filteredContratos = contratos.filter(contrato => {
    const matchesSearch = searchQuery === '' || 
      contrato.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contrato.nome_cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contrato.descricao?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || contrato.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Carregando seus contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{backgroundColor: '#0B0F17'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">Meus Contratos</h1>
        </div>

        {/* Seção de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-11"
            />
          </div>
        </div>

        {/* Tabs de Status */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full mb-4 sm:mb-6">
          <div className="block sm:hidden">
            <TabsList className="grid grid-cols-2 w-full gap-1 mb-2">
              <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
              <TabsTrigger value="pendente" className="flex items-center gap-1 text-xs">
                <span className="truncate">Pendentes</span>
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-2 w-full gap-1 mb-2">
              <TabsTrigger value="confirmado" className="flex items-center gap-1 text-xs">
                <span className="truncate">Confirmados</span>
              </TabsTrigger>
              <TabsTrigger value="concluido" className="flex items-center gap-1 text-xs">
                <span className="truncate">Concluídos</span>
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-1 w-full">
              <TabsTrigger value="cancelado" className="flex items-center gap-1 text-xs">
                <span className="truncate">Cancelados</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsList className="hidden sm:grid sm:grid-cols-5 w-full gap-0">
            <TabsTrigger value="todos" className="text-sm">Todos</TabsTrigger>
            <TabsTrigger value="pendente" className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-yellow-500" />
              <span className="truncate">Pendentes</span>
            </TabsTrigger>
            <TabsTrigger value="confirmado" className="flex items-center gap-2 text-sm">
              <Check size={14} className="text-green-500" />
              <span className="truncate">Confirmados</span>
            </TabsTrigger>
            <TabsTrigger value="concluido" className="flex items-center gap-2 text-sm">
              <Check size={14} className="text-blue-500" />
              <span className="truncate">Concluídos</span>
            </TabsTrigger>
            <TabsTrigger value="cancelado" className="flex items-center gap-2 text-sm">
              <X size={14} className="text-red-500" />
              <span className="truncate">Cancelados</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de Contratos com Design Melhorado */}
        {filteredContratos.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-soft border border-white/60 overflow-hidden">
            <div className="text-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
              <div className="relative mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 rounded-full w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <div className="bg-gradient-to-br from-brand-blue to-brand-purple rounded-full w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 flex items-center justify-center">
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                  </div>
                </div>
                {/* Elementos decorativos */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 sm:-translate-y-4 w-3 h-3 sm:w-4 sm:h-4 bg-brand-yellow rounded-full opacity-60"></div>
                <div className="absolute top-4 sm:top-8 right-1/4 w-2 h-2 sm:w-3 sm:h-3 bg-brand-green rounded-full opacity-40"></div>
                <div className="absolute bottom-4 sm:bottom-8 left-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-red rounded-full opacity-50"></div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 max-w-sm sm:max-w-md mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {searchQuery || statusFilter !== 'todos' ? '🔍 Nenhum contrato encontrado' : '📄 Nenhum contrato cadastrado'}
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  {searchQuery || statusFilter !== 'todos' 
                    ? 'Tente ajustar os filtros de busca para encontrar o que procura.' 
                    : 'Seus contratos aparecerão aqui assim que forem criados.'}
                </p>
                
                {(searchQuery || statusFilter !== 'todos') && (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('todos');
                    }}
                    className="mt-4 sm:mt-6 w-full sm:w-auto bg-gradient-to-r from-brand-blue to-brand-purple text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {filteredContratos.map((contrato, index) => (
                <div 
                  key={contrato.id} 
                  className="group transform transition-all duration-500 hover:scale-[1.01] sm:hover:scale-[1.02] animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-soft border border-white/60 overflow-hidden hover:shadow-elevation transition-all duration-300">
                    <ModernContractCard
                      contrato={contrato}
                      onViewContract={(contrato) => {
                        try {
                          let link: string;
                          
                          // Debug: verificar os dados do contrato
                          console.log('Dados do contrato:', {
                            id: contrato.id,
                            id_contrato: (contrato as any).id_contrato,
                            id_amigavel: (contrato as any).id_amigavel,
                            nome_cliente: contrato.nome_cliente
                          });
                          
                          // Usar a mesma lógica do ContractHeader.tsx
                          if ((contrato as any).id_amigavel && contrato.nome_cliente) {
                            // Usar novo formato com dados completos
                            const contractData = {
                              id_contrato: (contrato as any).id_contrato || contrato.id,
                              id_amigavel: (contrato as any).id_amigavel,
                              nome_cliente: contrato.nome_cliente
                            };
                            
                            link = `${window.location.origin}${generateContractUrl(contractData)}`;
                          } else {
                            // Fallback para formato legado usando id_contrato ou id
                            const contractId = (contrato as any).id_contrato || contrato.id;
                            link = `${window.location.origin}${generateContractUrl(contractId, contrato.titulo || '')}`;
                          }
                          
                          window.open(link, '_blank');
                        } catch (error) {
                          console.error('Erro ao gerar URL do contrato:', error);
                          toast.error('Erro ao abrir contrato');
                        }
                      }}
                      formatCurrency={formatCurrency}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteContratos;