import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign, 
  FileText, 
  User, 
  Clock, 
  Check, 
  X, 
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContractCardProps {
  contrato: {
    id: string;
    titulo: string;
    descricao?: string;
    status: string;
    nome_cliente: string;
    cpf_cliente?: string;
    valor_total: number;
    data_inicio?: string;
    data_fim?: string;
    local_evento?: string;
    observacoes?: string;
    criado_em: string;
    atualizado_em?: string;
    id_contrato?: string;
    id_amigavel?: number;
  };
  onViewContract: (contrato: any) => void;
  formatCurrency: (value: number) => string;
}

const ModernContractCard: React.FC<ContractCardProps> = ({ 
  contrato, 
  onViewContract, 
  formatCurrency 
}) => {
  // Função para extrair o tipo de evento do título
  const extractEventType = (titulo: string) => {
    // Remove "Contrato - " do início e o nome do cliente do final
    const withoutContrato = titulo.replace(/^Contrato - /, '');
    // Procura por padrões como "Casamento - Nome" ou "Evento - Nome"
    const match = withoutContrato.match(/^([^-]+) - (.+)$/);
    if (match) {
      return {
        eventType: match[1].trim(),
        clientName: match[2].trim()
      };
    }
    // Se não encontrar o padrão, retorna o título original
    return {
      eventType: withoutContrato,
      clientName: contrato.nome_cliente
    };
  };

  const { eventType, clientName } = extractEventType(contrato.titulo);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case 'assinado':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'expirado':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'assinado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'expirado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'from-amber-50 via-orange-50/30 to-yellow-50/20';
      case 'assinado':
        return 'from-emerald-50 via-green-50/30 to-teal-50/20';
      case 'expirado':
        return 'from-red-50 via-rose-50/30 to-pink-50/20';
      default:
        return 'from-slate-50 via-gray-50/30 to-blue-50/20';
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 w-full">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(contrato.status)} opacity-60`} />
      
      {/* Animated Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] bg-white rounded-lg" />
      
      <CardContent className="relative p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6">
            {/* Header - Layout responsivo: mobile vertical, desktop horizontal */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
              {/* Seção do Título e Informações - Mobile: largura total, Desktop: largura fixa */}
              <div className="lg:w-80 xl:w-96 space-y-2 sm:space-y-3">
                {/* Título Principal */}
                <div className="flex items-center">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300 truncate">
                    Contrato - {eventType}
                  </h3>
                </div>
                
                {/* Badges e Informações */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 ml-0 sm:ml-4">
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                    {contrato.data_inicio && (
                      <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-2 sm:px-3 py-1 rounded-full border border-blue-200/50 shadow-sm">
                        <Calendar className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-blue-800 whitespace-nowrap">
                          {format(new Date(contrato.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-slate-50 to-gray-50 px-2 sm:px-3 py-1 rounded-full border border-slate-200/50 shadow-sm">
                      <Clock className="h-3 w-3 text-slate-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                        Criado em {format(new Date(contrato.criado_em), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Nome do Cliente */}
                <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
                  <p className="text-sm sm:text-base font-semibold text-slate-700 truncate">{clientName}</p>
                </div>
                
                {/* Valor do Contrato e Status */}
                <div className="flex flex-row gap-2 sm:gap-3 ml-0 sm:ml-4">
                  {contrato.valor_total > 0 && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-green-50 px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm w-fit">
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-bold text-emerald-800 whitespace-nowrap">
                        {formatCurrency(contrato.valor_total)}
                      </span>
                    </div>
                  )}
                  <Badge className={`${getStatusColor(contrato.status)} font-semibold px-2 sm:px-3 py-1 rounded-full shadow-sm text-xs sm:text-sm w-fit`}>
                    {contrato.status}
                  </Badge>
                </div>
              </div>

              {/* Cards de Detalhes - Mobile: ocultos, Desktop: visíveis horizontalmente */}
              {(contrato.descricao || contrato.cpf_cliente || contrato.local_evento) && (
                <div className="hidden lg:flex lg:flex-1 lg:gap-4 xl:gap-6">
                  {/* Card Descrição - Largura maior */}
                  {contrato.descricao && (
                    <div className="flex-1 min-w-0 p-3 xl:p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-slate-800 text-sm">Descrição</h4>
                      </div>
                      <p className="text-xs text-slate-700 font-medium ml-7 line-clamp-3">{contrato.descricao}</p>
                    </div>
                  )}
                  
                  {/* Card CPF - Largura menor */}
                  {contrato.cpf_cliente && (
                    <div className="w-32 xl:w-36 flex-shrink-0 p-2.5 xl:p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="p-1 bg-purple-100 rounded-lg flex-shrink-0">
                          <User className="h-3 w-3 text-purple-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">CPF</h4>
                      </div>
                      <p className="text-xs text-slate-600 ml-4 font-mono break-all">
                        {contrato.cpf_cliente}
                      </p>
                    </div>
                  )}
                  
                  {/* Card Local - Largura menor */}
                  {contrato.local_evento && (
                    <div className="w-36 xl:w-40 flex-shrink-0 p-2.5 xl:p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="p-1 bg-green-100 rounded-lg flex-shrink-0">
                          <MapPin className="h-3 w-3 text-green-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">Local</h4>
                      </div>
                      <p className="text-xs text-slate-600 ml-4 line-clamp-2">{contrato.local_evento}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Detalhes para Mobile e Botão Visualizar */}
        {(contrato.descricao || contrato.data_fim || contrato.local_evento || contrato.cpf_cliente) && (
          <>
            <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent lg:hidden" />
            <div className="p-1 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50/40 via-white/60 to-blue-50/30 backdrop-blur-sm">
              {/* Cards de detalhes - Visíveis apenas em mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1.5 mb-3 sm:mb-4 lg:hidden">
                {contrato.descricao && (
                  <div className="sm:col-span-2 p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm sm:text-base">Descrição</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium ml-6 sm:ml-9 line-clamp-3">{contrato.descricao}</p>
                  </div>
                )}
                
                {contrato.cpf_cliente && (
                  <div className="p-1.5 sm:p-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                      <div className="p-1 sm:p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                        <User className="h-3 w-3 sm:h-2.5 sm:w-3.5 text-purple-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-slate-800">CPF</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 ml-4 sm:ml-5 font-mono">
                      {contrato.cpf_cliente}
                    </p>
                  </div>
                )}
                
                {contrato.local_evento && (
                  <div className="p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                      <div className="p-1 sm:p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-slate-800">Local</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 ml-4 sm:ml-5 line-clamp-2">{contrato.local_evento}</p>
                  </div>
                )}
              </div>
              
              {/* Botão Visualizar Contrato */}
              <div className="mt-4 sm:-mt-12 flex justify-center">
                <Button
                  onClick={() => onViewContract(contrato)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 sm:px-8 lg:px-10 py-2 sm:py-2.5 lg:py-3 rounded-full font-semibold group-hover:scale-105 text-sm sm:text-base"
                >
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">Visualizar Contrato</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernContractCard;