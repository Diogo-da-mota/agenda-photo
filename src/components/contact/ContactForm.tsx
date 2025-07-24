import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';

const ContactForm: React.FC = () => {
  const {
    formData,
    isSubmitting,
    submitMessage,
    handleInputChange,
    handleSubmit
  } = useContactForm();

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Envie sua mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nome e Telefone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nome *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Telefone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
              />
            </div>
            
            {/* Assunto */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Assunto *
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Como podemos ajudar?"
              />
            </div>
            
            {/* Mensagem */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Mensagem *
              </label>
              <Textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Descreva sua dúvida, sugestão ou como podemos ajudar..."
                rows={4}
              />
            </div>
            
            {/* Botão de Envio */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
            
            {/* Mensagem de Feedback */}
            {submitMessage && (
              <div className={`text-center p-4 rounded-lg ${
                submitMessage.includes('sucesso') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {submitMessage}
              </div>
            )}
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactForm; 