import React, { useState, useEffect, useRef, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessagePreview } from './MessagePreview';
import { VariablesList } from './VariablesList';
import { Send, Eye, Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MensagemTemplate } from '@/services/mensagemService';

interface MessageTemplateEditorProps {
  template: MensagemTemplate | null;
  onSave: (dados: Omit<MensagemTemplate, 'id' | 'criado_em' | 'atualizado_em'>) => Promise<void>;
  onPreview: (conteudo: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// Componente para exibir o estado de carregamento
const EditorSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    </div>
    
    <div className="space-y-2">
      <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    </div>
    
    <div className="space-y-2">
      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      <div className="h-52 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    </div>
    
    <div className="flex justify-end space-x-2 pt-4">
      <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
    </div>
  </div>
);

export const MessageTemplateEditor = memo(({ 
  template, 
  onSave, 
  onPreview, 
  onCancel,
  loading = false
}: MessageTemplateEditorProps) => {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('lembrete');
  const [conteudo, setConteudo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isNovo, setIsNovo] = useState(false);

  // Atualizar campos quando template selecionado mudar
  useEffect(() => {
    if (template) {
      setTitulo(template.titulo);
      setCategoria(template.categoria);
      // Remover possíveis caracteres \n literais e substituir por quebras de linha reais
      // E converter formato antigo {{variavel}} para formato novo {variavel}
      const conteudoFormatado = template.conteudo
        .replace(/\\n/g, '\n')
        .replace(/{{([^}]+)}}/g, '{$1}');
      setConteudo(conteudoFormatado);
      setTags(template.tags || []);
    } else {
      // Limpar campos para novo template
      setTitulo('');
      setCategoria('lembrete');
      setConteudo('');
      setTags([]);
    }
  }, [template]);

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = conteudo;
    
    // Inserir variável na posição do cursor
    const newContent = currentContent.substring(0, start) + variable + currentContent.substring(end);
    setConteudo(newContent);
    
    // Manter o foco e posicionar cursor após a variável inserida
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título do template é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    if (!conteudo.trim()) {
      toast({
        title: "Erro de validação",
        description: "O conteúdo do template é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    
    // Garantir que não há caracteres \n literais no conteúdo
    // E converter formato antigo {{variavel}} para formato novo {variavel}
    const conteudoFinal = conteudo
      .replace(/\\n/g, '\n')
      .replace(/{{([^}]+)}}/g, '{$1}');
    
    const dadosTemplate = {
      titulo: titulo.trim(),
      categoria,
      conteudo: conteudoFinal.trim(),
      tags,
      user_id: undefined as any // será preenchido pelo serviço
    };
    
    await onSave(dadosTemplate);
  };

  const handlePreviewClick = () => {
    if (conteudo.trim()) {
      onPreview(conteudo);
    } else {
      toast({
        title: "Nada para visualizar",
        description: "Digite algum conteúdo primeiro.",
        variant: "default",
      });
    }
  };

  const handleSendTest = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A funcionalidade de envio de teste será implementada em breve.",
      variant: "default",
    });
  };

  // Se estiver carregando, exibir o skeleton
  if (loading) {
    return <EditorSkeleton />;
  }
  
  // Se não tiver template e não estiver em carregamento, exibir mensagem para selecionar
  if (!template && !isNovo) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <MessageSquare size={48} className="mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Nenhum template selecionado</h3>
        <p className="text-muted-foreground mb-4">
          Selecione um template na lista ao lado ou crie um novo template.
        </p>
        <Button onClick={() => setIsNovo(true)}>
          <Plus size={16} className="mr-2" />
          Criar Novo Template
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título do Template</Label>
          <Input 
            id="titulo" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            placeholder="Ex: Lembrete de Sessão"
            disabled={loading}
            className="whitespace-nowrap"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lembrete">Lembrete</SelectItem>
              <SelectItem value="confirmacao">Confirmação</SelectItem>
              <SelectItem value="pagamento">Pagamento</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="conteudo">Conteúdo da Mensagem</Label>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePreviewClick}
                className="text-xs h-7"
                disabled={loading}
              >
                <Eye size={14} className="mr-1" />
                Pré-visualizar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewMode(!previewMode)}
                className="text-xs h-7"
                disabled={loading}
              >
                {previewMode ? 'Modo de Edição' : 'Modo Preview'}
              </Button>
            </div>
          </div>
          
          {!previewMode ? (
            <Textarea 
              ref={textareaRef}
              id="conteudo" 
              value={conteudo} 
              onChange={(e) => setConteudo(e.target.value)} 
              placeholder={`Olá {nome_cliente}, tudo bem?

Passando para lembrar que temos uma sessão agendada para {data_evento} às {hora_evento}.

Local: {local_evento}

Qualquer dúvida, estou à disposição.

Atenciosamente,
{nome_fotografo}`}
              className="min-h-[280px] font-mono text-sm resize-none"
              disabled={loading}
            />
          ) : (
            <MessagePreview 
              template={conteudo} 
              className="border rounded-md p-4 min-h-[280px] bg-white dark:bg-gray-900"
            />
          )}
          
          {/* Botões principais alinhados horizontalmente */}
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSendTest}
              disabled={loading}
            >
              <Send size={14} className="mr-2" />
              Enviar Teste
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={loading || !titulo.trim() || !conteudo.trim()}
            >
              Salvar
            </Button>
          </div>
          
          {/* Helper text */}
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Use as várias mensagens personalizar
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Variáveis Disponíveis</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Clique no ícone ➕ para inserir a variável no cursor
          </p>
          <VariablesList onInsert={insertVariable} />
        </div>
      </div>
    </div>
  );
});
