import React from 'react';
import { MessageCircle } from 'lucide-react';
import ResponsiveContainer from "@/components/ResponsiveContainer";

const ContactHero: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <ResponsiveContainer className="relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-8">
            <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400">Entre em Contato</span>
          </div>
          
          {/* Título principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
            Fale{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Conosco
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Estamos aqui para ajudar você a transformar seu negócio fotográfico
          </p>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default ContactHero; 