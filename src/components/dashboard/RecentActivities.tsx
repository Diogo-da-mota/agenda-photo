
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  Filter, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { 
  buscarAtividades, 
  formatarTempoRelativo,
  type AtividadeFormatada,
  TIPOS_ATIVIDADE
} from '@/services/atividadeService';

export type ActivityStatus = 'completed' | 'pending' | 'canceled' | 'important';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'client' | 'schedule' | 'payment' | 'contract' | 'other';
  status: ActivityStatus;
}

interface RecentActivitiesProps {
  className?: string;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ className }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [atividades, setAtividades] = useState<AtividadeFormatada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar atividades reais do banco
  useEffect(() => {
    const carregarAtividades = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const atividadesReais = await buscarAtividades(user.id, 15);
        setAtividades(atividadesReais);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        setAtividades([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarAtividades();
  }, [user?.id]);
  
  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      case 'important':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Importante
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      case 'schedule':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'contract':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const filteredActivities = atividades.filter(activity => {
    // Filter by type
    if (filterType !== 'all' && activity.type !== filterType) {
      return false;
    }
    
    // Filter by search term
    if (
      searchTerm &&
      !activity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Atividades Recentes
        </CardTitle>
        <CardDescription>
          Acompanhe as últimas ações realizadas no sistema
        </CardDescription>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar atividades..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
              <SelectItem value="schedule">Agendamentos</SelectItem>
              <SelectItem value="payment">Pagamentos</SelectItem>
              <SelectItem value="contract">Contratos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando atividades...</span>
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="border-b pb-3 last:border-none last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                    {getTypeIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'all' 
                  ? 'Nenhuma atividade encontrada com os filtros aplicados'
                  : 'Nenhuma atividade recente encontrada'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
                  <Link to="/atividades-linha-do-tempo">
          Ver todas as atividades
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentActivities;
