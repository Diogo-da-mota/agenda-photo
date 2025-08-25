import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientLoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientLoginModal = ({ isOpen, onOpenChange }: ClientLoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDirectAccess = async () => {
    setIsLoading(true);
    
    try {
      // Simulate brief loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fechar modal e navegar diretamente para /agenda/cliente
      onOpenChange(false);
      navigate('/agenda/cliente');
    } catch (error) {
      toast({
        title: "Erro ao acessar",
        description: "Não foi possível acessar a área do cliente. Tente novamente.",
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
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Portal do Cliente
          </DialogTitle>
          <DialogDescription>
            Clique no botão abaixo para acessar diretamente a agenda do cliente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Acesse sua agenda e acompanhe seus agendamentos de forma rápida e prática.
            </p>
            <p className="text-sm text-gray-500">
              Clique no botão abaixo para acessar diretamente sua área do cliente.
            </p>
          </div>
          
          <Button 
            onClick={handleDirectAccess} 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Acessando..." : "Acessar Agenda do Cliente"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientLoginModal;