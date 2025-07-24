import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ResponsiveContainer from '@/components/ResponsiveContainer';

interface FAQProps {
  title?: string;
  description?: string;
  items?: {
    question: string;
    answer: string;
  }[];
}

const FAQ: React.FC<FAQProps> = ({ 
  title = "Perguntas Frequentes", 
  description = "Encontre respostas para as dúvidas mais comuns sobre nossa plataforma", 
  items = [
    {
      question: "Como funciona o sistema de agenda?",
      answer: "O sistema permite agendar sessões, gerenciar horários e receber lembretes automáticos."
    },
    {
      question: "Posso gerenciar múltiplos clientes?",
      answer: "Sim, você pode cadastrar e gerenciar quantos clientes precisar."
    },
    {
      question: "Como funciona o controle financeiro?",
      answer: "Registre receitas, despesas e acompanhe a saúde financeira do seu negócio."
    },
    {
      question: "Meus dados estão seguros na plataforma?",
      answer: "Sim, utilizamos criptografia de ponta e as melhores práticas de segurança do mercado para garantir que seus dados e os de seus clientes estejam sempre protegidos."
    },
    {
      question: "É possível personalizar os contratos?",
      answer: "Com certeza! Nos planos a partir do Profissional, você pode criar, salvar e reutilizar seus próprios modelos de contrato, personalizando cláusulas e informações para cada cliente."
    },
    {
      question: "Qual é a política de cancelamento?",
      answer: "Você pode cancelar sua assinatura a qualquer momento, sem taxas ou multas. Você continuará com acesso a todos os recursos do seu plano até o final do período já pago."
    }
  ]
}) => {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <ResponsiveContainer className="max-w-4xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {title && title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title && title.split(' ').slice(-1)}
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
          {items && items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-200 dark:border-slate-700">
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed pt-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ResponsiveContainer>
    </section>
  );
};

export default FAQ;
