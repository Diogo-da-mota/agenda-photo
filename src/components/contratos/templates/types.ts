
export interface TemplateOption {
  id: string;
  name: string;
  content: string;
}

export interface TemplateSelectProps {
  selectedTemplate: string;
  templates: TemplateOption[];
  onTemplateChange: (templateId: string) => void;
  onEdit?: () => void;
  onSave?: (templateName: string) => void;
  onRename?: (templateId: string, newName: string) => void;
  isEditing?: boolean;
}



export interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, content: string) => void;
  currentContent?: string;
}

export interface ContractTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onTemplateContentChange: (content: string) => void;
  currentContent?: string;
  onEdit?: () => void;
  onSave?: (templateName: string) => void;
  onRename?: (templateId: string, newName: string) => void;
  isEditing?: boolean;
}
