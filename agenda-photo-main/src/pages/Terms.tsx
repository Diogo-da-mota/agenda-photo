import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield,
  FileText,
  Calendar
} from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <ResponsiveContainer className="relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-8">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">Termos Legais</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                Termos de{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Uso
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Condições gerais para uso da plataforma AgendaPRO
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Última atualização: Janeiro de 2025</span>
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Conteúdo dos Termos */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="max-w-4xl mx-auto">
              
              <Card className="animate-fade-in">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                      1. Aceitação dos Termos
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Ao acessar e usar a plataforma AgendaPRO, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                      Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">2. Descrição do Serviço</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      A AgendaPRO é uma plataforma de gestão empresarial desenvolvida especificamente para fotógrafos profissionais, 
                      oferecendo funcionalidades como:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Gerenciamento de agenda e eventos</li>
                      <li>Controle de clientes e relacionamento</li>
                      <li>Gestão financeira e relatórios</li>
                      <li>Automação de mensagens WhatsApp</li>
                      <li>Portfólio online personalizado</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">3. Cadastro e Conta de Usuário</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Para utilizar nossos serviços, você deve:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Fornecer informações verdadeiras, precisas e completas</li>
                      <li>Manter a confidencialidade de sua senha</li>
                      <li>Ser responsável por todas as atividades em sua conta</li>
                      <li>Notificar-nos imediatamente sobre uso não autorizado</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">4. Uso Permitido</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Você pode usar a AgendaPRO para:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Gerenciar seu negócio fotográfico de forma profissional</li>
                      <li>Armazenar e organizar informações de clientes</li>
                      <li>Criar e gerenciar eventos e agendamentos</li>
                      <li>Gerar relatórios e análises de desempenho</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">5. Uso Proibido</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      É expressamente proibido:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Usar a plataforma para atividades ilegais ou não autorizadas</li>
                      <li>Tentar obter acesso não autorizado aos sistemas</li>
                      <li>Interferir no funcionamento da plataforma</li>
                      <li>Copiar, modificar ou distribuir nosso conteúdo sem autorização</li>
                      <li>Usar a plataforma para enviar spam ou conteúdo malicioso</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">6. Propriedade Intelectual</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Todos os direitos de propriedade intelectual da plataforma AgendaPRO, incluindo mas não limitado a 
                      código-fonte, design, textos e marcas, são de propriedade exclusiva da AgendaPRO. 
                      Você mantém os direitos sobre o conteúdo que carrega na plataforma.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">7. Pagamentos e Cancelamentos</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Nossos planos de assinatura funcionam da seguinte forma:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Período de teste gratuito de 14 dias</li>
                      <li>Cobrança mensal ou anual conforme plano escolhido</li>
                      <li>Cancelamento a qualquer momento sem multas</li>
                      <li>Reembolso proporcional em caso de cancelamento</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6">8. Limitação de Responsabilidade</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      A AgendaPRO não será responsável por danos indiretos, especiais, incidentais ou consequenciais 
                      resultantes do uso ou incapacidade de usar nossos serviços. Nossa responsabilidade total não 
                      excederá o valor pago pelos serviços nos últimos 12 meses.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">9. Modificações dos Termos</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos sobre mudanças 
                      significativas através da plataforma ou por e-mail. O uso continuado após as modificações 
                      constitui aceitação dos novos termos.
                    </p>

                    <h2 className="text-2xl font-bold mb-6">10. Contato</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Para dúvidas sobre estes Termos de Uso, entre em contato conosco através de:
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>E-mail:</strong> juridico@agendapro.com.br<br />
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

export default Terms; 