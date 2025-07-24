import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Copy,
  Save,
  Loader2,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react';

const SiteDominio: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<'checking' | 'connected' | 'error' | 'pending'>('pending');

  const currentDomain = 'meuportfolio.agendaphoto.com.br';
  
  const handleSave = async () => {
    setIsLoading(true);
    setDomainStatus('checking');
    
    // Simular verificação de domínio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular resultado aleatório para demo
    const success = Math.random() > 0.3;
    setDomainStatus(success ? 'connected' : 'error');
    setIsLoading(false);
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
  };

  const plans = [
    {
      name: 'Domínio Grátis',
      price: 'Grátis',
      domain: 'agendaphoto.com.br',
      features: [
        'Subdomínio personalizado',
        'SSL incluído',
        'Sem taxa de configuração'
      ],
      current: true
    },
    {
      name: 'Domínio Próprio',
      price: 'R$ 49/ano',
      domain: 'seusite.com.br',
      features: [
        'Domínio personalizado',
        'SSL Premium',
        'E-mail profissional',
        'Suporte prioritário'
      ],
      current: false
    }
  ];

  const getStatusIcon = () => {
    switch (domainStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (domainStatus) {
      case 'connected':
        return { type: 'success', message: 'Domínio conectado com sucesso!' };
      case 'error':
        return { type: 'error', message: 'Erro ao conectar domínio. Verifique as configurações DNS.' };
      case 'checking':
        return { type: 'info', message: 'Verificando configurações do domínio...' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Domínio</h2>
            <p className="text-sm text-muted-foreground">
              Configure seu domínio personalizado
            </p>
          </div>
        </div>
      </div>

      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domínio Atual
          </CardTitle>
          <CardDescription>
            Seu site está disponível no seguinte endereço
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-mono text-sm">{currentDomain}</span>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyDomain}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`https://${currentDomain}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de domínio próprio */}
      <Card>
        <CardHeader>
          <CardTitle>Domínio Personalizado</CardTitle>
          <CardDescription>
            Configure seu próprio domínio para uma aparência mais profissional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-domain">Seu domínio</Label>
              <div className="flex gap-3">
                <Input
                  id="custom-domain"
                  placeholder="meusite.com.br"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSave} 
                  disabled={!customDomain || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Conectar
                </Button>
              </div>
            </div>

            {getStatusMessage() && (
              <Alert className={`${
                getStatusMessage()?.type === 'success' ? 'border-green-200 bg-green-50' :
                getStatusMessage()?.type === 'error' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription className="text-sm">
                    {getStatusMessage()?.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          {/* Instruções DNS */}
          {customDomain && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Configurações DNS Necessárias</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione os seguintes registros DNS no seu provedor de domínio:
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <strong>Tipo:</strong> CNAME
                      </div>
                      <div>
                        <strong>Nome:</strong> www
                      </div>
                      <div>
                        <strong>Valor:</strong> agendaphoto.com.br
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <strong>Tipo:</strong> A
                      </div>
                      <div>
                        <strong>Nome:</strong> @
                      </div>
                      <div>
                        <strong>Valor:</strong> 192.168.1.100
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Após configurar o DNS, pode levar até 24 horas para propagar completamente.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos disponíveis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Planos de Domínio</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.current && <Badge>Atual</Badge>}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.price !== 'Grátis' && (
                    <span className="text-sm text-muted-foreground">por ano</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm">{plan.domain}</span>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {!plan.current && (
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Contratar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recursos Inclusos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Certificado SSL</h4>
                <p className="text-sm text-muted-foreground">
                  Segurança automática para todos os domínios
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">CDN Global</h4>
                <p className="text-sm text-muted-foreground">
                  Carregamento rápido em qualquer lugar do mundo
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">DNS Gerenciado</h4>
                <p className="text-sm text-muted-foreground">
                  Configuração automática e otimizada
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteDominio;
