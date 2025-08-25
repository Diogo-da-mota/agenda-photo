import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { ArrowRight, Camera, CheckCircle, Star, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface HeroProps {
  onRegisterClick?: () => void;
}

// Tipagem para o evento BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const Hero: React.FC<HeroProps> = ({ onRegisterClick }) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      
    }
    setInstallPrompt(null);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 md:w-64 md:h-64 rounded-full bg-blue-400/10 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 md:w-80 md:h-80 rounded-full bg-purple-400/10 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 md:w-48 md:h-48 rounded-full bg-pink-400/10 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      
      <ResponsiveContainer className="relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-6 md:mb-8 animate-fade-in">
            <Camera className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400">Sistema completo para fotógrafos</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold mb-6 md:mb-8 leading-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Transforme seu negócio de{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              fotografia
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 md:mb-12 max-w-4xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Gerencie clientes, agenda, contratos e pagamentos em uma única plataforma. 
            <span className="block mt-2 font-medium text-slate-700 dark:text-slate-200">
              Automatize seu WhatsApp e foque no que você faz de melhor: fotografar.
            </span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-12 md:mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-full px-8 md:px-12 py-4 md:py-6 text-base md:text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              onClick={onRegisterClick}
            >
              Começar Grátis
              <ArrowRight className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="group border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 backdrop-blur-sm rounded-full px-8 md:px-12 py-4 md:py-6 text-base md:text-xl font-semibold transition-all duration-300 hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500"
              asChild
            >
              <Link to="#features">
                Ver Demonstração
              </Link>
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="group border-2 border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 backdrop-blur-sm rounded-full px-8 md:px-12 py-4 md:py-6 text-base md:text-xl font-semibold transition-all duration-300 hover:scale-105 hover:border-purple-600 dark:hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleInstallClick}
              disabled={!installPrompt}
            >
              <Download className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
              Baixar App
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-slate-600 dark:text-slate-400 mb-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              <span className="text-sm md:text-base font-medium">14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              <span className="text-sm md:text-base font-medium">Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              <span className="text-sm md:text-base font-medium">Cancele quando quiser</span>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">+500 fotógrafos</span> já transformaram seus negócios
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default Hero;
