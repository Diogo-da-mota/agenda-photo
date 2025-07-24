
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Mail, Phone, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientLoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientLoginModal = ({ isOpen, onOpenChange }: ClientLoginModalProps) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Código de verificação enviado",
        description: `Enviamos um código de acesso para ${email}`,
      });
      
      setStep('verification');
    } catch (error) {
      toast({
        title: "Erro ao enviar código",
        description: "Não foi possível enviar o código de verificação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login bem-sucedido",
        description: "Você foi autenticado com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Código inválido",
        description: "O código informado é inválido ou expirou.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{step === 'form' ? 'Acesso para Clientes' : 'Verificação'}</DialogTitle>
        </DialogHeader>
        
        {step === 'form' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="client-email" className="text-sm font-medium">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="client-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="client-phone" className="text-sm font-medium">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="client-phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel" 
                  placeholder="(00) 00000-0000" 
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Usamos para confirmar sua identidade. Você receberá um código de acesso temporário.</p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Receber código de acesso"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verification-code" className="text-sm font-medium">Código de Verificação</label>
              <Input 
                id="verification-code" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                type="text" 
                placeholder="Digite o código recebido" 
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500">Digite o código de 6 dígitos enviado para {email}</p>
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('form')}
                disabled={isLoading}
              >
                Voltar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Acessar"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClientLoginModal;
