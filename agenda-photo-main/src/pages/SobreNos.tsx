import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { 
  Heart, 
  Camera, 
  Sparkles
} from 'lucide-react';

const SobreNos: React.FC = () => {
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
                <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">Nossa História</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                Sobre a{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgendaPRO
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Transformamos a gestão de negócios fotográficos com tecnologia inovadora e paixão pelo que fazemos
              </p>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Conteúdo Principal */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="max-w-4xl mx-auto">
              
              {/* Nossa História */}
              <div className="mb-20 animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Nossa <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">História</span>
                  </h2>
                </div>
                
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    A AgendaPRO nasceu da necessidade real de fotógrafos profissionais que buscavam uma solução completa 
                    para gerenciar seus negócios de forma eficiente e profissional.
                  </p>
                  
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Percebemos que muitos fotógrafos talentosos perdiam tempo precioso com tarefas administrativas 
                    que poderiam ser automatizadas, deixando menos tempo para se dedicar ao que realmente amam: fotografar.
                  </p>
                  
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    Assim surgiu nossa plataforma: uma ferramenta pensada por fotógrafos, para fotógrafos, 
                    que centraliza agenda, clientes, financeiro e comunicação em um só lugar.
                  </p>
                </div>
              </div>

              {/* Nossa Missão */}
              <div className="mb-20 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Nossa <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Missão</span>
                  </h2>
                </div>
                
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    <strong className="text-slate-800 dark:text-slate-200">Capacitar fotógrafos profissionais</strong> com uma plataforma completa que simplifica a gestão de negócios, 
                    permitindo que se concentrem no que fazem de melhor: capturar momentos únicos e especiais.
                  </p>
                  
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    Acreditamos que todo fotógrafo merece ter acesso a ferramentas profissionais que facilitem 
                    o gerenciamento de clientes, agenda, financeiro e comunicação, democratizando o acesso 
                    a recursos que antes eram exclusivos de grandes estúdios.
                  </p>
                </div>
              </div>

              {/* Nossa Visão */}
              <div className="mb-20 animate-fade-in" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center gap-3 mb-8">
                  <Heart className="w-8 h-8 text-pink-600" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Nossa <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Visão</span>
                  </h2>
                </div>
                
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Ser a <strong className="text-slate-800 dark:text-slate-200">plataforma líder em gestão para fotógrafos no Brasil</strong>, 
                    reconhecida pela qualidade, facilidade de uso e impacto positivo na vida profissional de nossos usuários.
                  </p>
                  
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                    Queremos ser a ferramenta que transforma a forma como fotógrafos gerenciam seus negócios, 
                    proporcionando mais tempo para criatividade, mais organização para crescimento 
                    e mais tranquilidade para focar no que realmente importa.
                  </p>
                </div>
              </div>

              {/* Nossos Valores */}
              <div className="mb-20 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                  Nossos <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Valores</span>
                </h2>
                
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                  <div className="grid gap-8 md:gap-12">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">💙 Paixão</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Amamos fotografia e tecnologia. Essa paixão se reflete em cada funcionalidade que criamos, 
                        sempre pensando em como podemos melhorar a experiência de nossos usuários.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mb-3">🛡️ Confiança</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Protegemos seus dados com máxima segurança e garantimos a privacidade de suas informações 
                        e de seus clientes. Transparência e confiabilidade são nossos pilares.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">⚡ Inovação</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Buscamos constantemente novas formas de melhorar e simplificar sua gestão empresarial, 
                        sempre atentos às tendências e necessidades do mercado fotográfico.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-pink-600 dark:text-pink-400 mb-3">❤️ Cuidado</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        Tratamos cada cliente como único, oferecendo suporte personalizado e atencioso. 
                        Seu sucesso é o nosso sucesso, e trabalhamos juntos para alcançá-lo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compromisso */}
              <div className="text-center animate-fade-in" style={{animationDelay: '0.8s'}}>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-8 md:p-12 border border-blue-200/50 dark:border-blue-800/50">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    Nosso <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Compromisso</span>
                  </h2>
                  
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                    Estamos comprometidos em fornecer a melhor experiência possível para fotógrafos profissionais, 
                    com uma plataforma que evolui constantemente para atender suas necessidades. 
                    <strong className="text-slate-800 dark:text-slate-200"> Seu feedback é nossa bússola, 
                    e seu sucesso é nossa maior recompensa.</strong>
                  </p>
                </div>
              </div>

            </div>
          </ResponsiveContainer>
        </section>

      </div>
    </LandingLayout>
  );
};

export default SobreNos; 