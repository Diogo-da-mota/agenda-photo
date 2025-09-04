export interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated?: (template: any) => void;
  onOpenChange?: (open: boolean) => void;
  onSave?: (template: any) => void;
  currentContent?: string;
}

export interface ContractTemplate {
  id: string;
  nome: string;
  conteudo: string;
  padrao?: boolean;
  id_fotografo: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ContractTemplateSelectorProps {
  onSelect: (template: ContractTemplate) => void;
  selectedTemplate?: ContractTemplate;
  onTemplateChange?: (template: ContractTemplate) => void;
  onTemplateContentChange?: (content: string) => void;
  currentContent?: string;
  onEdit?: () => void;
  onSave?: () => void;
  onRename?: (id: string, newName: string) => void;
  isEditing?: boolean;
}

export interface TemplateOption {
  id: string;
  name: string;
  content: string;
}

export interface TemplateSelectProps {
  options: TemplateOption[];
  onSelect: (option: TemplateOption) => void;
  selectedTemplate?: TemplateOption;
  templates?: TemplateOption[];
  onTemplateChange?: (template: TemplateOption) => void;
  onEdit?: () => void;
  onSave?: () => void;
  onRename?: (id: string, newName: string) => void;
  isEditing?: boolean;
}