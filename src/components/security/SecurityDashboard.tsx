
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, CheckCircle, XCircle, Activity } from 'lucide-react';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { SecurityMetrics } from './SecurityMetrics';

export const SecurityDashboard: React.FC = () => {
  const {
    isAuditing,
    issues,
    progress,
    runSecurityAudit,
    getSeverityCount,
    getSecurityScore
  } = useSecurityAudit();

  const securityScore = getSecurityScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Painel de Segurança
          </CardTitle>
          <CardDescription>
            Monitore e gerencie a segurança do seu projeto
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getScoreIcon(securityScore)}
              <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}%
              </span>
              <span className="text-muted-foreground">Score de Segurança</span>
            </div>
            
            <Button
              onClick={runSecurityAudit}
              disabled={isAuditing}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {isAuditing ? 'Auditando...' : 'Executar Auditoria'}
            </Button>
          </div>

          {isAuditing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da auditoria</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {issues.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Problemas Encontrados</h4>
              
              <div className="flex gap-2 flex-wrap">
                <Badge variant="destructive">
                  {getSeverityCount('critical')} Críticos
                </Badge>
                <Badge variant="secondary">
                  {getSeverityCount('high')} Altos
                </Badge>
                <Badge variant="outline">
                  {getSeverityCount('medium')} Médios
                </Badge>
                <Badge variant="default">
                  {getSeverityCount('low')} Baixos
                </Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      issue.severity === 'critical' 
                        ? 'border-red-200 bg-red-50' 
                        : issue.severity === 'high'
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium">{issue.table}</h5>
                        <p className="text-sm text-muted-foreground">{issue.issue}</p>
                        <p className="text-xs mt-1 font-medium">
                          Recomendação: {issue.recommendation}
                        </p>
                      </div>
                      <Badge
                        variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="ml-2"
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Métricas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit" className="space-y-4">
          {/* Conteúdo da auditoria já existente permanece aqui */}
        </TabsContent>
        
        <TabsContent value="metrics" className="space-y-4">
          <SecurityMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
