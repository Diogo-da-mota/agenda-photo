
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define survey questions
const questions = [
  {
    id: 1,
    text: "Qual o tipo de evento que você mais fotografa atualmente?",
    options: ["Casamentos", "Ensaios (gestante, newborn, família)", "Eventos corporativos", "Moda", "Outros"]
  },
  {
    id: 2,
    text: "Com que frequência você realiza sessões fotográficas?",
    options: ["Semanalmente", "Mensalmente", "Algumas vezes por ano", "Raramente", "Estou começando agora"]
  },
  {
    id: 3,
    text: "Qual equipamento você mais utiliza para fotografar?",
    options: ["DSLR profissional", "Câmera mirrorless", "Smartphone", "Câmera compacta", "Outro"]
  },
  {
    id: 4,
    text: "Quais áreas da fotografia você gostaria de aprender mais?",
    options: ["Iluminação", "Edição de fotos", "Composição", "Direção de modelos", "Gestão do negócio"]
  },
  {
    id: 5,
    text: "Qual seria sua disponibilidade para um workshop de fotografia?",
    options: ["Dias de semana", "Finais de semana", "Noites", "Online sob demanda", "Não tenho interesse"]
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
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  
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

  // Handle previous button click
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (answers[questions[currentQuestionIndex].id]) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
      }
    } else {
      toast({
        title: "Selecione uma opção",
        description: "Por favor, selecione uma resposta para continuar.",
        variant: "destructive"
      });
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
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium">Pergunta {currentQuestionIndex + 1} de {questions.length}</h3>
          <h2 className="text-xl font-semibold mt-2">{currentQuestion.text}</h2>
        </div>
        
        <RadioGroup 
          value={answers[currentQuestion.id] || ""} 
          className="space-y-3"
          onValueChange={(value) => setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
          }))}
        >
          {currentQuestion.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 border p-3 rounded-md">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
          >
            Próxima
          </Button>
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
            Questionário para Fotógrafos
          </CardTitle>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          {isCompleted ? renderThankYou() : renderQuestion()}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground text-center">
          Suas respostas nos ajudam a melhorar nossos produtos e serviços.
        </CardFooter>
      </Card>
    </div>
  );
};

export default Survey;
