
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/utils/messageUtils";

// Define survey questions
const questions = [
  {
    id: 1,
    text: "How satisfied are you with our product/service?",
    options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
  },
  {
    id: 2,
    text: "How likely are you to recommend our product/service to others?",
    options: ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"]
  },
  {
    id: 3,
    text: "How would you rate the quality of our customer service?",
    options: ["Excellent", "Good", "Average", "Poor", "Very Poor"]
  }
];

const Survey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate progress percentage
  const progress = Math.round((currentQuestionIndex / questions.length) * 100);
  
  // Handle option selection
  const handleOptionSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
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

  // Handle form submission
  const handleSubmit = async () => {
    if (!contactInfo.nome) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome para enviar o formulário.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Format survey answers as a message
    const message = Object.entries(answers)
      .map(([questionId, answer]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        return `${question?.text}: ${answer}`;
      })
      .join("\n\n");
    
    try {
      const success = await submitContactForm({
        nome: contactInfo.nome,
        email: contactInfo.email,
        telefone: contactInfo.telefone,
        mensagem: message
      });
      
      if (success) {
        toast({
          title: "Obrigado pelo seu feedback!",
          description: "Suas respostas foram enviadas com sucesso.",
        });
        
        // Reset form
        setAnswers({});
        setCurrentQuestionIndex(0);
        setIsCompleted(false);
        setContactInfo({
          nome: "",
          email: "",
          telefone: ""
        });
      } else {
        throw new Error("Falha ao enviar formulário");
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.",
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
        <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
        
        <div className="space-y-2">
          {currentQuestion.options?.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
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
            Agradecemos seu feedback. Ele nos ajuda a melhorar nossos serviços.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="nome" className="text-sm font-medium">Nome*</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={contactInfo.nome}
              onChange={handleContactInfoChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
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
            <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              value={contactInfo.telefone}
              onChange={handleContactInfoChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !contactInfo.nome}
          >
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
            Customer Feedback Survey
          </CardTitle>
          {!isCompleted && (
            <Progress value={progress} className="h-2 mt-2" />
          )}
        </CardHeader>
        <CardContent>
          {isCompleted ? renderThankYou() : renderQuestion()}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Your feedback helps us improve our products and services.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Survey;
