import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Básico',
    price: 'R$ 49,90',
    period: '/mês',
    description: 'Para fotógrafos que estão começando',
    features: [
      '📅 Acesso a agenda básica',
      '🖼️ Portifolio básico',
      '🔔 Notificações automáticas',
      '📆 Até 10 eventos por mês',
      '👥 Até 20 clientes cadastrados',
      '📄 Contratos básicos',
      '💬 Suporte por email',
    ],
    buttonText: 'Escolher Plano',
    buttonVariant: 'outline',
    isPopular: false,
    neonShadow: 'hover:shadow-blue-500/20',
    neonBorder: 'border-blue-200/50',
    neonBg: 'from-blue-600/5 to-cyan-600/5'
  },
  {
    name: 'Profissional',
    price: 'R$ 89,90',
    period: '/mês',
    description: 'Para fotógrafos em crescimento',
    features: [
      '✅ Todos os recursos do plano básico',
      '♾️ Eventos ilimitados',
      '👥 Clientes ilimitados',
      '💬 Integração com WhatsApp',
      '✍️ Contratos personalizados',
      '📊 Relatórios financeiros avançados',
      '⭐ Suporte prioritário',
    ],
    buttonText: 'Escolher Plano',
    buttonVariant: 'default',
    isPopular: true,
    neonShadow: 'hover:shadow-purple-500/20',
    neonBorder: 'border-purple-200/50',
    neonBg: 'from-purple-600/5 to-blue-600/5'
  },
  {
    name: 'Enterprise',
    price: 'R$\u00A0129,90',
    period: '/mês',
    description: 'Para estúdios e equipes',
    features: [
      '✅ Todos os recursos do plano profissional',
      '💽 Portifolio ilimitado com 30 Gigas',
      '📤 Enviar Imagens de forma fácil',
      '📖 Escolher seu Album de forma fácil',
      '🤖 Automações avançadas',
      '🎓 Treinamento personalizado',
      '🤝 Atendimento dedicado',
      '👑 Suporte VIP',
    ],
    buttonText: 'Escolher Plano',
    buttonVariant: 'outline',
    isPopular: false,
    neonShadow: 'hover:shadow-green-500/20',
    neonBorder: 'border-green-200/50',
    neonBg: 'from-green-600/5 to-emerald-600/5'
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <ResponsiveContainer>
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            Escolha o plano ideal para <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">seu negócio</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Compare e escolha o plano que melhor atende às suas necessidades. Todos os planos incluem 14 dias de teste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={cn(
                "group relative p-8 border-2 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-sm overflow-visible",
                plan.isPopular ? "border-blue-500 shadow-xl" : "border-gray-200 dark:border-gray-700",
                plan.neonShadow,
                plan.neonBorder
              )}
            >
              {/* Efeito neon de fundo */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg",
                plan.neonBg
              )}></div>

              {plan.isPopular && (
                <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold z-20 shadow-lg">
                  🔥 Mais Popular
                </Badge>
              )}
              
              <div className="text-center relative z-10">
                <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{plan.price}</span>
                  <span className="text-xl text-slate-600 dark:text-slate-400">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      
                      <span className="text-slate-700 dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant as "default" | "outline"} 
                  className={cn(
                    "w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-full group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                  )}
                  asChild
                >
                  <Link to="/register">
                    {plan.buttonText}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default Pricing;
