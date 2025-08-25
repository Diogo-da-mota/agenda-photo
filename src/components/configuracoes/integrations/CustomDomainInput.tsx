
import React, { useState } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CustomDomainInputProps {
  hasPaidPlan: boolean;
}

const CustomDomainInput: React.FC<CustomDomainInputProps> = ({ hasPaidPlan }) => {
  const { toast } = useToast();
  const [customDomain, setCustomDomain] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const handleVerifyDomain = () => {
    if (!customDomain) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira um domínio válido.",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);
    
    // Simulação de verificação
    setTimeout(() => {
      setIsVerifying(false);
      
    }, 1500);
  };
  
  if (!hasPaidPlan) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
        <div className="flex items-start space-x-3">
          <div className="mt-1 bg-blue-900/50 dark:bg-blue-800/50 rounded-md p-2">
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-base font-medium text-white">Domínio Personalizado</h3>
              <Badge variant="outline" className="bg-amber-600/20 text-amber-400 border-amber-600/30">
                Plano Pago
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-300">
              Disponível apenas para assinantes do plano premium
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-start space-x-3 mb-3">
        <div className="mt-1 bg-blue-900/50 dark:bg-blue-800/50 rounded-md p-2">
          <Globe className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="text-base font-medium text-white">Domínio Personalizado</h3>
          </div>
          <p className="mt-1 text-sm text-gray-300">
            Configure um domínio personalizado para seu portal de clientes
          </p>
        </div>
      </div>
      
      <div className="ml-10 mr-5 space-y-4 mt-3 p-3 bg-gray-700/30 rounded-md">
        <Alert className="bg-blue-900/20 border-blue-500/30 text-gray-200">
          <AlertDescription>
            Você precisará configurar um registro CNAME no seu provedor de DNS apontando para nossa plataforma.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="seu-dominio.com.br"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-gray-200 placeholder:text-gray-400"
            />
          </div>
          <Button 
            onClick={handleVerifyDomain} 
            disabled={isVerifying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isVerifying ? "Verificando..." : "Verificar"}
            {!isVerifying && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomDomainInput;
