import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { MessageTemplateEditor } from '@/components/mensagens/MessageTemplateEditor';
import { MessagePreview } from '@/components/mensagens/MessagePreview';
import { TemplateList } from '@/components/mensagens/TemplateList';
import { MessageSquare, Mail, Send, Save, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import {
  buscarTemplates,
  buscarTemplatePorId,
  criarTemplate,
  atualizarTemplate,
  deletarTemplate,
  buscarConfiguracao,
  salvarConfiguracao,
  buscarGatilhos,
  salvarGatilho,
  restaurarTemplatePadrao,
  renderizarPreview,
  inicializarTemplatesPadrao,
  type MensagemTemplate,
  type MensagemConfiguracao,
  type MensagemGatilho,
  testarRenderizacaoMensagem
} from '@/services/mensagemService';

const Mensagens = () => {
  const { toast } = useToast();
  
  // Estados para templates
  const [templates, setTemplates] = useState<MensagemTemplate[]>([]);
  const [templateSelecionado, setTemplateSelecionado] = useState<MensagemTemplate | null>(null);
  const [modoEdicao, setModoEdicao] = useState<'novo' | 'editar' | null>(null);
  
  // Estados para preview
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [conteudoPreview, setConteudoPreview] = useState('');
  
  // Estados para configuração
  const [configuracao, setConfiguracao] = useState<MensagemConfiguracao>({
    id: '',
    user_id: '',
    canal_whatsapp: false,
    canal_email: true,
    canal_sms: false,
    webhook_url: '',
    criado_em: '',
    atualizado_em: ''
  });
  
  // Estados para gatilhos
  const [gatilhos, setGatilhos] = useState<MensagemGatilho[]>([]);
  const [lembreteAtivo, setLembreteAtivo] = useState(true);
  const [confirmacaoAtiva, setConfirmacaoAtiva] = useState(true);
  const [pagamentoAtivo, setPagamentoAtivo] = useState(true);
  
  // Estados de loading específicos
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingGatilhos, setLoadingGatilhos] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Obter usuário atual
  const [userId, setUserId] = useState<string>('');
  
  // Estado para mensagem de teste
  const [mostrarTesteMensagem, setMostrarTesteMensagem] = useState(false);
  const [resultadoTesteMensagem, setResultadoTesteMensagem] = useState('');
  
  // Adicionando estados para os templates e opções selecionados nos gatilhos
  const [templateLembreteSelecionado, setTemplateLembreteSelecionado] = useState('');
  const [templateConfirmacaoSelecionado, setTemplateConfirmacaoSelecionado] = useState('');
  const [templatePagamentoSelecionado, setTemplatePagamentoSelecionado] = useState('');
  const [antecedenciaLembrete, setAntecedenciaLembrete] = useState('24h');
  const [frequenciaPagamento, setFrequenciaPagamento] = useState('semanal');
  
  // Adicionar um state de carregamento específico para gatilhos:
  const [salvaGatilhos, setSalvaGatilhos] = useState(false);
  
  // Estado para controlar inicialização dos templates padrão
  const [inicializandoTemplates, setInicializandoTemplates] = useState(false);
  
  const mensagemTesteCorreta = `Olá {nome_cliente}, tudo bem?

Passando para lembrar que temos uma sessão agendada para {data_evento} às {hora_evento}.

Local: {local_evento}

Qualquer dúvida, estou à disposição.

Atenciosamente,
{nome_fotografo}`;
  
  // Efeito para carregar o usuário quando o componente montar
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await carregarTemplates(user.id); // Carrega apenas os templates inicialmente
      }
    };
    getUser();
  }, []);
  
  // Efeito para carregar configurações e gatilhos somente quando mudar para a tab correspondente
  useEffect(() => {
    if (userId) {
      // Carrega configurações e gatilhos em segundo plano após os templates
      setTimeout(() => {
        carregarConfiguracoes(userId);
        carregarGatilhos(userId);
      }, 100);
    }
  }, [userId]);
  
  // Efeito para definir os estados dos selects quando os templates e gatilhos são carregados
  useEffect(() => {
    if (templates.length > 0 && gatilhos.length > 0) {
      // Procurar gatilhos por tipo e definir valores selecionados
      const lembreteGatilho = gatilhos.find(g => g.trigger === 'lembrete');
      const confirmacaoGatilho = gatilhos.find(g => g.trigger === 'confirmacao');
      const pagamentoGatilho = gatilhos.find(g => g.trigger === 'pagamento');
      
      if (lembreteGatilho) {
        setTemplateLembreteSelecionado(lembreteGatilho.template_id);
        setLembreteAtivo(lembreteGatilho.ativo);
        setAntecedenciaLembrete(lembreteGatilho.antecedencia || '24h');
      } else {
        // Definir valores padrão
        const templateLembrete = templates.find(t => t.categoria === 'lembrete');
        if (templateLembrete) setTemplateLembreteSelecionado(templateLembrete.id);
      }
      
      if (confirmacaoGatilho) {
        setTemplateConfirmacaoSelecionado(confirmacaoGatilho.template_id);
        setConfirmacaoAtiva(confirmacaoGatilho.ativo);
      } else {
        // Definir valores padrão
        const templateConfirmacao = templates.find(t => t.categoria === 'confirmacao');
        if (templateConfirmacao) setTemplateConfirmacaoSelecionado(templateConfirmacao.id);
      }
      
      if (pagamentoGatilho) {
        setTemplatePagamentoSelecionado(pagamentoGatilho.template_id);
        setPagamentoAtivo(pagamentoGatilho.ativo);
        setFrequenciaPagamento(pagamentoGatilho.frequencia || 'semanal');
      } else {
        // Definir valores padrão
        const templatePagamento = templates.find(t => t.categoria === 'pagamento');
        if (templatePagamento) setTemplatePagamentoSelecionado(templatePagamento.id);
      }
    }
  }, [templates, gatilhos]);
  
  // Função específica para carregar templates
  const carregarTemplates = async (userIdParam: string) => {
    try {
      setLoadingTemplates(true);
      setInicializandoTemplates(false);
      
      // Verificar se o usuário possui templates, se não tiver, criar os padrão
      let templatesData;
      try {
        setInicializandoTemplates(true); // Indica que está inicializando templates
        templatesData = await inicializarTemplatesPadrao(userIdParam);
        
        // Se retornou templates e foram recém-criados (tamanho > 0 e não havia antes)
        if (templatesData.length > 0 && templates.length === 0) {
          toast({
            title: "Templates criados",
            description: "Templates padrão foram criados para você começar!",
            variant: "default",
          });
        }
      } catch (error) {
        // Em caso de erro na inicialização, tentar carregar os templates normalmente
        logger.error('Erro ao inicializar templates padrão, tentando buscar templates existentes', error, 'Mensagens');
        templatesData = await buscarTemplates(userIdParam);
      } finally {
        setInicializandoTemplates(false);
      }
      
      setTemplates(templatesData);
    } catch (error) {
      logger.error('Erro ao carregar templates', error, 'Mensagens');
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };
  
  // Função específica para carregar configurações
  const carregarConfiguracoes = async (userIdParam: string) => {
    try {
      setLoadingConfig(true);
      
      // Carregar configuração
      const configData = await buscarConfiguracao(userIdParam);
      if (configData) {
        setConfiguracao(configData);
      }
    } catch (error) {
      logger.error('Erro ao carregar configurações', error, 'Mensagens');
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoadingConfig(false);
    }
  };
  
  // Função específica para carregar gatilhos
  const carregarGatilhos = async (userIdParam: string) => {
    try {
      setLoadingGatilhos(true);
      
      // Carregar gatilhos
      const gatilhosData = await buscarGatilhos(userIdParam);
      setGatilhos(gatilhosData);
    } catch (error) {
      logger.error('Erro ao carregar gatilhos', error, 'Mensagens');
      toast({
        title: "Erro ao carregar gatilhos",
        description: "Não foi possível carregar os gatilhos.",
        variant: "destructive",
      });
    } finally {
      setLoadingGatilhos(false);
    }
  };
  
  // Função para carregar todos os dados (usado quando necessário recarregar tudo)
  const carregarDados = async (userIdParam: string) => {
    setLoading(true);
    await Promise.all([
      carregarTemplates(userIdParam),
      carregarConfiguracoes(userIdParam),
      carregarGatilhos(userIdParam),
    ]);
    setLoading(false);
  };
  
  // Carrega os detalhes de um template específico
  const carregarDetalhesTemplate = async (template: MensagemTemplate) => {
    try {
      setLoadingTemplate(true);
      
      // Se o template já tem conteúdo, não precisamos carregar novamente
      if (template.conteudo) {
        setTemplateSelecionado(template);
        return;
      }
      
      // Buscar template completo
      const templateCompleto = await buscarTemplatePorId(template.id, userId);
      if (templateCompleto) {
        setTemplateSelecionado(templateCompleto);
      } else {
        setTemplateSelecionado(template);
      }
    } catch (error) {
      logger.error('Erro ao carregar detalhes do template', error, 'Mensagens');
      toast({
        title: "Erro ao carregar template",
        description: "Não foi possível carregar os detalhes do template.",
        variant: "destructive",
      });
      setTemplateSelecionado(template);
    } finally {
      setLoadingTemplate(false);
    }
  };
  
  // Funções para Templates
  const handleNovoTemplate = () => {
    setTemplateSelecionado(null);
    setModoEdicao('novo');
  };
  
  const handleEditarTemplate = async (template: MensagemTemplate) => {
    await carregarDetalhesTemplate(template);
    setModoEdicao('editar');
  };
  
  const handleSalvarTemplate = async (dadosTemplate: Omit<MensagemTemplate, 'id' | 'criado_em' | 'atualizado_em'>) => {
    try {
      setLoading(true);
      
      if (modoEdicao === 'novo') {
        const novoTemplate = await criarTemplate(dadosTemplate, userId);
        setTemplates(prev => [novoTemplate, ...prev]);
        toast({
          title: "Template criado",
          description: "Template criado com sucesso!",
          variant: "default",
        });
      } else if (modoEdicao === 'editar' && templateSelecionado) {
        await atualizarTemplate(templateSelecionado.id, dadosTemplate, userId);
        
        // Recarregar templates para atualizar a lista
        const templatesAtualizados = await buscarTemplates(userId);
        setTemplates(templatesAtualizados);
        
        // Também devemos atualizar os gatilhos caso o template tenha sido alterado
        if (
          templateSelecionado.id === templateLembreteSelecionado || 
          templateSelecionado.id === templateConfirmacaoSelecionado || 
          templateSelecionado.id === templatePagamentoSelecionado
        ) {
          const gatilhosAtualizados = await buscarGatilhos(userId);
          setGatilhos(gatilhosAtualizados);
        }
        
        toast({
          title: "Template atualizado",
          description: "Template atualizado com sucesso!",
          variant: "default",
        });
      }
      
      setModoEdicao(null);
      setTemplateSelecionado(null);
    } catch (error) {
      logger.error('Erro ao salvar template', error, 'Mensagens');
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleExcluirTemplate = async () => {
    if (!templateSelecionado) return;
    
    try {
      setLoading(true);
      await deletarTemplate(templateSelecionado.id, userId);
      setTemplates(prev => prev.filter(t => t.id !== templateSelecionado.id));
      setTemplateSelecionado(null);
      setModoEdicao(null);
      
      toast({
        title: "Template excluído",
        description: "Template excluído com sucesso!",
        variant: "default",
      });
    } catch (error) {
      logger.error('Erro ao excluir template', error, 'Mensagens');
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestaurarPadrao = async () => {
    if (!templateSelecionado) return;
    
    try {
      setLoading(true);
      const templateRestaurado = await restaurarTemplatePadrao(templateSelecionado.categoria, userId);
      setTemplateSelecionado(templateRestaurado);
      const templatesAtualizados = await buscarTemplates(userId);
      setTemplates(templatesAtualizados);
      
      toast({
        title: "Template restaurado",
        description: "Template restaurado para o padrão!",
        variant: "default",
      });
    } catch (error) {
      logger.error('Erro ao restaurar template padrão', error, 'Mensagens');
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar o template padrão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreview = async (conteudo: string) => {
    try {
      setLoading(true);
      const conteudoRenderizado = await renderizarPreview(conteudo);
      setConteudoPreview(conteudoRenderizado);
      setMostrarPreview(true);
    } catch (error) {
      logger.error('Erro ao gerar preview', error, 'Mensagens');
      toast({
        title: "Erro no preview",
        description: "Não foi possível gerar o preview da mensagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelarEdicao = () => {
    setModoEdicao(null);
    setTemplateSelecionado(null);
  };
  
  // Funções para Configuração
  const handleSalvarConfiguracao = async () => {
    try {
      setLoading(true);
      setSalvaGatilhos(true);
      
      // 1. Salvar a configuração de canais
      const configData = {
        user_id: userId,
        canal_whatsapp: configuracao.canal_whatsapp,
        canal_email: configuracao.canal_email,
        canal_sms: configuracao.canal_sms,
        webhook_url: configuracao.webhook_url || null
      };
      
      const configSalva = await salvarConfiguracao(configData, userId);
      setConfiguracao(configSalva);
      
      // 2. Salvar os gatilhos
      const promises = [];
      
      // Gatilho de lembrete
      if (templateLembreteSelecionado) {
        promises.push(salvarGatilho({
          user_id: userId,
          trigger: 'lembrete',
          template_id: templateLembreteSelecionado,
          antecedencia: antecedenciaLembrete,
          frequencia: '',
          ativo: lembreteAtivo
        }, userId));
      }
      
      // Gatilho de confirmação
      if (templateConfirmacaoSelecionado) {
        promises.push(salvarGatilho({
          user_id: userId,
          trigger: 'confirmacao',
          template_id: templateConfirmacaoSelecionado,
          antecedencia: '',
          frequencia: '',
          ativo: confirmacaoAtiva
        }, userId));
      }
      
      // Gatilho de pagamento
      if (templatePagamentoSelecionado) {
        promises.push(salvarGatilho({
          user_id: userId,
          trigger: 'pagamento',
          template_id: templatePagamentoSelecionado,
          antecedencia: '',
          frequencia: frequenciaPagamento,
          ativo: pagamentoAtivo
        }, userId));
      }
      
      await Promise.all(promises);
      
      // Recarregar os gatilhos para atualizar a lista
      const gatilhosAtualizados = await buscarGatilhos(userId);
      setGatilhos(gatilhosAtualizados);
      
      toast({
        title: "Configurações salvas",
        description: "Configurações e gatilhos salvos com sucesso!",
        variant: "default",
      });
    } catch (error) {
      logger.error('Erro ao salvar configuração', error, 'Mensagens');
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSalvaGatilhos(false);
    }
  };
  
  const handleAtualizarConfiguracao = (campo: keyof MensagemConfiguracao, valor: any) => {
    setConfiguracao(prev => ({
      ...prev,
      [campo]: valor
    }));
  };
  
  const executarTesteMensagem = async () => {
    try {
      setLoading(true);
      const resultado = await testarRenderizacaoMensagem(mensagemTesteCorreta);
      setResultadoTesteMensagem(resultado);
      setMostrarTesteMensagem(true);
    } catch (error) {
      logger.error('Erro ao testar mensagem', error, 'Mensagens');
      toast({
        title: "Erro no teste",
        description: "Não foi possível processar a mensagem de teste.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ResponsiveContainer>
      <div className="flex flex-col space-y-4 pb-10">
        <h1 className="text-2xl font-bold">Mensagens</h1>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1 h-[calc(100vh-250px)] flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Templates</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleNovoTemplate} disabled={inicializandoTemplates}>
                      <Plus size={14} className="mr-1" /> Novo
                    </Button>
                  </div>
                  <CardDescription>
                    {inicializandoTemplates 
                      ? "Criando templates padrão para você..." 
                      : "Modelos de mensagens para seus clientes"}
                  </CardDescription>
                </CardHeader>
                                  <CardContent className="flex-grow overflow-auto p-0">
                    <TemplateList 
                      templates={templates} 
                      onEdit={handleEditarTemplate} 
                      templateSelecionado={templateSelecionado}
                      isLoading={loadingTemplates || inicializandoTemplates} 
                    />
                  </CardContent>
              </Card>
              
              {/* Editor de Template */}
              <Card className="md:col-span-2" style={{ minWidth: 'calc(100% + 2cm)' }}>
                <CardHeader>
                  <CardTitle>
                    {modoEdicao === 'novo' ? 'Novo Template' : 
                     modoEdicao === 'editar' ? 'Editar Template' : 
                     'Editor de Template'}
                  </CardTitle>
                  <CardDescription>
                    Personalize suas mensagens automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MessageTemplateEditor 
                    template={templateSelecionado}
                    onSave={handleSalvarTemplate}
                    onPreview={handlePreview}
                    onCancel={handleCancelarEdicao}
                    loading={loading}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    variant="outline"
                    onClick={handleExcluirTemplate}
                    disabled={!templateSelecionado || modoEdicao === 'novo' || loading}
                  >
                    Excluir
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleRestaurarPadrao}
                    disabled={!templateSelecionado || modoEdicao === 'novo' || loading}
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Restaurar Padrão
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="configuracao">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuração de canais de envio */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Canais de Envio</CardTitle>
                  <CardDescription>
                    Configure como suas mensagens serão enviadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="whatsapp" className="font-medium">WhatsApp</Label>
                      <p className="text-xs text-muted-foreground">Envio automático via WhatsApp</p>
                    </div>
                    <Switch 
                      id="whatsapp" 
                      checked={configuracao.canal_whatsapp}
                      onCheckedChange={(checked) => handleAtualizarConfiguracao('canal_whatsapp', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="email" className="font-medium">E-mail</Label>
                      <p className="text-xs text-muted-foreground">Envio automático via E-mail</p>
                    </div>
                    <Switch 
                      id="email" 
                      checked={configuracao.canal_email}
                      onCheckedChange={(checked) => handleAtualizarConfiguracao('canal_email', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="sms" className="font-medium">SMS</Label>
                      <p className="text-xs text-muted-foreground">Envio automático via SMS</p>
                    </div>
                    <Switch 
                      id="sms" 
                      checked={configuracao.canal_sms}
                      onCheckedChange={(checked) => handleAtualizarConfiguracao('canal_sms', checked)}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Label htmlFor="webhook" className="font-medium">Webhook para integrações</Label>
                    <p className="text-xs text-muted-foreground mb-2">URL para integração com serviços externos</p>
                    <Input 
                      id="webhook" 
                      placeholder="https://..." 
                      value={configuracao.webhook_url || ''}
                      onChange={(e) => handleAtualizarConfiguracao('webhook_url', e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleSalvarConfiguracao}
                    disabled={loading}
                  >
                    Salvar Configurações
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Configuração de gatilhos automáticos */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Gatilhos Automáticos</CardTitle>
                  <CardDescription>
                    Quando e como suas mensagens serão enviadas automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loadingGatilhos || templates.length === 0 ? (
                    <div className="animate-pulse flex flex-col space-y-4">
                      <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                  ) : (
                    <>
                      {/* Lembrete de Sessão */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="font-medium">Lembrete de Sessão</h3>
                            <p className="text-sm text-muted-foreground">Enviar lembrete antes da sessão</p>
                          </div>
                          <Switch 
                            id="lembrete_sessao" 
                            checked={lembreteAtivo}
                            onCheckedChange={setLembreteAtivo}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <div>
                            <Label htmlFor="template_lembrete">Template</Label>
                            <Select 
                              value={templateLembreteSelecionado || undefined} 
                              onValueChange={setTemplateLembreteSelecionado}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um template" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.filter(t => t.categoria === 'lembrete').map(template => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.titulo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="antecedencia_lembrete">Antecedência</Label>
                            <Select 
                              value={antecedenciaLembrete} 
                              onValueChange={setAntecedenciaLembrete}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tempo de antecedência" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1 hora antes</SelectItem>
                                <SelectItem value="3h">3 horas antes</SelectItem>
                                <SelectItem value="24h">1 dia antes</SelectItem>
                                <SelectItem value="48h">2 dias antes</SelectItem>
                                <SelectItem value="72h">3 dias antes</SelectItem>
                                <SelectItem value="168h">1 semana antes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Confirmação de Agendamento */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="font-medium">Confirmação de Agendamento</h3>
                            <p className="text-sm text-muted-foreground">Enviar confirmação após agendamento</p>
                          </div>
                          <Switch 
                            id="confirmacao_agendamento" 
                            checked={confirmacaoAtiva}
                            onCheckedChange={setConfirmacaoAtiva}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <div>
                            <Label htmlFor="template_confirmacao">Template</Label>
                            <Select 
                              value={templateConfirmacaoSelecionado || undefined}
                              onValueChange={setTemplateConfirmacaoSelecionado}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um template" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.filter(t => t.categoria === 'confirmacao').map(template => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.titulo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lembrete de Pagamento */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="font-medium">Lembrete de Pagamento</h3>
                            <p className="text-sm text-muted-foreground">Enviar lembretes de pagamentos pendentes</p>
                          </div>
                          <Switch 
                            id="lembrete_pagamento" 
                            checked={pagamentoAtivo}
                            onCheckedChange={setPagamentoAtivo}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <div>
                            <Label htmlFor="template_pagamento">Template</Label>
                            <Select 
                              value={templatePagamentoSelecionado || undefined}
                              onValueChange={setTemplatePagamentoSelecionado}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um template" />
                              </SelectTrigger>
                              <SelectContent>
                                {templates.filter(t => t.categoria === 'pagamento').map(template => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.titulo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="frequencia_lembrete">Frequência</Label>
                            <Select 
                              value={frequenciaPagamento}
                              onValueChange={setFrequenciaPagamento}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Frequência de envio" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unico">Envio único</SelectItem>
                                <SelectItem value="semanal">Semanal</SelectItem>
                                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                                <SelectItem value="mensal">Mensal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleSalvarConfiguracao}
                    disabled={loading}
                  >
                    {salvaGatilhos ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de Preview */}
      <Dialog open={mostrarPreview} onOpenChange={setMostrarPreview}>
        <DialogContent className="max-w-2xl mx-auto">
          <DialogHeader className="text-center">
            <DialogTitle>Pré-visualização da Mensagem</DialogTitle>
            <DialogDescription>
              Veja como sua mensagem ficará com os dados preenchidos
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap font-mono text-sm text-center">
            {conteudoPreview}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de teste de mensagem */}
      <Dialog open={mostrarTesteMensagem} onOpenChange={setMostrarTesteMensagem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Teste de Formato de Mensagem</DialogTitle>
            <DialogDescription>
              Visualização do formato correto de mensagem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Formato Correto:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {mensagemTesteCorreta}
              </pre>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Resultado:</h3>
              <div className="whitespace-pre-wrap border p-3 rounded bg-white">
                {resultadoTesteMensagem}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default Mensagens;
