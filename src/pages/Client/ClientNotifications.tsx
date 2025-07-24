
import React, { useState } from 'react';
import { Bell, Mail, Phone, Calendar, FileSignature, CreditCard, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { processEmojisForWhatsApp, encodeTextWithEmojisForURL } from '@/utils/emojiUtils';

const ClientNotifications = () => {
  const { toast } = useToast();
  
  // Client data with phone
  const [clientPhone, setClientPhone] = useState("11987654321");
  
  // Email notification preferences
  const [emailNotifications, setEmailNotifications] = useState({
    newContracts: true,
    contractReminders: true,
    upcomingEvents: true,
    paymentReminders: true,
    paymentReceipts: true,
    marketing: false
  });
  
  // WhatsApp notification preferences
  const [whatsappNotifications, setWhatsappNotifications] = useState({
    newContracts: true,
    contractReminders: true,
    upcomingEvents: true,
    paymentReminders: true,
    marketing: false
  });
  
  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleWhatsAppToggle = (key: keyof typeof whatsappNotifications) => {
    setWhatsappNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSavePreferences = () => {
    toast({
      title: "Preferências salvas",
      description: "Suas configurações de notificação foram atualizadas com sucesso."
    });
  };
  
  const sendWhatsAppMessage = (type: string) => {
    // Remover caracteres não numéricos do telefone
    const phoneNumber = clientPhone.replace(/\D/g, '');
    
    // Mensagens padrão baseadas no tipo
    const messages = {
      contract: "Olá! Vi que você tem um contrato pendente para assinatura. Podemos ajudar com algo? 📋",
      event: "Olá! Gostaria de confirmar nosso próximo evento agendado. Está tudo certo para a data marcada? 🎉",
      payment: "Olá! Notamos que há um pagamento pendente em seu nome. Podemos ajudar com o processo de pagamento? 💳",
      general: "Olá! Como posso ajudar você hoje? 😊"
    };
    
    // Determinar qual mensagem usar
    const message = messages[type as keyof typeof messages] || messages.general;
    
    // Processar emojis para garantir compatibilidade com WhatsApp
    const mensagemProcessada = processEmojisForWhatsApp(message);
    
    // Codificar mensagem preservando emojis
    const mensagemCodificada = encodeTextWithEmojisForURL(mensagemProcessada);
    
    // Abrir WhatsApp com o número e mensagem
    window.open(`https://wa.me/55${phoneNumber}?text=${mensagemCodificada}`, '_blank');
    
    toast({
      title: "WhatsApp aberto",
      description: "Uma mensagem personalizada foi preparada para o cliente."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Preferências de Notificação</h1>
        <Button 
          variant="outline" 
          className="bg-green-500 hover:bg-green-600 text-white flex gap-2"
          onClick={() => sendWhatsAppMessage('general')}
        >
          <MessageSquare size={18} />
          Enviar WhatsApp
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificações por Email
            </CardTitle>
            <CardDescription>
              Configure quais notificações deseja receber por email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-contracts">Novos Contratos</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações quando um novo contrato for enviado
                </p>
              </div>
              <Switch
                id="email-contracts"
                checked={emailNotifications.newContracts}
                onCheckedChange={() => handleEmailToggle('newContracts')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-contract-reminders">Lembretes de Contratos</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes sobre contratos pendentes de assinatura
                </p>
              </div>
              <Switch
                id="email-contract-reminders"
                checked={emailNotifications.contractReminders}
                onCheckedChange={() => handleEmailToggle('contractReminders')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-events">Próximos Eventos</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes sobre eventos agendados
                </p>
              </div>
              <Switch
                id="email-events"
                checked={emailNotifications.upcomingEvents}
                onCheckedChange={() => handleEmailToggle('upcomingEvents')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-payments">Lembretes de Pagamento</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre pagamentos pendentes
                </p>
              </div>
              <Switch
                id="email-payments"
                checked={emailNotifications.paymentReminders}
                onCheckedChange={() => handleEmailToggle('paymentReminders')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-receipts">Recibos de Pagamento</Label>
                <p className="text-sm text-muted-foreground">
                  Recibos de pagamentos realizados
                </p>
              </div>
              <Switch
                id="email-receipts"
                checked={emailNotifications.paymentReceipts}
                onCheckedChange={() => handleEmailToggle('paymentReceipts')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-marketing">Emails de Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Novidades, promoções e conteúdo exclusivo
                </p>
              </div>
              <Switch
                id="email-marketing"
                checked={emailNotifications.marketing}
                onCheckedChange={() => handleEmailToggle('marketing')}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* WhatsApp Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Notificações por WhatsApp
            </CardTitle>
            <CardDescription>
              Configure quais notificações deseja receber por WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-contracts">Novos Contratos</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações quando um novo contrato for enviado
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-green-600"
                  onClick={() => sendWhatsAppMessage('contract')}
                >
                  <MessageSquare size={16} />
                </Button>
                <Switch
                  id="whatsapp-contracts"
                  checked={whatsappNotifications.newContracts}
                  onCheckedChange={() => handleWhatsAppToggle('newContracts')}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-contract-reminders">Lembretes de Contratos</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes sobre contratos pendentes de assinatura
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-green-600"
                  onClick={() => sendWhatsAppMessage('contract')}
                >
                  <MessageSquare size={16} />
                </Button>
                <Switch
                  id="whatsapp-contract-reminders"
                  checked={whatsappNotifications.contractReminders}
                  onCheckedChange={() => handleWhatsAppToggle('contractReminders')}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-events">Próximos Eventos</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes sobre eventos agendados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-green-600"
                  onClick={() => sendWhatsAppMessage('event')}
                >
                  <MessageSquare size={16} />
                </Button>
                <Switch
                  id="whatsapp-events"
                  checked={whatsappNotifications.upcomingEvents}
                  onCheckedChange={() => handleWhatsAppToggle('upcomingEvents')}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-payments">Lembretes de Pagamento</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre pagamentos pendentes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-green-600"
                  onClick={() => sendWhatsAppMessage('payment')}
                >
                  <MessageSquare size={16} />
                </Button>
                <Switch
                  id="whatsapp-payments"
                  checked={whatsappNotifications.paymentReminders}
                  onCheckedChange={() => handleWhatsAppToggle('paymentReminders')}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-marketing">Mensagens de Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Novidades, promoções e conteúdo exclusivo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 text-green-600"
                  onClick={() => sendWhatsAppMessage('general')}
                >
                  <MessageSquare size={16} />
                </Button>
                <Switch
                  id="whatsapp-marketing"
                  checked={whatsappNotifications.marketing}
                  onCheckedChange={() => handleWhatsAppToggle('marketing')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button className="w-full md:w-auto" onClick={handleSavePreferences}>
        Salvar Preferências
      </Button>
    </div>
  );
};

export default ClientNotifications;
