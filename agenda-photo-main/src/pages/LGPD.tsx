import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { Card, CardContent } from '@/components/ui/card';
import { 
  Scale,
  Shield,
  Calendar,
  Users,
  FileCheck,
  UserCheck
} from 'lucide-react';

const LGPD: React.FC = () => {
  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-purple-950/30 dark:to-indigo-950/30">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <ResponsiveContainer className="relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm mb-8">
                <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-600 dark:text-purple-400">Conformidade Legal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  LGPD
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Nossa conformidade com a Lei Geral de Proteção de Dados Pessoais
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Última atualização: Janeiro de 2025</span>
              </div>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Conteúdo da LGPD */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="max-w-4xl mx-auto">
              
              <Card className="animate-fade-in">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Scale className="w-6 h-6 text-purple-600" />
                      1. Nossa Conformidade com a LGPD
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      A AgendaPRO está totalmente comprometida com a conformidade à Lei Geral de Proteção de Dados Pessoais 
                      (Lei nº 13.709/2018). Este documento descreve como implementamos os princípios e direitos estabelecidos 
                      pela LGPD em nossa plataforma de gestão para fotógrafos profissionais.
                    </p>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                      2. Princípios que Seguimos
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Finalidade</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Coletamos dados apenas para propósitos específicos e informados aos usuários.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Adequação</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          O tratamento é compatível com as finalidades informadas ao titular.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Necessidade</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Limitamos a coleta ao mínimo necessário para atingir as finalidades.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Livre Acesso</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Garantimos consulta facilitada sobre forma e duração do tratamento.
                        </p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-purple-600" />
                      3. Seus Direitos como Titular
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      A LGPD garante diversos direitos aos titulares de dados pessoais. Na AgendaPRO, você pode exercer:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li>Confirmação da existência de tratamento</li>
                      <li>Acesso aos dados</li>
                      <li>Correção de dados incompletos, inexatos ou desatualizados</li>
                      <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
                      <li>Portabilidade dos dados para outro fornecedor</li>
                      <li>Eliminação dos dados tratados com consentimento</li>
                      <li>Informação sobre entidades com as quais compartilhamos dados</li>
                      <li>Revogação do consentimento</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <FileCheck className="w-6 h-6 text-purple-600" />
                      4. Bases Legais para Tratamento
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Tratamos seus dados pessoais com base nas seguintes hipóteses legais:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                      <li><strong>Consentimento:</strong> Para funcionalidades opcionais e comunicações de marketing</li>
                      <li><strong>Execução de Contrato:</strong> Para fornecer os serviços da plataforma</li>
                      <li><strong>Legítimo Interesse:</strong> Para melhorias da plataforma e segurança</li>
                      <li><strong>Obrigação Legal:</strong> Para cumprimento de obrigações regulamentares</li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Users className="w-6 h-6 text-purple-600" />
                      5. Encarregado de Proteção de Dados (DPO)
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Designamos um Encarregado de Proteção de Dados (Data Protection Officer - DPO) para aceitar 
                      reclamações e comunicações dos titulares, prestar esclarecimentos e adotar providências.
                    </p>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg mb-8">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Contato do DPO</h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>E-mail:</strong> dpo@agendapro.com.br<br />
                        <strong>Telefone:</strong> (11) 3000-0000
                      </p>
                    </div>

                    <h2 className="text-2xl font-bold mb-6">6. Como Exercer Seus Direitos</h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Para exercer seus direitos ou esclarecer dúvidas sobre LGPD:
                    </p>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>E-mail:</strong> lgpd@agendapro.com.br<br />
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

export default LGPD; 