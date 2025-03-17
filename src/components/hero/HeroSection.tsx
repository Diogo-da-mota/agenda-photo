
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [showPriceInput, setShowPriceInput] = useState(false);

  const handleSurveyClick = () => {
    // Navegação direta para a página de pesquisa
    navigate('/survey');
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Se temos um valor de preço, vamos incluí-lo na mensagem
      let mensagem = "Interesse em testar a plataforma.";
      if (priceValue) {
        mensagem += ` Estaria disposto a pagar R$ ${priceValue} pela solução.`;
      }

      const { data, error } = await supabase
        .from('mensagens_de_contato')
        .insert({
          nome: "Interessado via site",
          e_mail: email,
          telefone: "",
          mensagem: mensagem
        })
        .select();

      if (error) {
        console.error("Erro ao enviar interesse:", error);
        toast({
          title: "Erro ao registrar interesse",
          description: "Não foi possível salvar seus dados. Por favor, tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log("Interesse registrado com sucesso:", data);
        toast({
          title: "Interesse registrado!",
          description: "Entraremos em contato em breve.",
          duration: 5000,
        });
        setEmail("");
        setSubmitted(true);
        setShowPriceInput(false);
      }
    } catch (error) {
      console.error("Exceção ao enviar interesse:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceSubmit = () => {
    if (priceValue && !isNaN(Number(priceValue))) {
      handleEmailSubmit();
    } else {
      handleEmailSubmit(); // Enviar mesmo sem preço
    }
  };

  const handleShowPriceInput = () => {
    setShowPriceInput(true);
  };

  return (
    <div className="relative z-10 text-white text-center px-4 max-w-4xl">
      <h2 className="text-sm sm:text-lg uppercase tracking-wider mb-2">AGENDA PRO</h2>
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
        A solução completa para fotógrafos profissionais
      </h1>
      <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-10">
        Gerencie sua agenda, clientes, finanças e presença online em um único lugar
      </p>
      
      {!submitted ? (
        <>
          {/* Card de preço que aparecerá primeiro */}
          {!showPriceInput ? (
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-8 max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">💰 Quanto você investiria nesta solução?</h3>
              <p className="text-gray-200 mb-4">
                Com base em todas as funcionalidades descritas, qual seria um valor justo mensal que você pagaria?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="Valor mensal" 
                    className="pl-10 bg-white/20 text-white border-white/30 placeholder:text-gray-300"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleShowPriceInput}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  disabled={isSubmitting}
                >
                  Continuar
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8 max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Input
                  type="email"
                  placeholder="Seu e-mail para contato"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 min-w-64"
                />
                <Button
                  onClick={handlePriceSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 sm:min-w-32"
                >
                  {isSubmitting ? "Enviando..." : "Quero participar"}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-8 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Obrigado pelo seu interesse!</h3>
          <p className="text-gray-200 mb-4">
            Entraremos em contato em breve com mais informações sobre a Agenda Pro.
          </p>
        </div>
      )}
      
      <Button 
        onClick={handleSurveyClick}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg sm:text-xl py-5 sm:py-6 px-8 sm:px-10 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        COMEÇAR AGORA
      </Button>
    </div>
  );
};

export default HeroSection;
