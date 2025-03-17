
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactMessage, MensagemDeContato, StandardizedMessage } from "@/types/messages";

/**
 * Hook to listen for real-time message updates
 * @param isAuthenticated Whether the user is authenticated
 * @param tableExists Whether any message tables exist
 * @param onNewMessage Callback when a new message is received
 */
export const useRealtimeMessages = (
  isAuthenticated: boolean,
  tableExists: boolean,
  onNewMessage: (message: StandardizedMessage) => void
) => {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (isAuthenticated && tableExists && !subscribed) {
      console.log('Iniciando escuta de mensagens em tempo real...');
      setSubscribed(true);
      
      // Escutar mudanças na tabela mensagens_de_contato (nossa tabela principal)
      const mensagensDeContatoChannel = supabase
        .channel('mensagens-contato-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensagens_de_contato'
          },
          (payload) => {
            console.log('Nova mensagem em mensagens_de_contato recebida:', payload);
            const newMessage = payload.new as MensagemDeContato;
            
            // Convert to the standard format
            const standardizedMessage: StandardizedMessage = {
              id: newMessage.id,
              created_at: newMessage.criado_em,
              name: newMessage.nome,
              email: newMessage.e_mail,
              phone: newMessage.telefone,
              message: newMessage.mensagem,
              original_table: 'mensagens_de_contato'
            };
            
            // Check if we already have a message with this email or phone
            checkForDuplicateAndNotify(standardizedMessage, onNewMessage);
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição mensagens_de_contato:', status);
        });

      // Também escutar atualizações (para casos de usuário existente sendo atualizado)
      const mensagensUpdateChannel = supabase
        .channel('mensagens-contato-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'mensagens_de_contato'
          },
          (payload) => {
            console.log('Mensagem em mensagens_de_contato atualizada:', payload);
            const updatedMessage = payload.new as MensagemDeContato;
            
            // Convert to the standard format
            const standardizedMessage: StandardizedMessage = {
              id: updatedMessage.id,
              created_at: updatedMessage.criado_em,
              name: updatedMessage.nome,
              email: updatedMessage.e_mail,
              phone: updatedMessage.telefone,
              message: updatedMessage.mensagem,
              original_table: 'mensagens_de_contato',
              isUpdate: true // Flag for UI purposes
            };
            
            // For updates, we always want to notify
            onNewMessage(standardizedMessage);
            toast({
              title: "Mensagem atualizada",
              description: `Informações de ${updatedMessage.nome} foram atualizadas`,
            });
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição mensagens_de_contato (updates):', status);
        });

      // Manter compatibilidade com contact_messages se existir
      const contactMessagesChannel = supabase
        .channel('contact-messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'contact_messages'
          },
          (payload) => {
            console.log('Nova mensagem em contact_messages recebida:', payload);
            const newMessage = payload.new as ContactMessage;
            const standardizedMessage: StandardizedMessage = {
              ...newMessage,
              original_table: 'contact_messages'
            };
            
            // Check if we already have a message with this email or phone
            checkForDuplicateAndNotify(standardizedMessage, onNewMessage);
          }
        )
        .subscribe((status) => {
          console.log('Status da inscrição contact_messages:', status);
        });

      return () => {
        console.log('Removendo canais de escuta...');
        supabase.removeChannel(mensagensDeContatoChannel);
        supabase.removeChannel(mensagensUpdateChannel);
        supabase.removeChannel(contactMessagesChannel);
        setSubscribed(false);
      };
    }
  }, [isAuthenticated, tableExists, toast, onNewMessage, subscribed]);
  
  // Função auxiliar para verificar duplicatas antes de notificar
  const checkForDuplicateAndNotify = async (
    newMessage: StandardizedMessage, 
    callback: (message: StandardizedMessage) => void
  ) => {
    // Só notificar se for um novo usuário (checando email ou telefone)
    if (newMessage.email || newMessage.phone) {
      try {
        const { data: existingMessages } = await supabase
          .from('mensagens_de_contato')
          .select('id')
          .or(`e_mail.eq.${newMessage.email || ''},telefone.eq.${newMessage.phone || ''}`)
          .not('id', 'eq', newMessage.id);
          
        if (!existingMessages || existingMessages.length === 0) {
          // Este é o primeiro registro deste usuário, notificar
          callback(newMessage);
          toast({
            title: "Nova mensagem recebida",
            description: `Nova mensagem de ${newMessage.name}`,
          });
        } else {
          console.log(`Mensagem duplicada de ${newMessage.name} não notificada (usuário já existe)`);
          // Ainda é uma atualização, mas não vamos mostrar toast
          callback({...newMessage, isUpdate: true});
        }
      } catch (error) {
        console.error('Erro ao verificar duplicatas:', error);
        // Em caso de erro, notificar de qualquer forma
        callback(newMessage);
        toast({
          title: "Nova mensagem recebida",
          description: `Nova mensagem de ${newMessage.name}`,
        });
      }
    } else {
      // Se não temos email ou telefone, notificar normalmente
      callback(newMessage);
      toast({
        title: "Nova mensagem recebida",
        description: `Nova mensagem de ${newMessage.name}`,
      });
    }
  };
};
