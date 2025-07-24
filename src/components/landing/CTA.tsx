import React from 'react';
import { Button } from '@/components/ui/button';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTAProps {
  title?: string;
  description?: string;
  primaryCta?: string;
  primaryCtaLink?: string;
  onRegisterClick?: () => void;
}

const CTA: React.FC<CTAProps> = ({
  title = "Transforme seu negócio hoje",
  description = "Gerencie seus clientes, agenda e financeiro de forma profissional",
  primaryCta = "Começar agora",
  primaryCtaLink = "/auth/register",
  onRegisterClick
}) => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <ResponsiveContainer className="relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400">Junte-se a +500 fotógrafos</span>
          </div>
          
          {/* Título com gradiente */}
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-display font-bold mb-8 leading-tight">
            {title && title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title && title.split(' ').slice(-1)}
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            {description}
          </p>
          
          {/* Botão de ação */}
          <div className="flex justify-center mb-12">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              onClick={onRegisterClick}
            >
              {primaryCta}
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Instalação fácil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="font-medium">Sem configuração</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="font-medium">Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default CTA;
