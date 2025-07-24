
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ResendDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail: string;
  setRecipientEmail: (email: string) => void;
  onConfirm: () => void;
}

const ResendDialog = ({
  isOpen,
  onOpenChange,
  recipientEmail,
  setRecipientEmail,
  onConfirm
}: ResendDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reenviar Contrato</DialogTitle>
          <DialogDescription>
            Informe o email para reenviar o contrato. O destinatário receberá um link para visualizar e assinar o documento.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="email">Email do destinatário</Label>
          <Input 
            id="email" 
            value={recipientEmail} 
            onChange={(e) => setRecipientEmail(e.target.value)} 
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Reenviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResendDialog;
