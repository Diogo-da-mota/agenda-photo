import React, { memo } from 'react';
import { MessageSquare, Mail, Calendar, CreditCard, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MensagemTemplate } from '@/services/mensagemService';
import { cn } from '@/lib/utils';

interface TemplateListProps {
  templates: MensagemTemplate[];
  onEdit: (template: MensagemTemplate) => void;
  templateSelecionado: MensagemTemplate | null;
  isLoading?: boolean;
}

// Componente individual para cada template
const TemplateItem = memo(({ 
  template, 
  isSelected, 
  onEdit 
}: { 
  template: MensagemTemplate, 
  isSelected: boolean, 
  onEdit: (template: MensagemTemplate) => void 
}) => {
  const getTypeIcon = (categoria: string) => {
    switch (categoria) {
      case 'lembrete':
        return <Calendar size={14} className="text-blue-500" />;
      case 'confirmacao':
        return <MessageSquare size={14} className="text-green-500" />;
      case 'pagamento':
        return <CreditCard size={14} className="text-orange-500" />;
      default:
        return <MessageSquare size={14} className="text-gray-500" />;
    }
  };
  
  const getCategoryBadge = (categoria: string) => {
    switch (categoria) {
      case 'lembrete':
        return <Badge variant="outline" className="ml-2 text-xs px-1 border-blue-200 text-blue-700 bg-blue-50">Lembrete</Badge>;
      case 'confirmacao':
        return <Badge variant="outline" className="ml-2 text-xs px-1 border-green-200 text-green-700 bg-green-50">Confirmação</Badge>;
      case 'pagamento':
        return <Badge variant="outline" className="ml-2 text-xs px-1 border-orange-200 text-orange-700 bg-orange-50">Pagamento</Badge>;
      default:
        return <Badge variant="outline" className="ml-2 text-xs px-1 border-gray-200 text-gray-700 bg-gray-50">Geral</Badge>;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-l-2",
        isSelected 
          ? "bg-blue-50 dark:bg-blue-950 border-l-blue-500" 
          : "border-l-transparent"
      )}
      onClick={() => onEdit(template)}
    >
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          {getTypeIcon(template.categoria)}
        </div>
        <div>
          <div className="flex items-center">
            <span className="font-medium text-sm">{template.titulo}</span>
            {getCategoryBadge(template.categoria)}
          </div>
          <div className="text-xs text-muted-foreground">
            Criado em {new Date(template.criado_em).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(template);
        }}
      >
        <Edit size={14} />
      </Button>
    </div>
  );
});

const TemplateListComponent: React.FC<TemplateListProps> = ({ 
  templates, 
  onEdit, 
  templateSelecionado,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="animate-pulse flex flex-col space-y-2">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
        <p>Nenhum template encontrado</p>
        <p className="text-xs">Clique em "Novo" para criar seu primeiro template</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 divide-y">
      {templates.map((template) => (
        <TemplateItem 
          key={template.id}
          template={template}
          isSelected={templateSelecionado?.id === template.id}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

// Exporta o componente com memorização para evitar re-renderizações desnecessárias
export const TemplateList = memo(TemplateListComponent);
