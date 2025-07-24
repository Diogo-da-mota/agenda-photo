import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateReceiptHTML, type ReceiptData, type CompanyInfo } from '@/utils/receiptGeneratorNative';
import { Eye, Palette, Type, Settings, Download, RefreshCw, Building2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useEmpresa } from '@/hooks/useEmpresa';

interface ReceiptTemplate {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerTitle: string;
  footerText: string;
  showLogo: boolean;
  showGradient: boolean;
  borderRadius: string;
  cardShadow: string;
}

interface CompanyDataItem {
  id: string;
  label: string;
  value: string;
  icon: string;
  visible: boolean;
  order: number;
}

interface CompanyDisplayConfig {
  items: CompanyDataItem[];
}

interface ReceiptConfig {
  template: ReceiptTemplate;
  companyConfig: CompanyDisplayConfig;
  lastSaved?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Chaves para localStorage
const STORAGE_KEYS = {
  RECEIPT_CONFIG: 'bright-spark-receipt-config',
  LAST_SAVED: 'bright-spark-receipt-last-saved'
} as const;

const defaultTemplate: ReceiptTemplate = {
  primaryColor: '#3b82f6',
  secondaryColor: '#10b981', 
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  headerTitle: 'RECIBO DE PAGAMENTO',
  footerText: 'Obrigado pela preferência!',
  showLogo: true,
  showGradient: true,
  borderRadius: '0.75rem',
  cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
};

const defaultCompanyConfig: CompanyDisplayConfig = {
  items: [
    { id: 'nome', label: 'Nome da Empresa', value: 'Bright Spark Eventos', icon: '🏢', visible: true, order: 1 },
    { id: 'telefone', label: 'Telefone', value: '(11) 98765-4321', icon: '📞', visible: true, order: 2 },
    { id: 'email', label: 'Email', value: 'contato@brightspark.com', icon: '📧', visible: true, order: 3 },
    { id: 'website', label: 'Website', value: 'www.brightspark.com', icon: '🌐', visible: true, order: 4 },
    { id: 'whatsapp', label: 'WhatsApp', value: '11987654321', icon: '💬', visible: true, order: 5 },
    { id: 'instagram', label: 'Instagram', value: '@brightsparkventos', icon: '📱', visible: true, order: 6 },
    { id: 'facebook', label: 'Facebook', value: '/brightsparkventos', icon: '👥', visible: false, order: 7 },
    { id: 'endereco', label: 'Endereço', value: 'Av. Paulista, 1000', icon: '📍', visible: true, order: 8 },
    { id: 'cnpj', label: 'CNPJ', value: '12345678000199', icon: '🏢', visible: true, order: 9 }
  ]
};

const sampleReceiptData: ReceiptData = {
  eventoId: 'DEMO001',
  clienteNome: 'João da Silva',
  clienteTelefone: '11999887766',
  eventoTipo: 'Casamento',
  data: '2024-12-31',
  horario: '19:00',
  valor: 5000,
  valorPago: 2000,
  valorRestante: 3000,
  observacoes: 'Pagamento de entrada para evento de casamento',
  enderecoEvento: 'Rua das Flores, 123 - Centro, São Paulo - SP'
};

const ImagesSection = () => {
  const [template, setTemplate] = useState<ReceiptTemplate>(defaultTemplate);
  const [companyConfig, setCompanyConfig] = useState<CompanyDisplayConfig>(defaultCompanyConfig);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  
  // Hook para acessar dados da empresa
  const { configuracoes, carregarConfiguracoes } = useEmpresa();

  const updateTemplate = (key: keyof ReceiptTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const updateCompanyItem = (id: string, field: keyof CompanyDataItem, value: any) => {
    setCompanyConfig(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
    setHasUnsavedChanges(true);
  };

  // Funções de drag & drop
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItem(itemId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropItemId: string) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== dropItemId) {
      const draggedIndex = companyConfig.items.findIndex(item => item.id === draggedItem);
      const dropIndex = companyConfig.items.findIndex(item => item.id === dropItemId);
      
      const newItems = [...companyConfig.items];
      const draggedItemData = newItems[draggedIndex];
      
      // Remove o item da posição original
      newItems.splice(draggedIndex, 1);
      // Insere na nova posição
      newItems.splice(dropIndex, 0, draggedItemData);
      
      // Atualiza as ordens
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index + 1
      }));
      
      setCompanyConfig(prev => ({
        ...prev,
        items: updatedItems
      }));
      
      setHasUnsavedChanges(true);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  // Atualiza dados da empresa baseado na configuração real
  const updateCompanyDataFromSettings = useCallback(() => {
    if (configuracoes) {
      setCompanyConfig(prev => ({
        ...prev,
        items: prev.items.map(item => {
          switch (item.id) {
            case 'nome':
              // Só atualiza se há dado real, senão mantém o valor atual
              return { ...item, value: configuracoes.nome_empresa || item.value };
            case 'telefone':
              return { ...item, value: configuracoes.telefone || item.value };
            case 'email':
              return { ...item, value: configuracoes.email_empresa || item.value };
            case 'website':
              return { ...item, value: configuracoes.site || item.value };
            case 'whatsapp':
              return { ...item, value: configuracoes.whatsapp || item.value };
            case 'instagram':
              return { ...item, value: configuracoes.instagram || item.value };
            case 'facebook':
              return { ...item, value: configuracoes.facebook || item.value };
            case 'endereco':
              return { ...item, value: configuracoes.endereco || item.value };
            case 'cnpj':
              return { ...item, value: configuracoes.cnpj || item.value };
            default:
              return item;
          }
        })
      }));
    }
  }, [configuracoes]);

  // Funções de persistência
  const saveConfig = async () => {
    setSaveStatus('saving');
    try {
      const config: ReceiptConfig = {
        template,
        companyConfig,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.RECEIPT_CONFIG, JSON.stringify(config));
      
      const now = new Date().toLocaleString('pt-BR');
      setLastSaved(now);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      // Reset status após 3 segundos
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.RECEIPT_CONFIG);
      if (savedConfig) {
        const config: ReceiptConfig = JSON.parse(savedConfig);
        setTemplate(config.template);
        
        // Garantir que o campo "nome" sempre esteja presente
        const hasNomeField = config.companyConfig.items.some(item => item.id === 'nome');
        if (!hasNomeField) {
          // Adicionar o campo "nome" se não existir
          const nomeField = { id: 'nome', label: 'Nome da Empresa', value: 'Empresa Não Configurada', icon: '🏢', visible: true, order: 1 };
          config.companyConfig.items = [nomeField, ...config.companyConfig.items.map(item => ({ ...item, order: item.order + 1 }))];
        }
        
        setCompanyConfig(config.companyConfig);
        if (config.lastSaved) {
          setLastSaved(new Date(config.lastSaved).toLocaleString('pt-BR'));
        }
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return false;
    }
  };

  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Simula um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Cria companyInfo customizado baseado na configuração COM ORDEM
      const getCompanyField = (id: string, fallback: string = '') => {
        const item = companyConfig.items.find(item => item.id === id);
        if (!item || !item.visible) return '';
        
        // Se há dados da empresa real, usa-os; senão, usa o valor configurado ou fallback
        let value = item.value;
        if (configuracoes) {
          switch (id) {
            case 'nome':
              value = configuracoes.nome_empresa || value;
              break;
            case 'telefone':
              value = configuracoes.telefone || value;
              break;
            case 'email':
              value = configuracoes.email_empresa || value;
              break;
            case 'website':
              value = configuracoes.site || value;
              break;
            case 'whatsapp':
              value = configuracoes.whatsapp || value;
              break;
            case 'instagram':
              value = configuracoes.instagram || value;
              break;
            case 'facebook':
              value = configuracoes.facebook || value;
              break;
            case 'endereco':
              value = configuracoes.endereco || value;
              break;
            case 'cnpj':
              value = configuracoes.cnpj || value;
              break;
          }
        }
        
        return value || fallback;
      };

      // Ordena os itens pela propriedade 'order' antes de criar o customCompanyInfo
      const sortedItems = companyConfig.items
        .filter(item => item.visible)
        .sort((a, b) => a.order - b.order);

      // Constrói as informações da empresa seguindo EXATAMENTE a ordem configurada
      const buildCompanyInfoHTML = () => {
        let html = '';
        const processedItems = new Set<string>(); // Para evitar duplicação
        
        sortedItems.forEach((item, index) => {
          if (item.value && !processedItems.has(item.id)) {
            processedItems.add(item.id);
            
            switch (item.id) {
              case 'nome':
                // Nome já está no cabeçalho, não precisa repetir aqui
                break;
              case 'telefone':
                if (index === 0 || (index === 1 && sortedItems[0].id === 'nome')) {
                  html += item.value;
                } else {
                  html += html ? `<br>${item.value}` : item.value;
                }
                break;
              case 'email':
                if (html && !html.endsWith('<br>')) {
                  html += ` • ${item.value}`;
                } else {
                  html += html ? `<br>${item.value}` : item.value;
                }
                break;
              case 'website':
                html += html ? `<br>${item.value}` : item.value;
                break;
              case 'endereco':
                html += html ? `<br>${item.value}` : item.value;
                break;
              case 'cnpj':
                html += html ? `<br>CNPJ: ${item.value}` : `CNPJ: ${item.value}`;
                break;
              case 'whatsapp':
                // WhatsApp vai para a seção social
                break;
              case 'instagram':
                // Instagram vai para a seção social
                break;
              case 'facebook':
                // Facebook vai para a seção social
                break;
            }
          }
        });
        
        return html;
      };

      // Constrói as redes sociais seguindo a ordem configurada
      const buildSocialLinksHTML = () => {
        let html = '';
        const socialItems = sortedItems.filter(item => 
          ['whatsapp', 'instagram', 'facebook'].includes(item.id) && item.value
        );
        
        socialItems.forEach(item => {
          switch (item.id) {
            case 'whatsapp':
              html += `${html ? '<br>' : ''}💬 WhatsApp: ${item.value}`;
              break;
            case 'instagram':
              html += `${html ? '<br>' : ''}📱 Instagram: ${item.value}`;
              break;
            case 'facebook':
              html += `${html ? '<br>' : ''}👥 Facebook: ${item.value}`;
              break;
          }
        });
        
        return html;
      };

      const customCompanyInfo: CompanyInfo = {
        nome: getCompanyField('nome', 'Empresa'),
        telefone: getCompanyField('telefone'),
        email: getCompanyField('email'),
        website: getCompanyField('website'),
        endereco: getCompanyField('endereco') || null,
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        cnpj: getCompanyField('cnpj') || null,
        instagram: getCompanyField('instagram') || null,
        facebook: getCompanyField('facebook') || null,
        whatsapp: getCompanyField('whatsapp') || null
      };
      
      const html = generateReceiptHTML(sampleReceiptData, customCompanyInfo);
      
      // Substitui COMPLETAMENTE as seções da empresa no HTML para evitar duplicação
      const customizedHtml = html
        .replace(
          /:root {/,
          `:root {
            --primary: ${template.primaryColor};
            --success: ${template.secondaryColor};
            --warning: ${template.accentColor};
            --radius: ${template.borderRadius};
            --card-shadow: ${template.cardShadow};`
        )
        .replace(
          /<title>Recibo - DEMO001<\/title>/,
          `<title>Preview - Modelo de Recibo</title>
          <style>
            body { 
              font-family: '${template.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            ${!template.showGradient ? `.receipt-header { background: ${template.primaryColor} !important; }` : ''}
            ${!template.showLogo ? `.company-logo { display: none !important; }` : ''}
          </style>`
        )
        .replace(/RECIBO DE PAGAMENTO/g, template.headerTitle)
        .replace(/Obrigado pela preferência!/g, template.footerText)
        // Substitui a seção de informações da empresa
        .replace(
          /<div class="company-info">[\s\S]*?<\/div>/,
          `<div class="company-info">${buildCompanyInfoHTML()}</div>`
        )
        // Substitui a seção de redes sociais
        .replace(
          /<div class="social-links">[\s\S]*?<\/div>/,
          buildSocialLinksHTML() ? `<div class="social-links">${buildSocialLinksHTML()}</div>` : ''
        );
      
      setPreviewHtml(customizedHtml);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [template, companyConfig, configuracoes]);

  const downloadTemplate = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-recibo-personalizado.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetTemplate = () => {
    // Apenas restaura as configurações visuais, mantendo os dados da empresa
    setTemplate(defaultTemplate);
    
    // Preserva os valores atuais da empresa (dados reais), apenas restaura a estrutura padrão
    setCompanyConfig(prev => ({
      ...prev,
      items: defaultCompanyConfig.items.map(defaultItem => {
        const currentItem = prev.items.find(item => item.id === defaultItem.id);
        return {
          ...defaultItem,
          // SEMPRE mantém o valor atual se existir - nunca sobrescreve com placeholders
          value: currentItem?.value || defaultItem.value,
          // Restaura apenas a visibilidade padrão
          visible: defaultItem.visible,
          // Restaura a ordem padrão
          order: defaultItem.order
        };
      })
    }));
    
    // Força atualização com dados reais da empresa após restaurar
    setTimeout(() => {
      updateCompanyDataFromSettings();
    }, 100);
    
    setHasUnsavedChanges(true);
  };

  // Carrega configurações salvas ao inicializar
  useEffect(() => {
    const loaded = loadConfig();
    if (!loaded) {
      setHasUnsavedChanges(true);
    }
  }, []); // Só executa uma vez na montagem

  // Atualiza dados da empresa quando as configurações mudam
  useEffect(() => {
    updateCompanyDataFromSettings();
  }, [updateCompanyDataFromSettings]);

  // Gera preview quando template ou configuração da empresa mudam
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const colorPresets = [
    { name: 'Azul Clássico', primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Verde Natureza', primary: '#10b981', secondary: '#3b82f6', accent: '#f59e0b' },
    { name: 'Roxo Elegante', primary: '#8b5cf6', secondary: '#06b6d4', accent: '#f59e0b' },
    { name: 'Rosa Moderno', primary: '#ec4899', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Cinza Profissional', primary: '#6b7280', secondary: '#10b981', accent: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editor de Modelo de Recibo</h2>
          <p className="text-muted-foreground">
            Personalize o visual e conteúdo dos recibos gerados pelo sistema
          </p>
          {lastSaved && (
            <p className="text-xs text-muted-foreground mt-1">
              Última salvamento: {lastSaved}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={saveConfig}
            disabled={saveStatus === 'saving' || !hasUnsavedChanges}
            className="flex items-center gap-2"
            variant={hasUnsavedChanges ? "default" : "secondary"}
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Salvo!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Erro
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {hasUnsavedChanges ? 'Salvar Mudanças' : 'Salvo'}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetTemplate}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button 
            onClick={downloadTemplate}
            disabled={!previewHtml}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar Modelo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Personalização
            </CardTitle>
            <CardDescription>
              Configure cores, textos e elementos visuais do recibo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="colors" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Cores
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Tipografia
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Paletas Predefinidas</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {colorPresets.map((preset, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start p-3 h-auto"
                          onClick={() => {
                            updateTemplate('primaryColor', preset.primary);
                            updateTemplate('secondaryColor', preset.secondary);
                            updateTemplate('accentColor', preset.accent);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: preset.secondary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: preset.accent }}
                              />
                            </div>
                            <span className="text-sm">{preset.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Cor Primária</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={template.primaryColor}
                          onChange={(e) => updateTemplate('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded cursor-pointer"
                        />
                        <Input
                          value={template.primaryColor}
                          onChange={(e) => updateTemplate('primaryColor', e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondaryColor">Cor Secundária</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={template.secondaryColor}
                          onChange={(e) => updateTemplate('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded cursor-pointer"
                        />
                        <Input
                          value={template.secondaryColor}
                          onChange={(e) => updateTemplate('secondaryColor', e.target.value)}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accentColor">Cor de Destaque</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="accentColor"
                          type="color"
                          value={template.accentColor}
                          onChange={(e) => updateTemplate('accentColor', e.target.value)}
                          className="w-16 h-10 p-1 rounded cursor-pointer"
                        />
                        <Input
                          value={template.accentColor}
                          onChange={(e) => updateTemplate('accentColor', e.target.value)}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="typography" className="space-y-4">
                <div>
                  <Label htmlFor="fontFamily">Fonte</Label>
                  <select
                    id="fontFamily"
                    value={template.fontFamily}
                    onChange={(e) => updateTemplate('fontFamily', e.target.value)}
                    className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                  >
                    <option value="Inter">Inter (Recomendado)</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="borderRadius">Bordas Arredondadas</Label>
                  <select
                    id="borderRadius"
                    value={template.borderRadius}
                    onChange={(e) => updateTemplate('borderRadius', e.target.value)}
                    className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                  >
                    <option value="0">Sem arredondamento</option>
                    <option value="0.25rem">Pouco arredondado</option>
                    <option value="0.5rem">Moderadamente arredondado</option>
                    <option value="0.75rem">Arredondado (padrão)</option>
                    <option value="1rem">Muito arredondado</option>
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="headerTitle">Título do Cabeçalho</Label>
                  <Input
                    id="headerTitle"
                    value={template.headerTitle}
                    onChange={(e) => updateTemplate('headerTitle', e.target.value)}
                    placeholder="RECIBO DE PAGAMENTO"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="footerText">Texto do Rodapé</Label>
                  <Textarea
                    id="footerText"
                    value={template.footerText}
                    onChange={(e) => updateTemplate('footerText', e.target.value)}
                    placeholder="Obrigado pela preferência!"
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLogo">Exibir Logo</Label>
                    <input
                      id="showLogo"
                      type="checkbox"
                      checked={template.showLogo}
                      onChange={(e) => updateTemplate('showLogo', e.target.checked)}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGradient">Gradiente no Cabeçalho</Label>
                    <input
                      id="showGradient"
                      type="checkbox"
                      checked={template.showGradient}
                      onChange={(e) => updateTemplate('showGradient', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Dados da Empresa no Recibo</Label>
                    <p className="text-xs text-muted-foreground mb-4">
                      Configure quais informações aparecem no recibo e em que ordem.
                      Os dados vêm das configurações da empresa.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {companyConfig.items
                      .sort((a, b) => a.order - b.order)
                      .map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={(e) => handleDragOver(e, item.id)}
                          onDrop={(e) => handleDrop(e, item.id)}
                          onDragEnd={handleDragEnd}
                          onDragLeave={handleDragLeave}
                          className={`flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-all cursor-grab active:cursor-grabbing ${
                            draggedItem === item.id ? 'opacity-50 scale-105' : ''
                          } ${
                            dragOverItem === item.id ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          {/* Ícone e identificação */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-lg">{item.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">{item.label}</Label>
                                <Badge 
                                  variant={item.visible ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {item.visible ? 'Visível' : 'Oculto'}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 truncate">
                                {item.value || 'Não definido'}
                              </div>
                            </div>
                          </div>

                          {/* Toggle de visibilidade */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.visible}
                              onChange={(e) => updateCompanyItem(item.id, 'visible', e.target.checked)}
                              className="rounded"
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  <Separator />

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>💡 Dica:</strong> Os dados da empresa vêm da aba "Empresa" nas configurações. 
                      Arraste os itens para reordenar e use o checkbox para mostrar/ocultar.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Recibo
              {isGenerating && (
                <Badge variant="secondary" className="ml-2">
                  Gerando...
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Visualização em tempo real das suas personalizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-muted/50 p-2 min-h-[600px]">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px] border-0 rounded bg-white"
                  title="Preview do Recibo"
                />
              ) : (
                <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Gerando preview...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>💡 Dica:</strong> Este é um exemplo com dados fictícios. 
                Os recibos reais usarão os dados dos seus eventos e configurações da empresa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status das Configurações
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="ml-2">
                Alterações não salvas
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Informações sobre o estado atual das configurações do recibo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status de Salvamento */}
            <div className="p-4 border rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-2">
                {saveStatus === 'saved' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : hasUnsavedChanges ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Save className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">Salvamento</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {saveStatus === 'saved' ? 'Configurações salvas' : 
                 hasUnsavedChanges ? 'Alterações pendentes' : 'Tudo salvo'}
              </p>
            </div>

            {/* Cores Aplicadas */}
            <div className="p-4 border rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Cores</span>
              </div>
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.primaryColor }}
                  title={`Primária: ${template.primaryColor}`}
                />
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.secondaryColor }}
                  title={`Secundária: ${template.secondaryColor}`}
                />
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.accentColor }}
                  title={`Destaque: ${template.accentColor}`}
                />
              </div>
            </div>

            {/* Tipografia */}
            <div className="p-4 border rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-2">
                <Type className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Tipografia</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {template.fontFamily}
              </p>
            </div>

            {/* Dados da Empresa */}
            <div className="p-4 border rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Empresa</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {companyConfig.items.filter(item => item.visible).length} de {companyConfig.items.length} campos visíveis
              </p>
            </div>
          </div>

          <Separator />

          {/* Resumo Detalhado das Configurações */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Configurações Ativas:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Título do Cabeçalho:</span>
                  <span className="font-medium">{template.headerTitle || 'Padrão'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fonte:</span>
                  <span className="font-medium">{template.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bordas:</span>
                  <span className="font-medium">{template.borderRadius}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logo:</span>
                  <span className="font-medium">{template.showLogo ? 'Visível' : 'Oculto'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gradiente:</span>
                  <span className="font-medium">{template.showGradient ? 'Ativado' : 'Desativado'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground mb-2">Campos Visíveis da Empresa:</div>
                {companyConfig.items
                  .filter(item => item.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-muted-foreground">{index + 1}. {item.label}:</span>
                      <span className="font-medium truncate max-w-[100px]" title={item.value}>
                        {item.value || 'Não definido'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {lastSaved && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Última modificação salva:</span>
                <span className="font-medium">{lastSaved}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Palette className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Personalize</h3>
              <p className="text-sm text-muted-foreground">
                Ajuste cores, fontes e conteúdo do seu recibo
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Visualize</h3>
              <p className="text-sm text-muted-foreground">
                Veja as mudanças em tempo real no preview
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Aplique</h3>
              <p className="text-sm text-muted-foreground">
                As configurações são aplicadas automaticamente
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>🎨 Cores:</strong> Escolha entre paletas predefinidas ou cores personalizadas</p>
            <p><strong>✍️ Tipografia:</strong> Selecione a fonte que melhor representa sua marca</p>
            <p><strong>📝 Conteúdo:</strong> Customize títulos, rodapés e elementos visuais</p>
            <p><strong>🏢 Empresa:</strong> Os dados vêm automaticamente da aba "Empresa" das configurações</p>
            <p><strong>📱 Responsivo:</strong> O recibo se adapta automaticamente a diferentes tamanhos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagesSection;
