
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { StandardizedMessage } from "@/types/messages";

interface MessageEditDialogProps {
  message: StandardizedMessage | null;
  onClose: () => void;
  onSave: (updatedMessage: Partial<StandardizedMessage>) => Promise<void>;
}

export const MessageEditDialog: React.FC<MessageEditDialogProps> = ({ 
  message, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<StandardizedMessage>>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (message) {
      setFormData({
        name: message.name,
        email: message.email,
        phone: message.phone || '',
        message: message.message
      });
    }
  }, [message]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving message:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!message) return null;

  return (
    <Dialog open={!!message} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Mensagem</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Mensagem
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="col-span-3"
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
