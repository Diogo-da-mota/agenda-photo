
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { submitSurveyData } from "@/utils/messageUtils";

// Define survey questions
const questions = [
  {
    id: 1,
    text: "Qual tipo de fotografia você está buscando?",
    options: ["Fotografia de Retrato", "Fotografia de Família", "Fotografia de Eventos", "Fotografia de Produtos", "Outro"]
  },
  {
    id: 2,
    text: "Qual é o seu orçamento aproximado para este projeto?",
    options: ["Até R$500", "R$500 - R$1.000", "R$1.000 - R$2.000", "R$2.000 - R$5.000", "Acima de R$5.000"]
  },
  {
    id: 3,
    text: "Quando você precisa que o projeto seja realizado?",
    options: ["Nos próximos 7 dias", "Nos próximos 30 dias", "Nos próximos 3 meses", "Ainda não tenho uma data definida"]
  },
  {
    id: 4,
    text: "Como você prefere receber as fotos finais?",
    options: ["Arquivos digitais de alta resolução", "Impressões profissionais", "Álbum fotográfico", "Combinação das opções acima"]
  },
  {
    id: 5,
    text: "Se você pudesse ter um único site que integrasse todas as ferramentas que usa hoje para trabalhar, como ele seria? O que você mais usa no dia a dia e gostaria de ver nesse site?",
    isTextInput: true
  }
];

const Survey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [textInputs, setTextInputs] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    nome: "",
    email: "",
    telefone: "",
    contactConsent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate progress percentage
  const progress = Math.round(((currentQuestionIndex) / questions.length) * 100);
  
  // Handle option selection
  const handleOptionSelect = (option: string) => {
    setAnswers(prev => {
      // Initialize the array for this question if it doesn't exist
      const currentAnswers = prev[questions[currentQuestionIndex].id] || [];
      
      // Check if option is already selected (toggle functionality)
      if (currentAnswers.includes(option)) {
        return {
          ...prev,
          [questions[currentQuestionIndex].id]: currentAnswers.filter(item => item !== option)
        };
      } else {
        return {
          ...prev,
          [questions[currentQuestionIndex].id]: [...currentAnswers, option]
        };
      }
    });
  };

  // Check if an option is selected
  const isOptionSelected = (option: string) => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    return answers[currentQuestionId]?.includes(option) || false;
  };

  // Handle text input for open-ended questions
  const handleTextInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    setTextInputs(prev => ({
      ...prev,
      [currentQuestionId]: event.target.value
    }));
    
    // Also update answers to maintain consistency
    setAnswers(prev => ({
      ...prev,
      [currentQuestionId]: [event.target.value]
    }));
  };

  // Handle next/previous question navigation
  const handleNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const currentQuestionId = questions[currentQuestionIndex].id;
      const hasAnswer = answers[currentQuestionId]?.length > 0 || 
                        (questions[currentQuestionIndex].isTextInput && textInputs[currentQuestionId]);
      
      if (!hasAnswer) {
        toast({
          title: "Por favor, responda à pergunta",
          description: "Você precisa responder à pergunta antes de prosseguir.",
          variant: "destructive"
        });
        return;
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
      }
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle contact info changes
  const handleContactInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle consent toggle
  const handleConsentToggle = () => {
    setContactInfo(prev => ({
      ...prev,
      contactConsent: !prev.contactConsent
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!contactInfo.nome || !contactInfo.email) {
      toast({
        title: "Informações faltando",
        description: "Por favor, preencha seu nome e email antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the answers for the survey data
      const followUpResponses: {[key: number]: {[key: string]: string}} = {};
      
      // Transforming the text inputs into the format expected by submitSurveyData
      for (const [questionIdStr, text] of Object.entries(textInputs)) {
        const questionId = parseInt(questionIdStr);
        followUpResponses[questionId] = { "Resposta": text };
      }

      const success = await submitSurveyData(
        contactInfo,
        answers,
        followUpResponses,
        contactInfo.email
      );

      if (success) {
        toast({
          title: "Obrigado pelo seu feedback!",
          description: "Suas respostas foram enviadas com sucesso.",
        });
        
        // Reset form
        setAnswers({});
        setTextInputs({});
        setCurrentQuestionIndex(0);
        setIsCompleted(false);
        setContactInfo({
          nome: "",
          email: "",
          telefone: "",
          contactConsent: false
        });
      } else {
        toast({
          title: "Erro ao enviar",
          description: "Houve um problema ao enviar suas respostas. Por favor, tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao enviar o questionário:", error);
      toast({
        title: "Erro ao enviar",
        description: "Houve um problema ao enviar suas respostas. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Render survey question
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pergunta {currentQuestionIndex + 1} de {questions.length}</h3>
        <h4 className="text-xl font-semibold">{currentQuestion.text}</h4>
        
        {currentQuestion.isTextInput ? (
          <div className="space-y-2">
            <Textarea 
              placeholder="Digite sua resposta aqui..." 
              value={textInputs[currentQuestion.id] || ''}
              onChange={handleTextInput}
              className="min-h-[120px]"
            />
            <div className="flex justify-between mt-4">
              {currentQuestionIndex > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('prev')}
                >
                  Anterior
                </Button>
              )}
              <div className="flex-1" />
              <Button onClick={() => handleNavigation('next')}>
                {currentQuestionIndex === questions.length - 1 ? "Finalizar" : "Próximo"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <Button
                key={index}
                variant={isOptionSelected(option) ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </Button>
            ))}
            <div className="flex justify-between mt-4">
              {currentQuestionIndex > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('prev')}
                >
                  Anterior
                </Button>
              )}
              <div className="flex-1" />
              <Button onClick={() => handleNavigation('next')}>
                {currentQuestionIndex === questions.length - 1 ? "Finalizar" : "Próximo"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render thank you and contact form
  const renderThankYou = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Obrigado!</h3>
          <p className="text-muted-foreground mt-2">
            Agradecemos pelo seu interesse. Suas respostas nos ajudarão a entender melhor suas necessidades.
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Deixe suas informações de contato para receber nosso retorno</h4>
          
          <div className="space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={contactInfo.nome}
                onChange={handleContactInfoChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                name="email"
                type="email"
                value={contactInfo.email}
                onChange={handleContactInfoChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={contactInfo.telefone}
                onChange={handleContactInfoChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="contact-consent"
                checked={contactInfo.contactConsent}
                onCheckedChange={handleConsentToggle}
              />
              <Label htmlFor="contact-consent">
                Concordo em ser contatado sobre meu interesse em serviços de fotografia
              </Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsCompleted(false);
              setCurrentQuestionIndex(questions.length - 1);
            }}
          >
            Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Questionário de Fotografia
          </CardTitle>
          {!isCompleted && (
            <Progress value={progress} className="h-2 mt-2" />
          )}
        </CardHeader>
        <CardContent>
          {isCompleted ? renderThankYou() : renderQuestion()}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Suas respostas nos ajudam a personalizar nossos serviços para atender melhor às suas necessidades.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Survey;
