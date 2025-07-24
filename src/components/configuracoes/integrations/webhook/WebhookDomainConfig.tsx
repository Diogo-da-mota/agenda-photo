
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookDomainConfigProps {
  savedDomain: string;
  domainInput: string;
  setDomainInput: (value: string) => void;
  isLoading: boolean;
  webhookId: string;
  onSaveDomain: () => Promise<void>;
}

const WebhookDomainConfig: React.FC<WebhookDomainConfigProps> = ({
  savedDomain,
  domainInput,
  setDomainInput,
  isLoading,
  webhookId,
  onSaveDomain
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Gerar a URL do webhook baseada no domínio
  const generateWebhookUrl = (domain: string, id: string): string => {
    if (!domain) {
      return `https://sykjzikcaclutfpuwuri.supabase.co/functions/v1/webhook/${id}`;
    }
    
    // Garantir que a URL comece com https://
    const formattedDomain = domain.startsWith('http') ? domain : `https://${domain}`;
    return `${formattedDomain}/webhook/${id}`;
  };

  const generatedWebhookUrl = generateWebhookUrl(savedDomain, webhookId);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedWebhookUrl);
      setIsCopied(true);
      
      toast({
        title: "URL copiada!",
        description: "A URL do webhook foi copiada para a área de transferência.",
      });
      
      // Reset the "Copied" state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-5">
      <h3 className="font-medium mb-2">Domínio Personalizado</h3>
      <p className="text-sm text-gray-500 mb-4">
        Configure seu domínio personalizado para gerar automaticamente a URL do webhook.
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="meufotografo.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Insira apenas o nome do domínio, sem http:// ou https://
            </p>
          </div>
          <Button 
            onClick={onSaveDomain} 
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            {isLoading ? "Salvando..." : "Salvar Domínio"}
          </Button>
        </div>
        
        {savedDomain && (
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2">URL do Webhook Gerada:</h4>
            <div className="flex gap-2">
              <Input
                value={generatedWebhookUrl}
                readOnly
                className="flex-1 bg-gray-100"
              />
              <Button 
                onClick={copyToClipboard} 
                variant="outline"
                className="min-w-[120px]"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar URL
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookDomainConfig;
