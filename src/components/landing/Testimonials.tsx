import React from 'react';
import { Star, Quote } from 'lucide-react';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: 'Maria Souza',
    role: 'Fotógrafa de Casamentos',
    content: 'O sistema tem me ajudado a crescer constantemente. A organização dos eventos e o controle financeiro elevaram meu negócio a outro nível!',
    rating: 5,
    avatar: '/testimonials/avatar1.jpg',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-purple-500'
  },
  {
    name: 'Carlos Silva',
    role: 'Fotógrafo de Estúdio',
    content: 'Desde que comecei a usar, tenho conseguido focar no que importa: criar fotos incríveis. A plataforma cuida de todo o resto!',
    rating: 5,
    avatar: '/testimonials/avatar2.jpg',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500'
  },
  {
    name: 'Ana Ribeiro',
    role: 'Fotógrafa de Família',
    content: 'Meus clientes adoram receber as confirmações automáticas e eu economizo horas que antes gastava com tarefas administrativas.',
    rating: 5,
    avatar: '/testimonials/avatar3.jpg',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-blue-500'
  },
  {
    name: 'João Martins',
    role: 'Fotógrafo de Eventos',
    content: 'A automação de mensagens pelo WhatsApp salvou meu tempo! Os lembretes automáticos reduziram os cancelamentos em mais de 70%.',
    rating: 5,
    avatar: '/testimonials/avatar4.jpg',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500'
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950 overflow-hidden" id="testimonials">
      <ResponsiveContainer>
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            O que nossos <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">fotógrafos dizem</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Histórias reais de profissionais que transformaram seus negócios com a AgendaPro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="group relative animate-scale-in hover-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:border-transparent group-hover:scale-[1.02] h-full relative overflow-hidden">
                <div className="flex items-center mb-6">
                  <Avatar className={`h-14 w-14 mr-4 bg-gradient-to-r ${testimonial.gradientFrom} ${testimonial.gradientTo} flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className={`bg-gradient-to-r ${testimonial.gradientFrom} ${testimonial.gradientTo} text-white font-semibold`}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn(
                      "h-4 w-4 mr-1",
                      i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    )} />
                  ))}
                </div>
                
                <blockquote className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed italic relative">
                  <Quote className="absolute -top-2 -left-2 text-gray-200 dark:text-gray-700 h-8 w-8 -z-10 opacity-50" />
                  "{testimonial.content}"
                </blockquote>

                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${testimonial.gradientFrom} ${testimonial.gradientTo} w-0 group-hover:w-full transition-all duration-500 rounded-full`}></div>
              </Card>
            </div>
          ))}
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default Testimonials;
