import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Clock, Users, FileText, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface SecurityMetrics {
  totalUsers: number;
  activeSessionsToday: number;
  securityEvents: number;
  rateLimitHits: number;
  fileUploadsToday: number;
  lastSecurityAudit: string | null;
}

export const SecurityMetrics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeSessionsToday: 0,
    securityEvents: 0,
    rateLimitHits: 0,
    fileUploadsToday: 0,
    lastSecurityAudit: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityMetrics = async () => {
      if (!user) return;

      try {
        // Buscar eventos de segurança das últimas 24 horas
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const { data: securityEvents } = await supabase
          .from('sistema_atividades')
          .select('*')
          .eq('table_name', 'security_events')
          .gte('timestamp', last24Hours.toISOString());

        // Buscar eventos de rate limiting
        const rateLimitEvents = securityEvents?.filter(
          event => event.new_data?.event_type === 'RATE_LIMIT_EXCEEDED'
        ) || [];

        // Buscar uploads de arquivo
        const fileUploadEvents = securityEvents?.filter(
          event => event.new_data?.event_type === 'FILE_UPLOAD_SUCCESS'
        ) || [];

        // Buscar última auditoria
        const { data: lastAudit } = await supabase
          .from('sistema_atividades')
          .select('timestamp')
          .eq('table_name', 'security_events')
          .like('new_data->event_type', '%AUDIT%')
          .order('timestamp', { ascending: false })
          .limit(1);

        setMetrics({
          totalUsers: 1, // Usuário atual logado
          activeSessionsToday: 1,
          securityEvents: securityEvents?.length || 0,
          rateLimitHits: rateLimitEvents.length,
          fileUploadsToday: fileUploadEvents.length,
          lastSecurityAudit: lastAudit?.[0]?.timestamp || null
        });

      } catch (error) {
        console.error('Erro ao buscar métricas de segurança:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityMetrics();
  }, [user]);

  const getSecurityStatus = (): { color: string; icon: React.ReactNode; text: string } => {
    const { rateLimitHits, securityEvents } = metrics;
    
    if (rateLimitHits > 10 || securityEvents > 50) {
      return {
        color: 'text-red-600',
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
        text: 'Atenção Necessária'
      };
    } else if (rateLimitHits > 5 || securityEvents > 20) {
      return {
        color: 'text-yellow-600',
        icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
        text: 'Monitoramento'
      };
    } else {
      return {
        color: 'text-green-600',
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        text: 'Sistema Seguro'
      };
    }
  };

  const status = getSecurityStatus();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Métricas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={50} className="w-full animate-pulse" />
            <div className="text-sm text-muted-foreground">Carregando métricas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status de Segurança
          </CardTitle>
          <CardDescription>
            Visão geral da segurança nas últimas 24 horas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {status.icon}
            <span className={`font-semibold ${status.color}`}>{status.text}</span>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.securityEvents}</p>
                <p className="text-sm text-muted-foreground">Eventos de Segurança</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.rateLimitHits}</p>
                <p className="text-sm text-muted-foreground">Rate Limits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.fileUploadsToday}</p>
                <p className="text-sm text-muted-foreground">Uploads Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm font-bold">
                  {metrics.lastSecurityAudit 
                    ? new Date(metrics.lastSecurityAudit).toLocaleDateString('pt-BR')
                    : 'Nunca'
                  }
                </p>
                <p className="text-sm text-muted-foreground">Última Auditoria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.activeSessionsToday}</p>
                <p className="text-sm text-muted-foreground">Sessões Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Segurança */}
      {(metrics.rateLimitHits > 5 || metrics.securityEvents > 20) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.rateLimitHits > 5 && (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  Alto número de rate limits: {metrics.rateLimitHits}
                </Badge>
              )}
              {metrics.securityEvents > 20 && (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  Muitos eventos de segurança: {metrics.securityEvents}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};