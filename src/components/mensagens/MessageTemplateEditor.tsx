import React, { useState, useEffect, useRef, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessagePreview } from './MessagePreview';
import { VariablesList } from './VariablesList';
import { ClientSelector } from '@/components/contratos/ClientSelector';
import { Send, Eye, Plus, MessageSquare, RefreshCw, Clock } from 'lucide-react';

import { MensagemTemplate, substituirVariaveis } from '@/services/mensagemService';
import { MensagensProgramadasService, CriarMensagemProgramadaData } from '@/services/mensagensProgramadasService';

import { buscarEventos } from '@/services/agendaService';
import { useEmpresa } from '@/hooks/useEmpresa';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatarValorMonetario } from '@/utils/formatters';
import { formatarDataBrasileira } from '@/utils/dateFormatters';
import { logger } from '@/utils/logger';
import { Skeleton } from '@/components/ui/skeleton';
import { processEmojisForWhatsApp, encodeTextWithEmojisForURL } from '@/utils/emojiUtils';


interface MessageTemplateEditorProps {
  template: MensagemTemplate | null;
  onSave: (dados: Omit<MensagemTemplate, 'id' | 'criado_em' | 'atualizado_em'>) => Promise<void>;
  onPreview: (conteudo: string) => Promise<void>;
  onCancel: () => void;
  onRestaurarPadrao?: () => void;
  loading?: boolean;
}



export const MessageTemplateEditor = memo(({ 
  template, 
  onSave, 
  onPreview, 
  onCancel,
  onRestaurarPadrao,
  loading = false
}: MessageTemplateEditorProps) => {
  // Removido: const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('lembrete');
  const [conteudo, setConteudo] = useState('');
  const [conteudoOriginal, setConteudoOriginal] = useState(''); // Nova state para manter variáveis originais
  const [tags, setTags] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isNovo, setIsNovo] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<any | null>(null);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [resetClientSelector, setResetClientSelector] = useState(false);
  
  // Hook para buscar configurações da empresa
  const { configuracoes } = useEmpresa();
  const { user } = useAuth();
  const isAdmin = user?.app_metadata?.role === 'admin';

  // Estados para o popup de envio
  const [mostrarPopupEnvio, setMostrarPopupEnvio] = useState(false);
  const [programacaoSelecionada, setProgramacaoSelecionada] = useState<string>('');

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
      setConteudoOriginal(conteudoFormatado); // Manter versão original com variáveis
      setTags(template.tags || []);
    } else {
      // Limpar campos para novo template
      setTitulo('');
      setCategoria('lembrete');
      setConteudo('');
      setConteudoOriginal(''); // Limpar também a versão original
      setTags([]);
    }
    // Limpar dados do cliente selecionado quando template mudar
    setEventoSelecionado(null);
    // Resetar o dropdown do cliente
    setResetClientSelector(true);
    // Resetar o estado de reset após um pequeno delay
    setTimeout(() => setResetClientSelector(false), 100);
  }, [template]);

  // Carregar eventos da agenda quando o componente for montado
  useEffect(() => {
    const carregarEventos = async () => {
      if (!user) return;
      try {
        setLoadingEventos(true);
        const eventosCarregados = await buscarEventos(user.id);
        // Mapear para o formato esperado pelo ClientSelector
        const eventosFormatados = eventosCarregados.map(evento => ({
          id: evento.id || '',
          clientName: evento.clientName,
          phone: evento.phone || '',
          birthday: evento.birthday,
          eventType: evento.eventType,
          date: evento.date,
          time: evento.time || '14:00',
          location: evento.location || '',
          totalValue: evento.totalValue,
          downPayment: evento.downPayment,
          remainingValue: evento.remainingValue,
          notes: evento.notes || '',
          status: evento.status,
          reminderSent: evento.reminderSent || false,
          clientEmail: '',
          clientPhone: evento.phone || '',
          cpf_cliente: (evento as any).cpf_cliente || '',
          endereco_cliente: (evento as any).endereco_cliente || ''
        }));
        setEventos(eventosFormatados);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        // Removido: toast de erro ao carregar eventos
      } finally {
        setLoadingEventos(false);
      }
    };

    carregarEventos();
    
    // Prevenir comportamento de formulário implícito
    const handleFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Adicionar listener global para prevenir submits
    document.addEventListener('submit', handleFormSubmit, true);
    
    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [user]);

  // Função para preencher variáveis automaticamente quando evento é selecionado
  const preencherVariaveisEvento = async (evento: any, conteudoBase?: string) => {
    try {
      console.log('Evento selecionado:', JSON.stringify(evento, null, 2));

      // CORREÇÃO: Usar conteúdo base fornecido ou o conteúdo original atual
      const textoParaProcessar = conteudoBase || conteudoOriginal || conteudo;
      
      // Usar a função unificada de substituição de variáveis APENAS no conteudo (preview)
      // Manter conteudoOriginal com as variáveis intactas
      const conteudoFinal = await substituirVariaveis(textoParaProcessar, evento);
      
      // Atualizar APENAS o conteúdo de preview, mantendo o original
      setConteudo(conteudoFinal);
      
      console.log('Variáveis preenchidas com sucesso');
      
    } catch (error) {
      console.error('Erro ao preencher variáveis:', error);
    }
  };

  // Função para lidar com mudanças manuais no conteúdo
  const handleConteudoChange = (novoConteudo: string) => {
    // CORREÇÃO FINAL: Sincronização simples sem re-processamento automático
    setConteudoOriginal(novoConteudo);
    setConteudo(novoConteudo);
    // REMOVIDO: Re-processamento automático que causava corrupção durante digitação
  };

  // Função para lidar com seleção de evento
  const handleEventoSelect = (evento: any | null) => {
    setEventoSelecionado(evento);
    if (evento) {
      preencherVariaveisEvento(evento);
    } else {
      // Se o evento for desmarcado, o conteúdo deve voltar ao original
      setConteudo(conteudoOriginal);
    }
  };

  // Efeito removido: O re-processamento agora é feito diretamente no handleConteudoChange
  // para evitar conflitos durante digitação rápida

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // CORREÇÃO: Usar o conteudo atual do textarea como base
    const currentContent = textarea.value;
    const newContent = 
      currentContent.substring(0, start) + variable + currentContent.substring(end);

    // Atualizar ambos os estados de forma síncrona
    setConteudoOriginal(newContent);
    setConteudo(newContent);

    // Posicionar cursor após a inserção com delay otimizado
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variable.length;
      textarea.setSelectionRange(newPosition, newPosition);
      
      // CORREÇÃO: Se há evento selecionado, re-processar usando o novo conteúdo como base
      if (eventoSelecionado) {
        preencherVariaveisEvento(eventoSelecionado, newContent);
      }
    }, 10);
  };

  const handleSave = async (e?: React.MouseEvent) => {
    // Prevenir comportamento padrão e propagação de eventos
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!titulo.trim()) {
      // Removido: toast de erro de validação do título
      return;
    }
    
    // Usar conteudoOriginal (com variáveis) ou conteudo se não houver original
    const conteudoParaSalvar = conteudoOriginal || conteudo;
    
    if (!conteudoParaSalvar.trim()) {
      // Removido: toast de erro de validação do conteúdo
      return;
    }
    
    // Garantir que não há caracteres \n literais no conteúdo
    // E converter formato antigo {{variavel}} para formato novo {variavel}
    const conteudoFinal = conteudoParaSalvar
      .replace(/\\n/g, '\n')
      .replace(/{{([^}]+)}}/g, '{$1}');
    
    const dadosTemplate = {
      titulo: titulo.trim(),
      categoria,
      conteudo: conteudoFinal.trim(), // Salvar sempre com variáveis originais
      tags,
      user_id: undefined as any // será preenchido pelo serviço
    };

    // Se há um template selecionado E o título não mudou, incluir o ID para atualizar
    // Se não há template ou o título mudou, será criado um novo template
    if (template && template.titulo === titulo.trim()) {
      // Adicionar o ID para forçar atualização do template existente
      (dadosTemplate as any).id = template.id;
    }
    
    await onSave(dadosTemplate);
  };

  const handlePreviewClick = () => {
    if (conteudo.trim()) {
      onPreview(conteudo);
    } else {
      // Removido: toast de preview vazio
    }
  };

  const handleSendTest = async () => {
    // Validar se um cliente foi selecionado
    if (!eventoSelecionado) {
      alert('Por favor, selecione um cliente antes de enviar a mensagem.');
      return;
    }

    // Validar se há conteúdo na mensagem
    if (!conteudo.trim()) {
      alert('Por favor, digite o conteúdo da mensagem antes de enviar.');
      return;
    }

    // Validar se o cliente tem telefone
    if (!eventoSelecionado.phone) {
      alert('O cliente selecionado não possui número de telefone cadastrado.');
      return;
    }

    // Abrir popup de envio
    setMostrarPopupEnvio(true);
  };

  // Função para enviar mensagem agora
  const handleEnviarAgora = async () => {
    try {
      // Processar mensagem com substituição de variáveis usando a infraestrutura existente
      const mensagemProcessada = await substituirVariaveis(conteudoOriginal || conteudo, eventoSelecionado);
      
      // Processar emojis para garantir compatibilidade com WhatsApp
      const mensagemComEmojis = processEmojisForWhatsApp(mensagemProcessada);
      
      // Extrair e formatar o número de telefone do cliente
      const telefoneCliente = eventoSelecionado.phone.replace(/\D/g, '');
      
      // Validar se o telefone tem formato válido
      if (telefoneCliente.length < 10) {
        alert('O número de telefone do cliente não está em um formato válido.');
        return;
      }

      // Codificar a mensagem para URL preservando emojis
      const mensagemCodificada = encodeTextWithEmojisForURL(mensagemComEmojis);
      
      // Gerar URL do WhatsApp usando a infraestrutura existente
      const whatsappUrl = `https://wa.me/${telefoneCliente}?text=${mensagemCodificada}`;
      
      // Abrir WhatsApp em nova aba
      window.open(whatsappUrl, '_blank');
      
      // Fechar popup
      setMostrarPopupEnvio(false);
      setProgramacaoSelecionada('');
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao processar a mensagem. Tente novamente.');
    }
  };

  // Função para programar envio
  const handleProgramarEnvio = async () => {
    if (!programacaoSelecionada) {
      alert('Por favor, selecione um tempo de programação.');
      return;
    }

    if (!eventoSelecionado) {
      alert('Por favor, selecione um cliente antes de programar a mensagem.');
      return;
    }

    if (!user) {
      alert('Usuário não autenticado.');
      return;
    }

    try {
      // Processar mensagem com substituição de variáveis
      const mensagemProcessada = await substituirVariaveis(conteudoOriginal || conteudo, eventoSelecionado);
      
      // Calcular data programada baseada na seleção
      const dataEvento = new Date(eventoSelecionado.date);
      let dataProgramada = new Date(dataEvento);

      // Calcular a data programada baseada na opção selecionada
      switch (programacaoSelecionada) {
        case '1 hora antes':
          dataProgramada.setHours(dataProgramada.getHours() - 1);
          break;
        case '3 horas antes':
          dataProgramada.setHours(dataProgramada.getHours() - 3);
          break;
        case '1 dia antes':
          dataProgramada.setDate(dataProgramada.getDate() - 1);
          break;
        case '2 dias antes':
          dataProgramada.setDate(dataProgramada.getDate() - 2);
          break;
        case '3 dias antes':
          dataProgramada.setDate(dataProgramada.getDate() - 3);
          break;
        case '1 semana antes':
          dataProgramada.setDate(dataProgramada.getDate() - 7);
          break;
        case '1 mês antes':
          dataProgramada.setMonth(dataProgramada.getMonth() - 1);
          break;
        default:
          throw new Error('Opção de programação inválida');
      }

      // Verificar se a data programada é no futuro
      const agora = new Date();
      if (dataProgramada <= agora) {
        alert('A data programada calculada já passou. Por favor, escolha um evento futuro ou um tempo de antecedência menor.');
        return;
      }

      // Extrair e formatar o número de telefone do cliente
      const telefoneCliente = eventoSelecionado.phone?.replace(/\D/g, '') || '';
      
      if (telefoneCliente.length < 10) {
        alert('O número de telefone do cliente não está em um formato válido.');
        return;
      }

      // Preparar dados para criação da mensagem programada
      const dadosMensagem: CriarMensagemProgramadaData = {
        titulo: titulo || `Lembrete - ${eventoSelecionado.clientName}`,
        conteudo: mensagemProcessada,
        telefone: telefoneCliente,
        data_programada: dataProgramada.toISOString(),
        cliente_id: eventoSelecionado.id,
        template_id: template?.id,
        metadata: {
          evento_id: eventoSelecionado.id,
          evento_tipo: eventoSelecionado.eventType,
          evento_data: eventoSelecionado.date,
          programacao_selecionada: programacaoSelecionada,
          template_titulo: titulo
        }
      };

      // Criar mensagem programada
      const mensagemCriada = await MensagensProgramadasService.criar(dadosMensagem, user.id);

      // Sucesso
      alert(`Mensagem programada com sucesso para ${programacaoSelecionada} do evento!\n\nData de envio: ${dataProgramada.toLocaleString('pt-BR')}`);
      
      // Fechar popup
      setMostrarPopupEnvio(false);
      setProgramacaoSelecionada('');

      logger.info('Mensagem programada criada com sucesso', {
        mensagemId: mensagemCriada.id,
        clienteNome: eventoSelecionado.clientName,
        dataProgramada: dataProgramada.toISOString()
      });

    } catch (error) {
      console.error('Erro ao programar mensagem:', error);
      const mensagemErro = error instanceof Error ? error.message : 'Erro desconhecido ao programar mensagem';
      alert(`Erro ao programar mensagem: ${mensagemErro}`);
      
      logger.error('Erro ao programar mensagem', {
        error: mensagemErro,
        eventoSelecionado,
        programacaoSelecionada
      });
    }
  };

  // Se estiver carregando, exibir o skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
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
        <Button onClick={() => setIsNovo(true)} type="button">
          <Plus size={16} className="mr-2" />
          Criar Novo Template
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="space-y-4 lg:space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onKeyDown={(e) => {
        // Prevenir Enter em qualquer lugar que possa causar submit
        if (e.key === 'Enter' && !e.shiftKey && e.target !== textareaRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {/* Seção do Cliente - Posicionada no topo */}
      <div className="space-y-2">
        <Label htmlFor="cliente" className="text-sm font-medium">Selecionar Cliente</Label>
        <p className="text-xs text-muted-foreground">
          Escolha um cliente para personalizar a mensagem
        </p>
        <ClientSelector 
          events={eventos}
          onSelect={handleEventoSelect}
          className={loadingEventos ? "opacity-50" : ""}
          resetSelection={resetClientSelector}
        />
      </div>
      
      {/* Seção do Título e Categoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="titulo" className="text-sm font-medium">Título do Template</Label>
          <Input 
            id="titulo" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            placeholder="Ex: Lembrete de Sessão"
            disabled={loading}
            className="h-10"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoria" className="text-sm font-medium">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria} disabled={loading}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lembrete">Lembrete</SelectItem>
              <SelectItem value="confirmacao">Confirmação</SelectItem>
              <SelectItem value="pagamento">Pagamento</SelectItem>
              <SelectItem value="promocao">Promoção</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Layout responsivo: Stack em mobile, grid em desktop */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Área principal de edição */}
        <div className="space-y-3 lg:col-span-2 order-1 lg:order-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <Label htmlFor="conteudo" className="text-sm font-medium">Conteúdo da Mensagem</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={handlePreviewClick}
                className="text-xs h-8 px-3 touch-manipulation"
                disabled={loading}
              >
                <Eye size={14} className="mr-1" />
                Pré-visualizar
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewMode(!previewMode)}
                className="text-xs h-8 px-3 touch-manipulation"
                disabled={loading}
              >
                {previewMode ? 'Editar' : 'Preview'}
              </Button>
            </div>
          </div>
          
          {!previewMode ? (
            <Textarea 
              ref={textareaRef}
              id="conteudo" 
              value={conteudo} 
              onChange={(e) => handleConteudoChange(e.target.value)} 
              onKeyDown={(e) => {
                // Permitir Ctrl+Enter para envio rápido
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  // Lógica de envio pode ser adicionada aqui se necessário
                }
                // Não interferir em outras teclas para manter digitação fluida
              }}
              placeholder={`Olá {nome_cliente}! \u{1F4F8}

Suas fotos estão prontas! \u{1F389}

\u{1F4C5} Sessão: {data_evento}
\u{1F517} Link para download: [Suas fotos aqui]
\u{1F4C5} Total de fotos: 30 imagens editadas

As fotos ficarão disponíveis por 30 dias.

Atenciosamente,
{nome_empresa}
---
Mensagem gerada em {data_atual} às {hora_atual}`}
              className="min-h-[300px] lg:min-h-[480px] font-mono text-sm resize-none"
              disabled={loading}
            />
          ) : (
            <MessagePreview 
              template={conteudo} 
              className="border rounded-md p-4 min-h-[300px] lg:min-h-[480px] bg-white dark:bg-gray-900"
            />
          )}
          
          {/* Botões principais - Layout responsivo */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={handleSendTest}
                disabled={loading}
                className="h-10 touch-manipulation"
              >
                <Send size={14} className="mr-2" />
                Enviar Mensagens
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="h-10 touch-manipulation"
              >
                Cancelar
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button"
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave(e);
                }}
                disabled={loading || !titulo.trim() || !conteudo.trim()}
                className="h-10 touch-manipulation"
              >
                Salvar
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline"
                onClick={onRestaurarPadrao}
                disabled={loading || !template || isNovo}
                className="h-10 touch-manipulation"
              >
                <RefreshCw size={14} className="mr-2" />
                Restaurar
              </Button>
            </div>
          </div>
          
          {/* Helper text */}
          <div className="text-sm text-muted-foreground">
            Use as variáveis para personalizar suas mensagens
          </div>
        </div>
        
        {/* Painel de variáveis - Aparece primeiro em mobile */}
        <div className="space-y-2 order-2 lg:order-2">
          <Label className="text-sm font-medium">Variáveis Disponíveis</Label>
          <p className="text-xs text-muted-foreground">
            Clique em uma variável para inserir no texto
          </p>
          <VariablesList onInsert={insertVariable} />
        </div>
      </div>

      {/* Popup de Envio de Mensagens */}
      <Dialog open={mostrarPopupEnvio} onOpenChange={setMostrarPopupEnvio}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Mensagens</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Botão Enviar Agora */}
            <Button 
              onClick={handleEnviarAgora}
              className="w-full"
              size="lg"
            >
              <Send size={16} className="mr-2" />
              Enviar Agora
            </Button>

            {/* Dropdown de Programação */}
            {isAdmin && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Programação de tempo (Em breve)</Label>
                <Select value={programacaoSelecionada} onValueChange={setProgramacaoSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione quando enviar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hora antes">1 hora antes</SelectItem>
                    <SelectItem value="3 horas antes">3 horas antes</SelectItem>
                    <SelectItem value="1 dia antes">1 dia antes</SelectItem>
                    <SelectItem value="2 dias antes">2 dias antes</SelectItem>
                    <SelectItem value="3 dias antes">3 dias antes</SelectItem>
                    <SelectItem value="1 semana antes">1 semana antes</SelectItem>
                    <SelectItem value="1 mês antes">1 mês antes</SelectItem>
                  </SelectContent>
                </Select>
                
                {programacaoSelecionada && (
                  <Button 
                    onClick={handleProgramarEnvio}
                    variant="outline"
                    className="w-full"
                  >
                    <Clock size={16} className="mr-2" />
                    Programar Envio
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
