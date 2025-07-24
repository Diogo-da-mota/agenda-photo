
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ClienteForm from './ClienteForm';
import { ClienteFormData } from '@/types/clients';

export interface ClienteDialogProps {
  userId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: ClienteFormData) => Promise<void>;
  defaultValues?: Partial<ClienteFormData>;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
}

const ClienteDialog: React.FC<ClienteDialogProps> = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = async () => {},
  defaultValues,
  isSubmitting = false,
  title = "Adicionar novo cliente",
  description = "Preencha os dados do cliente abaixo. Clique em salvar quando terminar."
}) => {
  const [open, setOpen] = React.useState(isOpen);

  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={16} />
          <span>Adicionar Cliente</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <ClienteForm 
            onSave={onSubmit} 
            defaultValues={defaultValues}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClienteDialog;
