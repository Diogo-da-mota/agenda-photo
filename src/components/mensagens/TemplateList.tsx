import React, { memo } from 'react';
import { MessageSquare, Mail, Calendar, CreditCard, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MensagemTemplate } from '@/services/mensagemService';
import { cn } from '@/lib/utils';

interface TemplateListProps {
  templates: MensagemTemplate[];
  onEdit: (template: MensagemTemplate) => void;
  templateSelecionado: MensagemTemplate | null;
  isLoading?: boolean;
  onInicializarTemplates?: () => void;
  inicializandoTemplates?: boolean;
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
  const isPlaceholder = template.id.startsWith('placeholder-');
  
  const getTypeIcon = (categoria: string) => {
    switch (categoria) {
      case 'lembrete':
        return <Calendar size={14} className="text-blue-500" />;
      case 'confirmacao':
        return <MessageSquare size={14} className="text-green-500" />;
      case 'pagamento':
        return <CreditCard size={14} className="text-orange-500" />;
      case 'promocao':
        return <Tag size={14} className="text-purple-500" />;
      default:
        return <MessageSquare size={14} className="text-gray-500" />;
    }
  };
  
  const getCategoryBadge = (categoria: string) => {
    switch (categoria) {
      case 'lembrete':
        return <Badge variant="outline" className="text-xs px-1 border-blue-200 text-blue-700 bg-blue-50">Lembrete</Badge>;
      case 'confirmacao':
        return <Badge variant="outline" className="text-xs px-1 border-green-200 text-green-700 bg-green-50">Confirmação</Badge>;
      case 'pagamento':
        return <Badge variant="outline" className="text-xs px-1 border-orange-200 text-orange-700 bg-orange-50">Pagamento</Badge>;
      case 'promocao':
        return <Badge variant="outline" className="text-xs px-1 border-purple-200 text-purple-700 bg-purple-50">Promoção</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-1 border-gray-200 text-gray-700 bg-gray-50">Geral</Badge>;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-l-2",
        isSelected 
          ? "bg-blue-50 dark:bg-blue-950 border-l-blue-500" 
          : "border-l-transparent",
        isPlaceholder && "opacity-75 bg-gray-50/50 dark:bg-gray-800/50"
      )}
      onClick={() => onEdit(template)}
    >
      <div className="flex items-center space-x-2 flex-1">
        <div className="flex-shrink-0">
          {getTypeIcon(template.categoria)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={cn(
              "font-medium text-sm",
              isPlaceholder && "text-muted-foreground"
            )}>
              {template.titulo}
            </span>
            <div className="flex items-center">
              {getCategoryBadge(template.categoria)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {isPlaceholder 
              ? "Clique para editar e salvar" 
              : `Criado em ${new Date(template.criado_em).toLocaleDateString('pt-BR')}`
            }
          </div>
        </div>
      </div>
    </div>
  );
});

const TemplateListComponent: React.FC<TemplateListProps> = ({ 
  templates, 
  onEdit, 
  templateSelecionado,
  isLoading = false,
  onInicializarTemplates,
  inicializandoTemplates = false
}) => {
  if (isLoading || inicializandoTemplates) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="animate-pulse flex flex-col space-y-2">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
        {inicializandoTemplates && (
          <p className="mt-2 text-sm">Criando templates padrão...</p>
        )}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground space-y-4">
        <MessageSquare size={48} className="mx-auto opacity-50" />
        <div>
          <p className="font-medium">Nenhum template encontrado</p>
          <p className="text-xs mt-1">Comece criando templates para suas mensagens automáticas</p>
        </div>
        
        {onInicializarTemplates && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Quer começar rapidamente?</p>
              <Button 
                onClick={onInicializarTemplates}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={inicializandoTemplates}
              >
                <MessageSquare size={16} className="mr-2" />
                Criar Templates Padrão
              </Button>
              <p className="text-xs mt-2 text-muted-foreground">
                Criará 5 templates prontos para usar: Lembrete, Confirmação, Pagamento, Entrega e Promoção
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-3">
              Ou clique em "Novo" acima para criar um template personalizado
            </div>
          </div>
        )}
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
