export interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated?: (template: any) => void;
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