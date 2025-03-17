
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
  },
  {
    id: 4,
    text: "What features do you value the most?",
    isTextInput: true
  },
  {
    id: 5,
    text: "What improvements would you suggest for our product/service?",
    isTextInput: true
  }
];

const Survey = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    contactConsent: false,
    sugestedValue: "" // Adicionar um campo para valor sugerido
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle text input for open-ended questions
  const handleTextInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: event.target.value
    }));
  };

  // Handle next/previous question navigation
  const handleNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      // Only proceed if an answer is provided
      if (answers[questions[currentQuestionIndex].id]) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        toast({
          title: "Please provide an answer",
          description: "You need to answer the question before proceeding.",
          variant: "destructive"
        });
      }
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex === questions.length - 1) {
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

  // Handle consent toggle
  const handleConsentToggle = () => {
    setContactInfo(prev => ({
      ...prev,
      contactConsent: !prev.contactConsent
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Preparar dados para submissão
      const initialContactInfo = {
        nome: contactInfo.name,
        e_mail: contactInfo.email,
        telefone: contactInfo.phone,
      };
      
      // Converter as respostas para o formato esperado pela função submitSurveyData
      const formattedResponses: Record<number, string[]> = {};
      Object.entries(answers).forEach(([questionId, answer]) => {
        formattedResponses[parseInt(questionId)] = [answer];
      });
      
      // Enviar dados para o Supabase através da função utilitária
      const success = await submitSurveyData(
        initialContactInfo,
        formattedResponses,
        {}, // Não temos follow-up responses aqui
        contactInfo // Passar contactInfo completo para incluir sugestedValue
      );
      
      if (success) {
        toast({
          title: "Thank you for your feedback!",
          description: "Your responses have been submitted successfully.",
        });
        
        // Reset form
        setAnswers({});
        setCurrentQuestionIndex(0);
        setIsCompleted(false);
        setContactInfo({
          name: "",
          email: "",
          phone: "",
          contactConsent: false,
          sugestedValue: ""
        });
      } else {
        toast({
          title: "Error submitting feedback",
          description: "There was a problem submitting your responses. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting your feedback.",
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
        
        {currentQuestion.isTextInput ? (
          <div className="space-y-2">
            <Textarea 
              placeholder="Type your answer here..." 
              value={answers[currentQuestion.id] || ''}
              onChange={handleTextInput}
              className="min-h-[120px]"
            />
            <div className="flex justify-between mt-4">
              {currentQuestionIndex > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('prev')}
                >
                  Previous
                </Button>
              )}
              <div className="flex-1" />
              <Button onClick={() => handleNavigation('next')}>
                {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        ) : (
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
            {currentQuestionIndex > 0 && (
              <Button 
                variant="ghost" 
                className="mt-4"
                onClick={() => handleNavigation('prev')}
              >
                Back to previous question
              </Button>
            )}
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
          <h3 className="text-2xl font-bold">Thank You!</h3>
          <p className="text-muted-foreground mt-2">
            We appreciate your feedback. It helps us improve our services.
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Would you like to stay in touch?</h4>
          <p className="text-muted-foreground">
            Leave your contact information if you'd like us to follow up on your feedback.
          </p>
          
          <div className="space-y-3">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Name</Label>
              <input
                id="name"
                name="name"
                type="text"
                value={contactInfo.name}
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
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={contactInfo.phone}
                onChange={handleContactInfoChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            {/* Campo adicional para valor sugerido */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="sugestedValue">Suggested Value (optional)</Label>
              <input
                id="sugestedValue"
                name="sugestedValue"
                type="text"
                value={contactInfo.sugestedValue}
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
                I consent to being contacted about my feedback
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
            disabled={isSubmitting}
          >
            Back to Survey
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
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
