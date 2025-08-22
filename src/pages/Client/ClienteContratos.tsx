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
    if (cliente) {
      fetchContratos();
    }
  }, [cliente]);

  const fetchContratos = async () => {
    if (!cliente) return;

    try {
      setIsLoading(true);
      
      // Buscar contratos na tabela 'contratos' pelo nome EXATO do cliente
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('nome_cliente', cliente.nome_completo)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Erro ao buscar contratos:', error);
        toast.error('Erro ao carregar seus contratos.');
        return;
      }

      setContratos(data || []);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast.error('Erro ao carregar seus contratos.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen p-4" style={{backgroundColor: '#0B0F17'}}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Meus Contratos</h1>
        </div>

        {/* Seção de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs de Status */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendente" className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-500" />
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="confirmado" className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Confirmados
            </TabsTrigger>
            <TabsTrigger value="concluido" className="flex items-center gap-2">
              <Check size={16} className="text-blue-500" />
              Concluídos
            </TabsTrigger>
            <TabsTrigger value="cancelado" className="flex items-center gap-2">
              <X size={16} className="text-red-500" />
              Cancelados
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de Contratos com Design Melhorado */}
        {filteredContratos.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-white/60 overflow-hidden">
            <div className="text-center py-20 px-8">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <div className="bg-gradient-to-br from-brand-blue to-brand-purple rounded-full w-20 h-20 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                </div>
                {/* Elementos decorativos */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 bg-brand-yellow rounded-full opacity-60"></div>
                <div className="absolute top-8 right-1/4 w-3 h-3 bg-brand-green rounded-full opacity-40"></div>
                <div className="absolute bottom-8 left-1/4 w-2 h-2 bg-brand-red rounded-full opacity-50"></div>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {searchQuery || statusFilter !== 'todos' ? '🔍 Nenhum contrato encontrado' : '📄 Nenhum contrato cadastrado'}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
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
                    className="mt-6 bg-gradient-to-r from-brand-blue to-brand-purple text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6">
              {filteredContratos.map((contrato, index) => (
                <div 
                  key={contrato.id} 
                  className="group transform transition-all duration-500 hover:scale-[1.02] animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft border border-white/60 overflow-hidden hover:shadow-elevation transition-all duration-300">
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