import React from 'react';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  BarChart3,
  Camera,
  Clock,
  Shield,
  Zap,
  Heart,
  TrendingUp
} from 'lucide-react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Organize seus compromissos com calendário visual e notificações automáticas.',
    gradient: 'from-blue-500 to-cyan-500',
    neonShadow: 'hover:shadow-blue-500/20',
    neonBorder: 'border-blue-200/50',
    neonBg: 'from-blue-600/5 to-cyan-600/5',
    delay: '0.1s'
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Cadastre e gerencie todos os seus clientes em um só lugar, com histórico completo.',
    gradient: 'from-purple-500 to-pink-500',
    neonShadow: 'hover:shadow-purple-500/20',
    neonBorder: 'border-purple-200/50',
    neonBg: 'from-purple-600/5 to-pink-600/5',
    delay: '0.2s'
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Automático',
    description: 'Envie lembretes, confirmações e follow-ups automaticamente via WhatsApp.',
    gradient: 'from-green-500 to-emerald-500',
    neonShadow: 'hover:shadow-green-500/20',
    neonBorder: 'border-green-200/50',
    neonBg: 'from-green-600/5 to-emerald-600/5',
    delay: '0.3s'
  },
  {
    icon: FileText,
    title: 'Contratos Digitais',
    description: 'Crie, envie e colete assinaturas digitais em contratos personalizados.',
    gradient: 'from-orange-500 to-red-500',
    neonShadow: 'hover:shadow-orange-500/20',
    neonBorder: 'border-orange-200/50',
    neonBg: 'from-orange-600/5 to-red-600/5',
    delay: '0.4s'
  },
  {
    icon: CreditCard,
    title: 'Controle Financeiro',
    description: 'Acompanhe pagamentos, gere relatórios e tenha visão completa das suas finanças.',
    gradient: 'from-indigo-500 to-purple-500',
    neonShadow: 'hover:shadow-indigo-500/20',
    neonBorder: 'border-indigo-200/50',
    neonBg: 'from-indigo-600/5 to-purple-600/5',
    delay: '0.5s'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Avançados',
    description: 'Analise seu desempenho com gráficos e métricas detalhadas do seu negócio.',
    gradient: 'from-teal-500 to-blue-500',
    neonShadow: 'hover:shadow-teal-500/20',
    neonBorder: 'border-teal-200/50',
    neonBg: 'from-teal-600/5 to-blue-600/5',
    delay: '0.6s'
  }
];

const benefits = [
  {
    icon: Clock,
    title: 'Economize Tempo',
    description: 'Automatize tarefas repetitivas e foque na fotografia.',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    neonShadow: 'hover:shadow-blue-500/20',
    neonBorder: 'border-blue-200/50',
    neonBg: 'from-blue-600/5 to-cyan-600/5'
  },
  {
    icon: TrendingUp,
    title: 'Aumente a Receita',
    description: 'Organize-se melhor e atenda mais clientes.',
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    neonShadow: 'hover:shadow-green-500/20',
    neonBorder: 'border-green-200/50',
    neonBg: 'from-green-600/5 to-emerald-600/5'
  },
  {
    icon: Shield,
    title: 'Dados Seguros',
    description: 'Seus dados e dos clientes protegidos na nuvem.',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-500',
    neonShadow: 'hover:shadow-purple-500/20',
    neonBorder: 'border-purple-200/50',
    neonBg: 'from-purple-600/5 to-violet-600/5'
  },
  {
    icon: Heart,
    title: 'Clientes Satisfeitos',
    description: 'Ofereça uma experiência profissional completa.',
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-rose-500',
    neonShadow: 'hover:shadow-pink-500/20',
    neonBorder: 'border-pink-200/50',
    neonBg: 'from-pink-600/5 to-rose-600/5'
  }
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
      
      <ResponsiveContainer className="relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-6 md:mb-8">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400">Funcionalidades Poderosas</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 md:mb-6">
            Tudo que você precisa para{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              profissionalizar
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Uma plataforma completa que simplifica a gestão do seu negócio de fotografia
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className={cn(
                  "group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-sm animate-fade-in",
                  feature.neonShadow,
                  feature.neonBorder
                )}
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-6 md:p-8 relative overflow-hidden">
                  {/* Efeito neon de fundo */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    feature.neonBg
                  )}></div>
                  
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 relative z-10">
                    <div className={cn(
                      "flex-shrink-0 inline-flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl bg-gradient-to-r group-hover:scale-110 transition-transform duration-300",
                      feature.gradient
                    )}>
                      <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <h3 className="text-xl md:text-2xl font-bold mb-8 md:mb-12 text-slate-900 dark:text-white">
            Por que escolher a <span className="text-purple-600">AgendaPro</span>?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div 
                  key={index} 
                  className={cn(
                    "text-center group animate-fade-in hover:-translate-y-1 transition-all duration-300",
                    benefit.neonShadow
                  )}
                  style={{ animationDelay: `${1 + index * 0.1}s` }}
                >
                  <div className={cn(
                    "relative inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border group-hover:shadow-lg transition-all duration-300 overflow-hidden mb-4",
                    benefit.neonBorder
                  )}>
                    {/* Efeito neon de fundo */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      benefit.neonBg
                    )}></div>
                    
                    {/* Círculo de fundo com gradiente */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      benefit.gradient
                    )}></div>
                    
                    <div className="absolute inset-0.5 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-opacity-80 dark:group-hover:bg-opacity-80 transition-all duration-300"></div>
                    
                    <IconComponent className={cn(
                      "w-6 h-6 md:w-8 md:h-8 relative z-10 transition-colors duration-300",
                      benefit.color,
                      "group-hover:text-white"
                    )} />
                  </div>
                  <h4 className="font-semibold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default Features;
