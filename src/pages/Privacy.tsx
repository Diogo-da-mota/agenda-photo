import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield,
  Lock,
  Calendar,
  Eye,
  Database,
  Share2
} from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-green-950/30 dark:to-emerald-950/30">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-green-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <ResponsiveContainer className="relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm mb-8">
                <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">Privacidade e Segurança</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                Política de{' '}
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Privacidade
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Como coletamos, usamos e protegemos suas informações pessoais
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
                      <Shield className="w-6 h-6 text-green-600" />
                      1. Introdução
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      A AgendaPRO valoriza e respeita a privacidade de seus usuários. Esta Política de Privacidade 
                      descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando 
                      você utiliza nossa plataforma de gestão para fotógrafos.
                    </p>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Database className="w-6 h-6 text-green-600" />
                      2. Informações que Coletamos
                    </h2>
                    
                    <h3 className="text-xl font-semibold mb-4">2.1 Informações Pessoais</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Nome completo e dados de contato (e-mail, telefone)</li>
                      <li>Informações de registro e autenticação</li>
                      <li>Dados de pagamento e faturamento</li>
                      <li>Informações profissionais (especialização fotográfica, localização)</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">2.2 Dados de Uso</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Informações sobre como você usa a plataforma</li>
                      <li>Dados de navegação e interação</li>
                      <li>Preferências e configurações</li>
                      <li>Logs de acesso e atividades do sistema</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">2.3 Dados de Clientes</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Informações de clientes inseridas pelo usuário</li>
                      <li>Dados de eventos e agendamentos</li>
                      <li>Comunicações e mensagens através da plataforma</li>
                      <li>Arquivos e imagens carregados no portfólio</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Eye className="w-6 h-6 text-green-600" />
                      3. Como Usamos suas Informações
                    </h2>
                    
                    <h3 className="text-xl font-semibold mb-4">3.1 Prestação de Serviços</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Fornecer e manter a funcionalidade da plataforma</li>
                      <li>Processar pagamentos e gerenciar assinaturas</li>
                      <li>Personalizar sua experiência de uso</li>
                      <li>Oferecer suporte técnico e atendimento ao cliente</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">3.2 Comunicação</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-6">
                      <li>Enviar notificações importantes sobre o serviço</li>
                      <li>Responder a suas solicitações e dúvidas</li>
                      <li>Informar sobre atualizações e novos recursos</li>
                      <li>Compartilhar conteúdo educativo relevante (opcional)</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-4">3.3 Melhorias e Segurança</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Analisar o uso da plataforma para melhorias</li>
                      <li>Detectar e prevenir fraudes ou atividades suspeitas</li>
                      <li>Manter a segurança e integridade dos dados</li>
                      <li>Cumprir obrigações legais e regulamentares</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Share2 className="w-6 h-6 text-green-600" />
                      4. Compartilhamento de Informações
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li><strong>Prestadores de Serviços:</strong> Parceiros confiáveis que nos ajudam a operar a plataforma</li>
                      <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou ordem judicial</li>
                      <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos ou segurança</li>
                      <li><strong>Seu Consentimento:</strong> Com sua autorização expressa</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">5. Proteção de Dados</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Implementamos medidas de segurança rigorosas para proteger suas informações:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Criptografia de dados em trânsito e em repouso</li>
                      <li>Controles de acesso e autenticação robustos</li>
                      <li>Monitoramento contínuo de segurança</li>
                      <li>Backups regulares e planos de recuperação</li>
                      <li>Treinamento de equipe em práticas de segurança</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">6. Seus Direitos</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      De acordo com a LGPD, você tem os seguintes direitos:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li><strong>Acesso:</strong> Solicitar informações sobre o tratamento de seus dados</li>
                      <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                      <li><strong>Eliminação:</strong> Solicitar a exclusão de dados desnecessários</li>
                      <li><strong>Portabilidade:</strong> Solicitar a transferência de dados para outro fornecedor</li>
                      <li><strong>Oposição:</strong> Opor-se ao tratamento realizado com base no legítimo interesse</li>
                      <li><strong>Revogação:</strong> Revogar seu consentimento a qualquer momento</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">7. Retenção de Dados</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Mantemos suas informações pelo tempo necessário para cumprir as finalidades descritas nesta política, 
                      ou conforme exigido por lei. Após o cancelamento da conta, os dados são mantidos por um período adicional 
                      para fins de backup e conformidade legal, sendo posteriormente excluídos de forma segura.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">8. Cookies e Tecnologias Similares</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma. 
                      Para mais informações, consulte nossa <a href="/cookies" className="text-green-600 hover:text-green-700 underline">Política de Cookies</a>.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">9. Alterações na Política</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças 
                      significativas através da plataforma ou por e-mail. Recomendamos revisar esta política regularmente 
                      para se manter informado sobre como protegemos suas informações.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">10. Contato</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato conosco:
                    </p>
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>Data Protection Officer (DPO):</strong> dpo@agendapro.com.br<br />
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

export default Privacy; 