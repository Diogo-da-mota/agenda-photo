
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
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

const Survey = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{[key: number]: string[]}>({});
  const [followUpResponses, setFollowUpResponses] = useState<{[key: number]: {[key: string]: string}}>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [animation, setAnimation] = useState('fade-in');
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

  const currentQuestionObj = questions[currentQuestion];
  const showFollowUp = currentQuestionObj.followUp && 
                        selectedOption && 
                        currentQuestionObj.followUp.condition.includes(selectedOption);

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-6">
        <Card className={`w-full max-w-3xl glass shadow-lg border-0 overflow-hidden animate-${animation}`}>
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-display font-medium">Obrigado pela sua participação!</h1>
              
              <p className="text-muted-foreground max-w-xl mx-auto">Suas respostas são muito importantes para melhorarmos nossa plataforma.</p>
              
              <div className="mt-12 space-y-8 max-w-2xl mx-auto text-left">
                <h2 className="text-xl font-display font-medium text-center mb-8">Apresentação da Nova Plataforma</h2>
                
                <p className="text-muted-foreground mb-6">Com base nas necessidades dos fotógrafos, estamos criando um aplicativo completo que vai integrar tudo o que você precisa em um só lugar! Confira os principais recursos:</p>
                
                <div className="space-y-6">
                  <div className="bg-white/50 p-6 rounded-xl">
                    <h3 className="font-medium text-lg mb-2">📅 Agendamento Inteligente e Gestão de Eventos</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Agenda online personalizada e sincronizada com Google Agenda</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Marcação e gerenciamento de horários com clientes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Lista de espera para horários lotados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Confirmação automática de agendamentos via WhatsApp</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/50 p-6 rounded-xl">
                    <h3 className="font-medium text-lg mb-2">💬 Comunicação e Relacionamento com o Cliente</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Envio de mensagens personalizadas via WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Lembretes automáticos de aniversários e eventos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Área do cliente para visualização de sessões e pagamentos</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/50 p-6 rounded-xl">
                    <h3 className="font-medium text-lg mb-2">💰 Gestão Financeira e Controle de Pagamentos</h3>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Fluxo de caixa integrado para monitorar receitas e despesas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Controle de parcelamentos e notificações de vencimento</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Sugestão de preços baseada no mercado</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 bg-black/5 p-6 rounded-xl">
                  <h3 className="font-medium mb-4">Quer ser um dos primeiros a testar essa solução?</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input placeholder="Seu nome e e-mail" className="flex-1" />
                    <Button className="bg-black hover:bg-black/90 button-hover">
                      Quero participar
                    </Button>
                  </div>
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
