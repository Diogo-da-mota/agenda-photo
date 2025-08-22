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
    <Card className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStatusGradient(contrato.status)} opacity-60`} />
      
      {/* Animated Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] bg-white rounded-lg" />
      
      <CardContent className="relative p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Status Section */}
          <div className="flex lg:flex-col items-center justify-center p-6 lg:w-24 bg-gradient-to-br from-white/80 via-slate-50/60 to-white/40 backdrop-blur-sm border-r border-slate-100/50">
            <div className="relative group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-sm" />
              <div className="relative p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50">
                {getStatusIcon(contrato.status)}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                    Contrato - {eventType}
                  </h3>
                  {/* Status, Data e Criado em ao lado do tipo de evento */}
                  <div className="flex items-center gap-3 ml-4">
                    <Badge className={`${getStatusColor(contrato.status)} font-semibold px-3 py-1 rounded-full shadow-sm`}>
                      {contrato.status}
                    </Badge>
                    {contrato.data_inicio && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full border border-blue-200/50 shadow-sm">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-800">
                          {format(new Date(contrato.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-gray-50 px-3 py-1 rounded-full border border-slate-200/50 shadow-sm">
                      <Clock className="h-3 w-3 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-700">
                        Criado em {format(new Date(contrato.criado_em), "dd/MM/yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <User className="h-4 w-4 text-slate-500" />
                  <p className="text-base font-semibold text-slate-700">{clientName}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {contrato.valor_total > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-full border border-emerald-200/50 shadow-sm">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">
                      {formatCurrency(contrato.valor_total)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 pt-0 border-t border-slate-100/50">
              <Button
                onClick={() => onViewContract(contrato)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-full font-semibold group-hover:scale-105"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Contrato
              </Button>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {(contrato.descricao || contrato.data_fim || contrato.local_evento || contrato.cpf_cliente) && (
          <>
            <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="p-6 bg-gradient-to-br from-slate-50/40 via-white/60 to-blue-50/30 backdrop-blur-sm">
            
                  

              
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4">
                {contrato.descricao && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800">Descrição</h4>
                    </div>
                    <p className="text-sm text-slate-700 font-medium ml-9">{contrato.descricao}</p>
                  </div>
                )}
                
                {contrato.cpf_cliente && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800">CPF do Cliente</h4>
                    </div>
                    <p className="text-sm text-slate-700 font-mono tracking-wider ml-9">{contrato.cpf_cliente}</p>
                  </div>
                )}
                
                {contrato.local_evento && (
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800">Local do Evento</h4>
                    </div>
                    <p className="text-sm text-slate-700 font-medium ml-9">{contrato.local_evento}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernContractCard;