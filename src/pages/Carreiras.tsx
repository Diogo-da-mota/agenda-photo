import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Zap,
  Target,
  Star,
  Mail,
  ArrowRight,
  Code,
  Palette,
  HeadphonesIcon,
  BarChart3
} from 'lucide-react';

const Carreiras: React.FC = () => {
  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/30 dark:to-purple-950/30">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <ResponsiveContainer className="relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm mb-8">
                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-indigo-600 dark:text-indigo-400">Junte-se ao Time</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                Faça parte da{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgendaPRO
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Construa o futuro da fotografia profissional conosco. Vagas abertas para pessoas talentosas e apaixonadas por tecnologia.
              </p>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Conteúdo Principal */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="max-w-4xl mx-auto">
              
              <Card className="animate-fade-in">
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Star className="w-6 h-6 text-indigo-600" />
                      Por que trabalhar na AgendaPRO?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                      Somos uma startup em crescimento, focada em revolucionar como fotógrafos gerenciam seus negócios. 
                      Trabalhe com tecnologias modernas, impacte milhares de profissionais e faça parte de um time incrível.
                    </p>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Heart className="w-6 h-6 text-indigo-600" />
                      Nossos Benefícios
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Plano de Saúde</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Cobertura completa para você e sua família
                        </p>
                      </div>
                      
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Horário Flexível</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Trabalhe no seu melhor horário
                        </p>
                      </div>
                      
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Trabalho Remoto</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Liberdade para trabalhar de onde quiser
                        </p>
                      </div>
                      
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Desenvolvimento</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                          Cursos, conferências e certificações
                        </p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-indigo-600" />
                      Vagas Disponíveis
                    </h2>
                    
                    <div className="space-y-6 mb-8">
                      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-start gap-4">
                          <Code className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Desenvolvedor Full Stack</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
                              <span>São Paulo, SP</span>
                              <span>•</span>
                              <span>Tempo Integral</span>
                              <span>•</span>
                              <span>R$ 8.000 - R$ 12.000</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                              Desenvolvedor experiente em React, Node.js e TypeScript para trabalhar na evolução da plataforma AgendaPRO.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs">React/TypeScript</span>
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs">Node.js</span>
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded text-xs">3+ anos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-start gap-4">
                          <Palette className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Designer UX/UI</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
                              <span>São Paulo, SP</span>
                              <span>•</span>
                              <span>Tempo Integral</span>
                              <span>•</span>
                              <span>R$ 6.000 - R$ 9.000</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                              Designer criativo para melhorar a experiência do usuário e criar interfaces intuitivas para fotógrafos.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">Figma/Adobe</span>
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">Design System</span>
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">Portfolio</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-4">
                          <HeadphonesIcon className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Especialista em Suporte</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
                              <span>Remoto</span>
                              <span>•</span>
                              <span>Tempo Integral</span>
                              <span>•</span>
                              <span>R$ 3.500 - R$ 5.000</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                              Profissional para atender fotógrafos, resolver dúvidas técnicas e garantir satisfação dos clientes.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">Comunicação</span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">Suporte Técnico</span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">Paciência</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Mail className="w-6 h-6 text-indigo-600" />
                      Como se Candidatar
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Interessado em alguma vaga ou quer fazer uma candidatura espontânea? 
                      Envie seu currículo e uma carta de apresentação para:
                    </p>
                    
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>E-mail:</strong> carreiras@agendapro.com.br<br />
                        <strong>Assunto:</strong> [Nome da Vaga] - Seu Nome<br />
                        <strong>Inclua:</strong> CV, portfolio (se aplicável) e carta de apresentação
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

export default Carreiras; 