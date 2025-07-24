import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { Card, CardContent } from '@/components/ui/card';
import { 
  Cookie,
  Settings,
  Calendar,
  Globe,
  BarChart3,
  Shield
} from 'lucide-react';

const Cookies: React.FC = () => {
  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 dark:from-slate-900 dark:via-orange-950/30 dark:to-amber-950/30">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <ResponsiveContainer className="relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50 dark:border-orange-800/50 backdrop-blur-sm mb-8">
                <Cookie className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-orange-600 dark:text-orange-400">Navegação e Cookies</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                Política de{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  Cookies
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Como utilizamos cookies e tecnologias similares na plataforma
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Última atualização: Janeiro de 2025</span>
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Conteúdo da Política */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="max-w-4xl mx-auto">
              
              <Card className="animate-fade-in">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Cookie className="w-6 h-6 text-orange-600" />
                      1. O que são Cookies?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita 
                      nossa plataforma. Eles nos ajudam a fornecer uma experiência personalizada, lembrar suas preferências 
                      e melhorar o funcionamento da AgendaPRO. Os cookies não contêm informações pessoais identificáveis 
                      por si só e não danificam seu dispositivo.
                    </p>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Settings className="w-6 h-6 text-orange-600" />
                      2. Tipos de Cookies que Utilizamos
                    </h2>
                    
                    <h3 className="text-xl font-semibold mb-4">2.1 Cookies Essenciais</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Estes cookies são necessários para o funcionamento básico da plataforma e não podem ser desabilitados:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Cookies de autenticação e sessão de usuário</li>
                      <li>Cookies de segurança e prevenção contra fraudes</li>
                      <li>Cookies de carrinho de compras e processo de pagamento</li>
                      <li>Cookies de preferências de idioma e região</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">2.2 Cookies de Funcionalidade</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Melhoram sua experiência lembrando suas escolhas e preferências:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Configurações de tema (modo claro/escuro)</li>
                      <li>Layout preferido da interface</li>
                      <li>Configurações de notificações</li>
                      <li>Filtros e visualizações personalizadas</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">2.3 Cookies de Performance</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Coletam informações sobre como você usa a plataforma para melhorias:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Páginas mais visitadas e tempo de permanência</li>
                      <li>Recursos mais utilizados</li>
                      <li>Identificação de problemas de performance</li>
                      <li>Padrões de navegação e uso</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">2.4 Cookies de Marketing (Opcionais)</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Utilizados para personalizar conteúdo e anúncios relevantes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Conteúdo educativo personalizado</li>
                      <li>Sugestões de recursos baseadas no uso</li>
                      <li>Comunicações direcionadas</li>
                      <li>Medição de eficácia de campanhas</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Globe className="w-6 h-6 text-orange-600" />
                      3. Cookies de Terceiros
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Alguns cookies são definidos por serviços de terceiros que aparecem em nossas páginas:
                    </p>
                    
                    <div className="space-y-6 mb-8">
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Google Analytics</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Análise de tráfego e comportamento dos usuários para melhorar nossa plataforma.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Supabase</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Cookies técnicos necessários para o funcionamento do banco de dados e autenticação.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Stripe</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Processamento seguro de pagamentos e prevenção contra fraudes.
                        </p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                      4. Como Gerenciar Cookies
                    </h2>
                    
                    <h3 className="text-xl font-semibold mb-4">4.1 Configurações da Plataforma</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Você pode gerenciar suas preferências de cookies diretamente na plataforma:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Acesse <strong>Configurações → Privacidade → Cookies</strong></li>
                      <li>Escolha quais tipos de cookies aceitar</li>
                      <li>Altere suas preferências a qualquer momento</li>
                      <li>Visualize o histórico de consentimentos</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">4.2 Configurações do Navegador</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Você também pode controlar cookies através das configurações do seu navegador:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
                      <li><strong>Firefox:</strong> Configurações → Privacidade e segurança → Cookies</li>
                      <li><strong>Safari:</strong> Preferências → Privacidade → Cookies</li>
                      <li><strong>Edge:</strong> Configurações → Cookies e permissões</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-orange-600" />
                      5. Duração dos Cookies
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Os cookies têm diferentes durações dependendo do seu tipo:
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Cookies de Sessão</span>
                        <span className="text-slate-600 dark:text-slate-400">Até fechar o navegador</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Cookies de Funcionalidade</span>
                        <span className="text-slate-600 dark:text-slate-400">30 dias</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Cookies de Performance</span>
                        <span className="text-slate-600 dark:text-slate-400">90 dias</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="font-medium text-slate-800 dark:text-slate-200">Cookies de Marketing</span>
                        <span className="text-slate-600 dark:text-slate-400">365 dias</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">6. Impacto da Desabilitação</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Desabilitar certos tipos de cookies pode afetar sua experiência na plataforma:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li><strong>Cookies Essenciais:</strong> A plataforma pode não funcionar corretamente</li>
                      <li><strong>Cookies de Funcionalidade:</strong> Você precisará redefinir preferências a cada visita</li>
                      <li><strong>Cookies de Performance:</strong> Não poderemos melhorar a experiência baseada no uso</li>
                      <li><strong>Cookies de Marketing:</strong> Conteúdo pode ser menos relevante para você</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">7. Atualizações desta Política</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossa plataforma 
                      ou na legislação. Notificaremos sobre mudanças significativas através de um banner na plataforma ou 
                      por e-mail. A data da última atualização está sempre indicada no topo desta página.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">8. Contato</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Para dúvidas sobre esta Política de Cookies ou para exercer seus direitos, entre em contato conosco:
                    </p>
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>E-mail:</strong> privacidade@agendapro.com.br<br />
                        <strong>Telefone:</strong> (11) 3000-0000<br />
                        <strong>Endereço:</strong> Av. Paulista, 1000 - São Paulo, SP
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>
          </ResponsiveContainer>
        </section>

      </div>
    </LandingLayout>
  );
};

export default Cookies; 