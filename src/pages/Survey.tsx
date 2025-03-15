
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Send, Calendar, MessageSquare, DollarSign, Globe, Link, Award, Palette, ArrowRight as ArrowRightIcon, Heart, Zap, BarChart, Clock, Users, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface FollowUpField {
  label: string;
  type: string;
}

interface FollowUp {
  condition: string[];
  fields: FollowUpField[];
}

interface Question {
  question: string;
  options?: string[];
  type: string;
  followUp?: FollowUp;
}

const questions: Question[] = [
  {
    question: "Qual o tipo de evento que você mais fotografa atualmente?",
    options: ["Casamentos", "Ensaios (gestante, newborn, família)", "Eventos corporativos", "Moda", "Outros"],
    type: "checkbox",
  },
  {
    question: "Você utiliza uma agenda online para organizar seus compromissos?",
    options: ["Sim", "Não"],
    type: "radio",
    followUp: {
      condition: ["Sim"],
      fields: [
        { label: "Qual agenda online você usa?", type: "text" },
        { label: "O que você mais gosta na agenda que usa?", type: "text" },
        { label: "O que você não gosta na agenda que usa?", type: "text" },
        { label: "Quanto você paga por mês por essa ferramenta?", type: "number" },
      ],
    },
  },
  {
    question: "Você tem um portfólio online em uma plataforma de terceiros?",
    options: ["Instagram", "Site", "Ambos", "Não tenho"],
    type: "radio",
    followUp: {
      condition: ["Site", "Ambos"],
      fields: [
        { label: "Qual é a plataforma do seu site?", type: "text" },
        { label: "O que você mais gosta no site que utiliza?", type: "text" },
        { label: "O que você não gosta no site que utiliza?", type: "text" },
        { label: "Quanto você paga por mês pelo site?", type: "number" },
      ],
    },
  },
  {
    question: "Além da agenda e do site, você usa outros aplicativos ou ferramentas online pagas para o seu trabalho?",
    options: ["Sim", "Não"],
    type: "radio",
    followUp: {
      condition: ["Sim"],
      fields: [
        { label: "Quais ferramentas você utiliza?", type: "text" },
        { label: "Quanto você gasta mensalmente com essas ferramentas?", type: "number" },
      ],
    },
  },
  {
    question: "Se você pudesse ter um único site que integrasse todas as ferramentas que usa hoje para trabalhar, como ele seria? O que você mais usa no dia a dia e gostaria de ver nesse site?",
    type: "textarea",
  },
];

// Componente para a seção de recursos
const FeatureSection = ({ icon, title, features }) => (
  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h3 className="font-medium text-lg">{title}</h3>
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-700">
          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Componente para o novo formato de card de recursos
const FeatureCard = ({ icon, color, title, description }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 flex flex-col items-center text-center">
    <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

const Survey = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{[key: number]: string[]}>({});
  const [followUpResponses, setFollowUpResponses] = useState<{[key: number]: {[key: string]: string}}>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [animation, setAnimation] = useState('fade-in');
  const [contactInfo, setContactInfo] = useState('');
  const { toast } = useToast();

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setAnimation('fade-out');
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(responses[currentQuestion + 1] ? responses[currentQuestion + 1][0] : null);
        setAnimation('fade-in');
      }, 300);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setAnimation('fade-out');
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setSelectedOption(responses[currentQuestion - 1] ? responses[currentQuestion - 1][0] : null);
        setAnimation('fade-in');
      }, 300);
    }
  };

  const handleOptionChange = (option: string) => {
    const questionType = questions[currentQuestion].type;
    
    if (questionType === 'radio') {
      setResponses({
        ...responses,
        [currentQuestion]: [option]
      });
      setSelectedOption(option);
    } else if (questionType === 'checkbox') {
      const currentResponses = responses[currentQuestion] || [];
      const newResponses = currentResponses.includes(option) 
        ? currentResponses.filter(item => item !== option)
        : [...currentResponses, option];
      
      setResponses({
        ...responses,
        [currentQuestion]: newResponses
      });
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponses({
      ...responses,
      [currentQuestion]: [e.target.value]
    });
  };

  const handleFollowUpChange = (fieldLabel: string, value: string) => {
    setFollowUpResponses({
      ...followUpResponses,
      [currentQuestion]: {
        ...(followUpResponses[currentQuestion] || {}),
        [fieldLabel]: value
      }
    });
  };

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo(e.target.value);
  };

  const handleSubmit = () => {
    // In a real app, this would send the data to a server
    console.log("Respostas:", responses);
    console.log("Respostas complementares:", followUpResponses);
    
    setAnimation('fade-out');
    setTimeout(() => {
      setShowThankYou(true);
      setAnimation('fade-in');
      
      toast({
        title: "Pesquisa enviada com sucesso!",
        description: "Obrigado por participar da nossa pesquisa.",
        duration: 5000,
      });
    }, 300);
  };

  const handleFinalSubmit = () => {
    console.log("Informações de contato:", contactInfo);
    
    toast({
      title: "Obrigado pelo seu interesse!",
      description: "Entraremos em contato em breve.",
      duration: 5000,
    });
  };

  const currentQuestionObj = questions[currentQuestion];
  const showFollowUp = currentQuestionObj.followUp && 
                        selectedOption && 
                        currentQuestionObj.followUp.condition.includes(selectedOption);

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4 py-12">
        <Card className={`w-full max-w-4xl glass shadow-lg border-0 overflow-hidden animate-${animation}`}>
          <CardContent className="p-8">
            <div className="text-center space-y-4 mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-display font-medium bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">Obrigado pela sua participação!</h1>
              
              <p className="text-gray-600 max-w-2xl mx-auto">Suas respostas são muito importantes para melhorarmos nossa plataforma.</p>
            </div>

            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-display font-medium mb-2 bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                  🚀 Apresentação da Nova Plataforma
                </h2>
                <p className="text-gray-600 mb-8">
                  Com base nas necessidades dos fotógrafos, estamos criando um aplicativo completo 
                  que vai integrar tudo o que você precisa em um só lugar!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureSection
                  icon={<Calendar className="h-6 w-6 text-purple-600" />}
                  title="📅 Agendamento Inteligente"
                  features={[
                    "Agenda online personalizada e sincronizada com Google Agenda",
                    "Marcação e gerenciamento de horários com clientes",
                    "Lista de espera para horários lotados",
                    "Confirmação automática de agendamentos via WhatsApp",
                    "Lembretes automáticos para fotógrafos e clientes"
                  ]}
                />

                <FeatureSection
                  icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
                  title="💬 Comunicação com o Cliente"
                  features={[
                    "Envio de mensagens personalizadas via WhatsApp",
                    "Lembretes automáticos de aniversários e eventos",
                    "Área do cliente para visualização de sessões e pagamentos",
                    "Formulário de feedback automático após o evento"
                  ]}
                />

                <FeatureSection
                  icon={<DollarSign className="h-6 w-6 text-green-600" />}
                  title="💰 Gestão Financeira"
                  features={[
                    "Fluxo de caixa integrado para monitorar receitas e despesas",
                    "Controle de parcelamentos e notificações de vencimento",
                    "Sugestão de preços baseada no mercado",
                    "Geração automática do modelo DAS-MEI para contabilidade"
                  ]}
                />

                <FeatureSection
                  icon={<Globe className="h-6 w-6 text-indigo-600" />}
                  title="🌍 Portfólio Online"
                  features={[
                    "Criação de site profissional integrado ao sistema",
                    "Gestão de orçamentos e propostas diretamente pelo site",
                    "Integração com plataformas de entrega de fotos"
                  ]}
                />

                <FeatureSection
                  icon={<Link className="h-6 w-6 text-pink-600" />}
                  title="🔗 Automação e Integrações"
                  features={[
                    "Integração com WhatsApp para notificações automáticas",
                    "Integração com plataformas de pagamento para cobranças",
                    "Envio de contratos digitais para assinatura online"
                  ]}
                />

                <FeatureSection
                  icon={<Award className="h-6 w-6 text-amber-600" />}
                  title="📢 Programa de Indicação"
                  features={[
                    "Indique fotógrafos e ganhe benefícios exclusivos!"
                  ]}
                />
              </div>

              <FeatureSection
                icon={<Palette className="h-6 w-6 text-rose-600" />}
                title="🎨 Personalização e Melhorias Visuais"
                features={[
                  "Modo escuro para uso em ambientes com pouca luz",
                  "Painel de controle personalizável",
                  "Design responsivo para celulares, tablets e computadores"
                ]}
              />

              {/* Novo card de recursos em estilo diferente */}
              <div className="mt-10 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-semibold text-center mb-6 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Mais recursos para impulsionar seu trabalho
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FeatureCard 
                    icon={<Heart className="h-6 w-6 text-white" />}
                    color="bg-red-500"
                    title="Experiência do Cliente"
                    description="Portais exclusivos para seus clientes visualizarem e baixarem fotos com facilidade"
                  />
                  
                  <FeatureCard 
                    icon={<Zap className="h-6 w-6 text-white" />}
                    color="bg-amber-500"
                    title="Automação Inteligente"
                    description="Automatize tarefas repetitivas como envio de e-mails, lembretes e follow-ups"
                  />
                  
                  <FeatureCard 
                    icon={<BarChart className="h-6 w-6 text-white" />}
                    color="bg-emerald-500"
                    title="Análise de Desempenho"
                    description="Relatórios e métricas para acompanhar seu crescimento e identificar oportunidades"
                  />
                  
                  <FeatureCard 
                    icon={<Clock className="h-6 w-6 text-white" />}
                    color="bg-blue-500"
                    title="Gestão de Tempo"
                    description="Otimize sua agenda e elimine sobreposições com alertas inteligentes"
                  />
                  
                  <FeatureCard 
                    icon={<Users className="h-6 w-6 text-white" />}
                    color="bg-purple-500"
                    title="Multi-colaboradores"
                    description="Ideal para estúdios com vários fotógrafos, com permissões personalizadas"
                  />
                  
                  <FeatureCard 
                    icon={<Headphones className="h-6 w-6 text-white" />}
                    color="bg-indigo-500"
                    title="Suporte Exclusivo"
                    description="Acesso a suporte prioritário e treinamentos para maximizar resultados"
                  />
                </div>
              </div>

              <div className="mt-10 bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-100 shadow-sm">
                <h3 className="text-xl font-medium mb-4 text-center">💡 Quer ser um dos primeiros a testar essa solução?</h3>
                <p className="text-gray-600 text-center mb-6">
                  Você está interessado na plataforma? Deixe seu contato abaixo e seja um dos primeiros 
                  fotógrafos a testar nossa solução!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                  <Input 
                    placeholder="Digite seu nome e e-mail" 
                    className="flex-1" 
                    value={contactInfo}
                    onChange={handleContactInfoChange}
                  />
                  <Button 
                    onClick={handleFinalSubmit}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white button-hover"
                  >
                    Quero participar
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-6">
      <Card className={`w-full max-w-2xl glass shadow-lg border-0 overflow-hidden animate-${animation}`}>
        <CardContent className="p-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Pergunta {currentQuestion + 1} de {questions.length}
            </div>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-medium">{currentQuestionObj.question}</h2>

            {currentQuestionObj.type === 'radio' && currentQuestionObj.options && (
              <RadioGroup
                value={selectedOption || ''}
                onValueChange={(value) => handleOptionChange(value)}
                className="space-y-3"
              >
                {currentQuestionObj.options.map((option) => (
                  <div key={option} className="flex items-center space-x-3 cursor-pointer">
                    <RadioGroupItem id={option} value={option} />
                    <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestionObj.type === 'checkbox' && currentQuestionObj.options && (
              <div className="space-y-3">
                {currentQuestionObj.options.map((option) => (
                  <div key={option} className="flex items-center space-x-3 cursor-pointer">
                    <Checkbox 
                      id={option} 
                      checked={(responses[currentQuestion] || []).includes(option)}
                      onCheckedChange={() => handleOptionChange(option)}
                    />
                    <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestionObj.type === 'textarea' && (
              <Textarea 
                placeholder="Digite sua resposta aqui..." 
                className="min-h-32 p-4"
                value={(responses[currentQuestion] || [''])[0]}
                onChange={handleTextAreaChange}
              />
            )}

            {showFollowUp && (
              <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg animate-slide-down">
                <h3 className="text-sm font-medium">Informações adicionais:</h3>
                {currentQuestionObj.followUp!.fields.map((field) => (
                  <div key={field.label} className="space-y-2">
                    <Label htmlFor={field.label}>{field.label}</Label>
                    <Input
                      id={field.label}
                      type={field.type}
                      value={(followUpResponses[currentQuestion] || {})[field.label] || ''}
                      onChange={(e) => handleFollowUpChange(field.label, e.target.value)}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="button-hover"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              className="bg-black hover:bg-black/90 button-hover"
              disabled={
                (currentQuestionObj.type !== 'textarea' && 
                 !responses[currentQuestion]?.length) ||
                (currentQuestionObj.type === 'textarea' && 
                 (!responses[currentQuestion] || !responses[currentQuestion][0]))
              }
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  Próxima
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Enviar
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Survey;
