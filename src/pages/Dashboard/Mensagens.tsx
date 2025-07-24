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

import ResponsiveContainer from '@/components/ResponsiveContainer';
import { MessageTemplateEditor } from '@/components/mensagens/MessageTemplateEditor';
import { MessagePreview } from '@/components/mensagens/MessagePreview';
import { TemplateList } from '@/components/mensagens/TemplateList';
import { MensagensProgramadasManager } from '@/components/mensagens/MensagensProgramadasManager';
import { MessageSquare, Mail, Send, Save, Plus, Edit, Trash2, RefreshCw, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import {
  buscarTemplates,
  buscarTemplatePorId,
  buscarTemplatePorTitulo,
  criarTemplate,
  atualizarTemplate,
  buscarConfiguracao,
  salvarConfiguracao,
  buscarGatilhos,
  salvarGatilho,
  restaurarTemplatePadrao,
  renderizarPreview,
  inicializarTemplatesPadrao,
  forcarRecriacaoTemplatesPadrao,
  type MensagemTemplate,
  type MensagemConfiguracao,
  type MensagemGatilho,
  testarRenderizacaoMensagem
} from '@/services/mensagemService';

const Mensagens = () => {
  
  // Estados para templates
  const [templates, setTemplates] = useState<MensagemTemplate[]>([]);
  const [templateSelecionado, setTemplateSelecionado] = useState<MensagemTemplate | null>(null);
  const [modoEdicao, setModoEdicao] = useState<'novo' | 'editar' | null>(null);
  
  // Estado para templates placeholder (não salvos)
  const [templatesPlaceholder, setTemplatesPlaceholder] = useState<MensagemTemplate[]>([]);
  
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
  
  // Estado para controlar a exibição do gerenciador de mensagens programadas
  const [mostrarMensagensProgramadas, setMostrarMensagensProgramadas] = useState(false);
  
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
  
  // Função para criar templates placeholder (não salvos no banco)
  const criarTemplatesPlaceholder = (): MensagemTemplate[] => {
    const agora = new Date().toISOString();
    return [
      {
        id: 'placeholder-lembrete',
        titulo: "Lembrete de Sessão",
        categoria: "lembrete",
        tags: ["agenda", "lembrete"],
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora,
        conteudo: `Olá {nome_cliente}, tudo bem?

Passando para lembrar que temos uma sessão agendada para {data_evento} às {hora_evento}.

Local: {local_evento}

Qualquer dúvida, estou à disposição.

Atenciosamente,
{nome_empresa}`
      },
      {
        id: 'placeholder-confirmacao',
        titulo: "Confirmação de Agendamento",
        categoria: "confirmacao",
        tags: ["agenda", "confirmacao"],
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora,
        conteudo: `Olá {nome_cliente}!

Seu agendamento foi confirmado com sucesso! ✅

Detalhes da sessão:
📋 Serviço: {titulo_evento}
📅 Data: {data_evento}
🕗 Horário: {hora_evento}
📍 Local: {local_evento}
💰 Valor: R$ {valor_entrada}

Aguardamos você!

{nome_empresa}
{telefone_empresa}`
      },
      {
        id: 'placeholder-pagamento',
        titulo: "Confirmação de Pagamento",
        categoria: "pagamento",
        tags: ["financeiro", "pagamento"],
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora,
        conteudo: `Olá {nome_cliente}!

Confirmamos o recebimento do seu pagamento! ✅

📋 Detalhes do pagamento:
💰 Valor: R$ {valor_entrada}
📅 Data: {data_atual}
📋 Referente: {titulo_evento}
🧾 Comprovante: {data_atual}

Obrigado pela confiança!

{nome_empresa}
{telefone_empresa}`
      },
      {
        id: 'placeholder-entrega',
        titulo: "Entrega de Fotos",
        categoria: "geral",
        tags: ["fotos", "entrega"],
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora,
        conteudo: `Olá {nome_cliente}! 📸

Suas fotos estão prontas! 🎉

📅 Sessão: {data_evento}
🔗 Link para download: [Suas fotos aqui]
📅 Total de fotos: 30 imagens editadas

As fotos ficarão disponíveis por 30 dias.

{nome_empresa}
{telefone_empresa}`
      },
      {
        id: 'placeholder-promocao',
        titulo: "Promoção Personalizada",
        categoria: "promocao",
        tags: ["promocao", "marketing"],
        user_id: userId,
        criado_em: agora,
        atualizado_em: agora,
        conteudo: `Olá {nome_cliente}! ✨

Temos uma promoção especial para você!

🎯 Oferta exclusiva para nossos clientes
💰 Condições especiais disponíveis
📞 Entre em contato para mais detalhes

Não perca essa oportunidade!

{nome_empresa}
{telefone_empresa}`
      }
    ];
  };

  // Função específica para carregar templates (SEM inicialização automática)
  const carregarTemplates = async (userIdParam: string) => {
    try {
      setLoadingTemplates(true);
      setInicializandoTemplates(false);
      
      // Buscar apenas templates existentes, SEM criar automaticamente
      const templatesData = await buscarTemplates(userIdParam);
      setTemplates(templatesData);
      
      // Sempre criar placeholders para categorias que não existem
      const categoriasExistentes = templatesData.map(t => t.categoria);
      const todasCategorias = ['lembrete', 'confirmacao', 'pagamento', 'geral', 'promocao'];
      
      const placeholders = criarTemplatesPlaceholder().filter(placeholder => {
        // Manter placeholder se a categoria não existe nos templates salvos
        return !categoriasExistentes.includes(placeholder.categoria);
      });
      
      setTemplatesPlaceholder(placeholders);
      
      logger.debug(`${templatesData.length} templates carregados, ${placeholders.length} placeholders criados`, null, 'Mensagens');
    } catch (error) {
      logger.error('Erro ao carregar templates', error, 'Mensagens');
      // Em caso de erro, criar todos os placeholders
      const placeholders = criarTemplatesPlaceholder();
      setTemplatesPlaceholder(placeholders);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Função para inicializar templates padrão MANUALMENTE (com confirmação do usuário)
  const inicializarTemplatesManuais = async () => {
    try {
      setInicializandoTemplates(true);
      
      const templatesData = await inicializarTemplatesPadrao(userId);
      setTemplates(templatesData);
      
      logger.info('Templates padrão criados com sucesso', { count: templatesData.length }, 'Mensagens');
    } catch (error) {
      logger.error('Erro ao inicializar templates padrão', error, 'Mensagens');
    } finally {
      setInicializandoTemplates(false);
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
      // Erro ao carregar configurações
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
      // Erro ao carregar gatilhos
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
      // Erro ao carregar template
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
  
  const handleSalvarTemplate = async (dadosTemplate: Omit<MensagemTemplate, 'id' | 'criado_em' | 'atualizado_em'> & { id?: string }) => {
    try {
      setLoading(true);
      
      // Verificar se é um placeholder (ID começa com 'placeholder-')
      const isPlaceholder = dadosTemplate.id?.startsWith('placeholder-');
      
      // Verificar se já existe um template com o mesmo título
      const templateExistentePorTitulo = await buscarTemplatePorTitulo(dadosTemplate.titulo, userId);
      
      if (dadosTemplate.id && !isPlaceholder) {
        // Atualizar template existente (não placeholder)
        const { id, ...dadosParaAtualizar } = dadosTemplate;
        
        // Se existe outro template com o mesmo título (e não é o mesmo template), mostrar erro
        if (templateExistentePorTitulo && templateExistentePorTitulo.id !== id) {
          throw new Error(`Já existe um template com o título "${dadosTemplate.titulo}". Escolha um título diferente.`);
        }
        
        await atualizarTemplate(id, dadosParaAtualizar, userId);
        
        // Atualizar o template selecionado com os novos dados
        const templateAtualizado = {
          ...templateSelecionado!,
          ...dadosParaAtualizar,
          atualizado_em: new Date().toISOString()
        };
        setTemplateSelecionado(templateAtualizado);
        
        // Atualizar o template na lista sem recarregar tudo
        setTemplates(prev => prev.map(template => 
          template.id === id ? templateAtualizado : template
        ));
        
        // Também devemos atualizar os gatilhos caso o template tenha sido alterado
        if (
          id === templateLembreteSelecionado || 
          id === templateConfirmacaoSelecionado || 
          id === templatePagamentoSelecionado
        ) {
          const gatilhosAtualizados = await buscarGatilhos(userId);
          setGatilhos(gatilhosAtualizados);
        }
        
        // Template atualizado com sucesso!
      } else {
        // Criar novo template (seja placeholder ou novo)
        const { id, ...dadosParaCriar } = dadosTemplate;
        
        if (templateExistentePorTitulo) {
          // Se já existe um template com esse título, atualizar em vez de criar
          await atualizarTemplate(templateExistentePorTitulo.id, dadosParaCriar, userId);
          
          // Buscar o template atualizado
          const templateAtualizado = await buscarTemplatePorId(templateExistentePorTitulo.id, userId);
          
          if (isPlaceholder) {
            // Se era um placeholder, remover da lista de placeholders
            setTemplatesPlaceholder(prev => prev.filter(t => t.id !== dadosTemplate.id));
            
            // Recriar placeholders para categorias que ainda não existem
            setTemplates(prev => {
              const templatesAtualizados = prev.map(template => 
                template.id === templateExistentePorTitulo.id ? templateAtualizado! : template
              );
              
              const categoriasExistentes = templatesAtualizados.map(t => t.categoria);
              const novosPlaceholders = criarTemplatesPlaceholder().filter(placeholder => {
                return !categoriasExistentes.includes(placeholder.categoria);
              });
              
              setTemplatesPlaceholder(novosPlaceholders);
              return templatesAtualizados;
            });
          } else {
            // Atualizar o template na lista
            setTemplates(prev => prev.map(template => 
              template.id === templateExistentePorTitulo.id ? templateAtualizado! : template
            ));
          }
          
          // Manter o template atualizado selecionado
          setTemplateSelecionado(templateAtualizado);
          setModoEdicao('editar'); // Mudar para modo de edição
        } else {
          // Criar novo template
          const novoTemplate = await criarTemplate(dadosParaCriar, userId);
          
          if (isPlaceholder) {
            // Se era um placeholder, remover da lista de placeholders e adicionar aos templates reais
            setTemplatesPlaceholder(prev => prev.filter(t => t.id !== dadosTemplate.id));
            
            setTemplates(prev => {
              const novosTemplates = [novoTemplate, ...prev];
              
              // Recriar placeholders para categorias que ainda não existem
              const categoriasExistentes = novosTemplates.map(t => t.categoria);
              const novosPlaceholders = criarTemplatesPlaceholder().filter(placeholder => {
                return !categoriasExistentes.includes(placeholder.categoria);
              });
              
              setTemplatesPlaceholder(novosPlaceholders);
              return novosTemplates;
            });
          } else {
            // Novo template normal
            setTemplates(prev => [novoTemplate, ...prev]);
          }
          
          // Manter o novo template selecionado após criação
          setTemplateSelecionado(novoTemplate);
          setModoEdicao('editar'); // Mudar para modo de edição
        }
        
        // Template criado/atualizado com sucesso!
      }
      
      // NÃO resetar o modo de edição nem o template selecionado
      // para manter o usuário na mesma tela após salvar
    } catch (error) {
      logger.error('Erro ao salvar template', error, 'Mensagens');
      // Erro ao salvar template
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
      
      // Template restaurado para o padrão!
    } catch (error) {
      logger.error('Erro ao restaurar template padrão', error, 'Mensagens');
      // Erro ao restaurar template padrão
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
      // Erro no preview da mensagem
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
      
      // Configurações e gatilhos salvos com sucesso!
    } catch (error) {
      logger.error('Erro ao salvar configuração', error, 'Mensagens');
      // Erro ao salvar configurações
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
      // Erro no teste de mensagem
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ResponsiveContainer customWidth={true}>
      <div className="flex flex-col space-y-4 pb-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <Button 
            onClick={() => setMostrarMensagensProgramadas(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Clock size={16} />
            Mensagens Programadas
          </Button>
        </div>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="pt-4">
            {/* Layout Mobile-First: Stack vertical em mobile, grid em desktop */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Lista de Templates - Altura responsiva */}
              <Card className="lg:col-span-1 flex flex-col h-auto lg:h-[calc(100vh-8rem)] min-h-[950px] max-h-[1200px] lg:max-h-none">
                <CardHeader className="pb-2 px-4 lg:px-6">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                     <div className="flex-1">
                       <CardTitle className="text-lg lg:text-xl">Templates</CardTitle>
                       <CardDescription className="text-sm">
                         {inicializandoTemplates 
                           ? "Criando templates padrão para você..." 
                           : "Modelos de mensagens para seus clientes"}
                       </CardDescription>
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         type="button" 
                         variant="outline" 
                         size="sm" 
                         onClick={handleNovoTemplate} 
                         disabled={inicializandoTemplates}
                         className="h-9 px-3 text-sm touch-manipulation"
                       >
                         <Plus size={16} className="mr-1" /> Novo
                       </Button>
                     </div>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-auto p-0">
                  <TemplateList 
                    templates={[...templates, ...templatesPlaceholder]} 
                    onEdit={handleEditarTemplate} 
                    templateSelecionado={templateSelecionado}
                    isLoading={loadingTemplates} 
                    onInicializarTemplates={inicializarTemplatesManuais}
                    inicializandoTemplates={inicializandoTemplates}
                  />
                </CardContent>
              </Card>
              
              {/* Editor de Template - Responsivo sem largura fix */}
              <Card className="lg:col-span-2 w-full overflow-hidden min-h-[950px] lg:h-[calc(100vh-8rem)]">
                <CardHeader className="px-4 lg:px-6">
                  <CardTitle className="text-lg lg:text-xl">
                    {modoEdicao === 'novo' ? 'Novo Template' : 
                     modoEdicao === 'editar' ? 'Editar Template' : 
                     'Editor de Template'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Personalize suas mensagens automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 lg:px-6">
                  <MessageTemplateEditor 
                    template={templateSelecionado}
                    onSave={handleSalvarTemplate}
                    onPreview={handlePreview}
                    onCancel={handleCancelarEdicao}
                    onRestaurarPadrao={handleRestaurarPadrao}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="configuracao">
            {/* Layout responsivo: Stack em mobile, grid em tablet+ */}
            <div className="flex flex-col md:grid md:grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Configuração de canais de envio */}
              <Card className="lg:col-span-1">
                <CardHeader className="px-4 lg:px-6">
                  <CardTitle className="text-lg lg:text-xl">Canais de Envio</CardTitle>
                  <CardDescription className="text-sm">
                    Configure como suas mensagens serão enviadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 lg:px-6">
                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex flex-col space-y-1 flex-1">
                      <Label htmlFor="whatsapp" className="font-medium text-sm">WhatsApp</Label>
                      <p className="text-xs text-muted-foreground">Envio automático via WhatsApp</p>
                    </div>
                    <Switch 
                      id="whatsapp" 
                      checked={configuracao.canal_whatsapp}
                      onCheckedChange={(checked) => handleAtualizarConfiguracao('canal_whatsapp', checked)}
                      className="touch-manipulation"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex flex-col space-y-1 flex-1">
                      <Label htmlFor="email" className="font-medium text-sm">E-mail</Label>
                      <p className="text-xs text-muted-foreground">Envio automático via E-mail</p>
                    </div>
                    <Switch 
                      id="email" 
                      checked={configuracao.canal_email}
                      onCheckedChange={(checked) => handleAtualizarConfiguracao('canal_email', checked)}
                      className="touch-manipulation"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 py-2">
                    <div className="flex flex-col space-y-1 flex-1">
                      <Label htmlFor="sms" className="font-medium text-sm">SMS</Label>
                      <p className="text-xs text-muted-foreground">Envio automático via SMS</p>
                    </div>
                    <Switch 
                      id="sms" 
                      checked={configuracao.canal_sms}
                      onCheckedChange={(checked) => handleAtualizarConfiguracao('canal_sms', checked)}
                      className="touch-manipulation"
                    />
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Label htmlFor="webhook" className="font-medium text-sm">Webhook para integrações</Label>
                    <p className="text-xs text-muted-foreground">URL para integração com serviços externos</p>
                    <Input 
                      id="webhook" 
                      placeholder="https://..." 
                      value={configuracao.webhook_url || ''}
                      onChange={(e) => handleAtualizarConfiguracao('webhook_url', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </CardContent>
                <CardFooter className="px-4 lg:px-6">
                  <Button 
                    type="button"
                    className="w-full h-10 touch-manipulation"
                    onClick={handleSalvarConfiguracao}
                    disabled={loading}
                  >
                    Salvar Configurações
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Configuração de gatilhos automáticos */}
              <Card className="lg:col-span-2">
                <CardHeader className="px-4 lg:px-6">
                  <CardTitle className="text-lg lg:text-xl">Gatilhos Automáticos</CardTitle>
                  <CardDescription className="text-sm">
                    Quando e como suas mensagens serão enviadas automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 lg:px-6">
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
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col space-y-1">
                            <h3 className="font-medium text-sm">Lembrete de Sessão</h3>
                            <p className="text-xs text-muted-foreground">Enviar lembrete antes da sessão</p>
                          </div>
                          <Switch 
                            id="lembrete_sessao" 
                            checked={lembreteAtivo}
                            onCheckedChange={setLembreteAtivo}
                            className="touch-manipulation"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="template_lembrete" className="text-sm">Template</Label>
                            <Select 
                              value={templateLembreteSelecionado || undefined} 
                              onValueChange={setTemplateLembreteSelecionado}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger className="h-10">
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
                          <div className="space-y-2">
                            <Label htmlFor="antecedencia_lembrete" className="text-sm">Antecedência</Label>
                            <Select 
                              value={antecedenciaLembrete} 
                              onValueChange={setAntecedenciaLembrete}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger className="h-10">
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
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col space-y-1">
                            <h3 className="font-medium text-sm">Confirmação de Agendamento</h3>
                            <p className="text-xs text-muted-foreground">Enviar confirmação após agendamento</p>
                          </div>
                          <Switch 
                            id="confirmacao_agendamento" 
                            checked={confirmacaoAtiva}
                            onCheckedChange={setConfirmacaoAtiva}
                            className="touch-manipulation"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="template_confirmacao" className="text-sm">Template</Label>
                            <Select 
                              value={templateConfirmacaoSelecionado || undefined}
                              onValueChange={setTemplateConfirmacaoSelecionado}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger className="h-10">
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
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col space-y-1">
                            <h3 className="font-medium text-sm">Lembrete de Pagamento</h3>
                            <p className="text-xs text-muted-foreground">Enviar lembretes de pagamentos pendentes</p>
                          </div>
                          <Switch 
                            id="lembrete_pagamento" 
                            checked={pagamentoAtivo}
                            onCheckedChange={setPagamentoAtivo}
                            className="touch-manipulation"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="template_pagamento" className="text-sm">Template</Label>
                            <Select 
                              value={templatePagamentoSelecionado || undefined}
                              onValueChange={setTemplatePagamentoSelecionado}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger className="h-10">
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
                          <div className="space-y-2">
                            <Label htmlFor="frequencia_lembrete" className="text-sm">Frequência</Label>
                            <Select 
                              value={frequenciaPagamento}
                              onValueChange={setFrequenciaPagamento}
                              disabled={salvaGatilhos}
                            >
                              <SelectTrigger className="h-10">
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
                <CardFooter className="px-4 lg:px-6">
                  <Button 
                    type="button"
                    className="w-full h-10 touch-manipulation"
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

      {/* Modal de Mensagens Programadas */}
      <Dialog open={mostrarMensagensProgramadas} onOpenChange={setMostrarMensagensProgramadas}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Mensagens Programadas</DialogTitle>
            <DialogDescription>
              Gerencie suas mensagens programadas e agendamentos
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <MensagensProgramadasManager />
          </div>
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default Mensagens;
