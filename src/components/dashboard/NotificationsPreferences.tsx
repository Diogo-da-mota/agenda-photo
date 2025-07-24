
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  FileText, 
  Cake, 
  MessageSquare, 
  Mail 
} from 'lucide-react';

const NotificationsPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    // Notification channels
    whatsapp: true,
    email: false,
    
    // Notification types
    events: true,
    payments: true,
    dasMei: true,
    birthdays: true,
    systemMessages: true,
    
    // Reminder timing
    eventReminder: 2, // days before event
  });
  
  const handleToggleChange = (key: string) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };
  
  const handleSavePreferences = () => {
    // Here you would save the preferences to your backend
    toast({
      title: "Preferências salvas",
      description: "Suas preferências de notificação foram atualizadas com sucesso."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferências de Notificações
        </CardTitle>
        <CardDescription>
          Configure como e quando deseja receber notificações do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canais de Notificação */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Canais de Notificação</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <Label htmlFor="whatsapp" className="font-medium">WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações via WhatsApp</p>
                </div>
              </div>
              <Switch 
                id="whatsapp" 
                checked={preferences.whatsapp}
                onCheckedChange={() => handleToggleChange('whatsapp')}
              />
            </div>
            
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="email" className="font-medium">E-mail</Label>
                  <p className="text-sm text-muted-foreground">Receber notificações via e-mail</p>
                </div>
              </div>
              <Switch 
                id="email" 
                checked={preferences.email}
                onCheckedChange={() => handleToggleChange('email')}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Tipos de Notificação */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Tipos de Notificação</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <Label htmlFor="events" className="font-medium">Eventos</Label>
              </div>
              <Switch 
                id="events" 
                checked={preferences.events}
                onCheckedChange={() => handleToggleChange('events')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <Label htmlFor="payments" className="font-medium">Pagamentos</Label>
              </div>
              <Switch 
                id="payments" 
                checked={preferences.payments}
                onCheckedChange={() => handleToggleChange('payments')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <Label htmlFor="dasMei" className="font-medium">DAS-MEI</Label>
              </div>
              <Switch 
                id="dasMei" 
                checked={preferences.dasMei}
                onCheckedChange={() => handleToggleChange('dasMei')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-pink-500" />
                <Label htmlFor="birthdays" className="font-medium">Aniversários</Label>
              </div>
              <Switch 
                id="birthdays" 
                checked={preferences.birthdays}
                onCheckedChange={() => handleToggleChange('birthdays')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <Label htmlFor="systemMessages" className="font-medium">Mensagens do Sistema</Label>
              </div>
              <Switch 
                id="systemMessages" 
                checked={preferences.systemMessages}
                onCheckedChange={() => handleToggleChange('systemMessages')}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Configurações de Tempo */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Configurações de Tempo</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="eventReminder" className="block mb-2">Lembrete de Eventos</Label>
              <select 
                id="eventReminder" 
                className="w-full p-2 border rounded-md"
                value={preferences.eventReminder}
                onChange={(e) => setPreferences({...preferences, eventReminder: parseInt(e.target.value)})}
              >
                <option value="1">1 dia antes</option>
                <option value="2">2 dias antes</option>
                <option value="3">3 dias antes</option>
                <option value="7">1 semana antes</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSavePreferences}>
            Salvar Preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPreferences;
