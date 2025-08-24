
import React, { useState } from 'react';
import { sanitizeContractContent } from '@/utils/sanitization';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignatureCanvas } from '@/components/contratos/SignatureCanvas';
import { Check, Pen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignatureModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (signedBy: string, signature: string | null, ip: string) => void;
  contractTerms: string;
}

const SignatureModal = ({ isOpen, onOpenChange, onConfirm, contractTerms }: SignatureModalProps) => {
  const [signedBy, setSignedBy] = useState('');
  const [signMethod, setSignMethod] = useState<'draw' | 'text'>('draw');
  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const { toast } = useToast();

  // Fetch client IP on modal open
  React.useEffect(() => {
    if (isOpen) {
      fetchClientIP();
    }
  }, [isOpen]);

  const fetchClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip);
    } catch (error) {
      console.error('Failed to fetch IP:', error);
      setIpAddress('unknown');
    }
  };

  const handleSign = () => {
    if (!signedBy.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }
    
    if (signMethod === 'draw' && !signature) {
      toast({
        title: "Assinatura necessária",
        description: "Por favor, desenhe sua assinatura no campo abaixo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreed) {
      toast({
        title: "Termos não aceitos",
        description: "Você precisa concordar com os termos do contrato.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulando o processamento (normalmente enviaria para a API)
    setTimeout(() => {
      const finalSignature = signMethod === 'draw' ? signature : signedBy;
      onConfirm(signedBy, finalSignature, ipAddress);
      setLoading(false);
      
      // Reset form state
      setSignedBy('');
      setSignMethod('draw');
      setSignature(null);
      setAgreed(false);
    }, 1000);
  };

  const handleClearSignature = () => {
    setSignature(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assinar Contrato Digitalmente</DialogTitle>
          <DialogDescription>
            Revise os termos e condições e assine o contrato digitalmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="max-h-60 overflow-y-auto border rounded-md p-4 text-sm bg-muted/20">
            <style dangerouslySetInnerHTML={{
              __html: `
                .signature-modal-content {
                  white-space: pre-wrap;
                  line-height: 1.6;
                  font-family: inherit;
                }
                /* Centralizar título do contrato */
                .signature-modal-title {
                  text-align: center !important;
                  font-weight: bold;
                  margin: 0.5rem 0;
                  display: block;
                }
                .signature-modal-signatures {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  text-align: center !important;
                  margin: 2rem auto;
                  padding: 1rem 0;
                  width: 100%;
                  max-width: 400px;
                }
                .signature-modal-block {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  margin: 1rem 0;
                  width: 100%;
                }
                .signature-modal-line {
                  border-bottom: 1px solid #9CA3AF;
                  width: 250px;
                  margin: 0 auto 0.25rem auto;
                  height: 1px;
                }
                .signature-modal-name {
                  font-weight: 500;
                  margin: 0.25rem 0 0.125rem 0;
                  text-align: center;
                  font-size: 0.875rem;
                }
                .signature-modal-role {
                  font-size: 0.75rem;
                  color: #6B7280;
                  margin: 0;
                  text-align: center;
                }
              `
            }} />
            
            {(() => {
              // Regex para capturar as assinaturas (últimas 6 linhas do padrão)
              const signatureRegex = /\n\n______________________________________________________\n([^\n]+)\n([^\n]+)\n\n______________________________________________________\n([^\n]+)\n([^\n]+)$/;
              const match = contractTerms.match(signatureRegex);
              
              // Usar função segura de sanitização
              const processContractTitle = (text: string) => sanitizeContractContent(text);
              
              if (match) {
                // Separar o conteúdo principal das assinaturas
                const mainContent = contractTerms.replace(signatureRegex, '');
                const [, clientName, clientRole, photographerName, photographerRole] = match;
                
                return (
                  <>
                    <div 
                      className="signature-modal-content"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeContractContent(mainContent)
                      }}
                    />
                    
                    <div className="signature-modal-signatures">
                      <div className="signature-modal-block">
                        <div className="signature-modal-line"></div>
                        <div className="signature-modal-name">{clientName}</div>
                        <div className="signature-modal-role">{clientRole}</div>
                      </div>
                      
                      <div className="signature-modal-block">
                        <div className="signature-modal-line"></div>
                        <div className="signature-modal-name">{photographerName}</div>
                        <div className="signature-modal-role">{photographerRole}</div>
                      </div>
                    </div>
                  </>
                );
              } else {
                // Fallback se não encontrar o padrão de assinaturas
                return (
                  <div 
                    className="signature-modal-content"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeContractContent(contractTerms)
                    }}
                  />
                );
              }
            })()}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input 
                id="fullName"
                placeholder="Digite seu nome completo" 
                value={signedBy}
                onChange={e => setSignedBy(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Label>Método de Assinatura</Label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setSignMethod('draw')}
                    className={`px-3 py-1 text-sm rounded-l-md ${
                      signMethod === 'draw' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    Desenhar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignMethod('text')}
                    className={`px-3 py-1 text-sm rounded-r-md ${
                      signMethod === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    Digitar
                  </button>
                </div>
              </div>
              
              {signMethod === 'draw' ? (
                <div>
                  <div className="border rounded-md bg-white">
                    <SignatureCanvas
                      onSign={setSignature}
                      signature={signature}
                    />
                  </div>
                </div>
              ) : (
                <div className="border rounded-md bg-muted/20 p-4 h-[150px] flex items-center justify-center">
                  <p className="font-medium text-xl italic">
                    {signedBy || "Seu Nome"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="agree" className="font-normal text-sm">
                Eu, {signedBy || "[seu nome]"}, declaro que li e concordo com todos os termos e 
                condições deste contrato e autorizo sua validação por meio de assinatura digital.
              </Label>
            </div>

            <div className="bg-muted/30 p-3 rounded-md text-xs text-muted-foreground">
              <p>Para fins de validação legal, os seguintes dados serão registrados:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Data e hora da assinatura</li>
                <li>Endereço IP: {ipAddress || 'Carregando...'}</li>
                <li>Identificador único da sessão</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSign} 
            className="gap-2"
            disabled={!signedBy || (signMethod === 'draw' && !signature) || !agreed || loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                Processando...
              </>
            ) : (
              <>
                <Pen size={16} />
                Assinar Contrato
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
