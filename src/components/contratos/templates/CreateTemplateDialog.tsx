
import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, content: string) => void;
  currentContent?: string;
}

export const CreateTemplateDialog = ({
  isOpen, 
  onOpenChange,
  onSave,
  currentContent = ''
}: CreateTemplateDialogProps) => {
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const handleUseCurrentContent = () => {
    if (currentContent) {
      setNewTemplateContent(currentContent);
    }
  };

  const handleSave = () => {
    onSave(newTemplateName, newTemplateContent);
    setNewTemplateName('');
    setNewTemplateContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Modelo de Contrato</DialogTitle>
          <DialogDescription>
            Crie um modelo personalizado para uso futuro em seus contratos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Nome do Modelo</Label>
            <Input
              id="templateName"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Ex: Contrato para Eventos Corporativos"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="templateContent">Conteúdo do Contrato</Label>
              {currentContent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentContent}
                  className="text-xs"
                >
                  Usar conteúdo atual
                </Button>
              )}
            </div>
            <Textarea
              id="templateContent"
              value={newTemplateContent}
              onChange={(e) => setNewTemplateContent(e.target.value)}
              placeholder="Digite os termos e condições do contrato..."
              rows={15}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="gap-2">
            <Save size={16} />
            Salvar Modelo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
