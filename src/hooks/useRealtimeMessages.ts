import { useState, useEffect, useRef } from 'react';
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
  const channelsRef = useRef<any[]>([]);
  
  // Cleanup function to remove channels
  const cleanupChannels = () => {
    if (channelsRef.current.length > 0) {
      console.log('Removendo canais de escuta...');
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      setSubscribed(false);
    }
  };

  useEffect(() => {
    // Only set up listeners if authenticated, table exists, and not already subscribed
    if (isAuthenticated && tableExists && !subscribed) {
      console.log('Iniciando escuta de mensagens em tempo real...');
      setSubscribed(true);
      
      // Listen for changes to mensagens_de_contato (our main table)
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
      channelsRef.current.push(mensagensDeContatoChannel);

      // Also listen for updates (for cases of existing user being updated)
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
      channelsRef.current.push(mensagensUpdateChannel);

      // Keep compatibility with contact_messages if it exists
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
      channelsRef.current.push(contactMessagesChannel);

      return cleanupChannels;
    }
    
    // If conditions aren't met but we were previously subscribed, clean up
    if (!isAuthenticated || !tableExists) {
      cleanupChannels();
    }
    
    return cleanupChannels;
  }, [isAuthenticated, tableExists, toast, onNewMessage, subscribed]);
  
  // Helper function to check for duplicates before notifying
  const checkForDuplicateAndNotify = async (
    newMessage: StandardizedMessage, 
    callback: (message: StandardizedMessage) => void
  ) => {
    // Only notify if it's a new user (checking email or phone)
    if (newMessage.email || newMessage.phone) {
      try {
        const { data: existingMessages } = await supabase
          .from('mensagens_de_contato')
          .select('id')
          .or(`e_mail.eq.${newMessage.email || ''},telefone.eq.${newMessage.phone || ''}`)
          .not('id', 'eq', newMessage.id);
          
        if (!existingMessages || existingMessages.length === 0) {
          // This is the first record for this user, notify
          callback(newMessage);
          toast({
            title: "Nova mensagem recebida",
            description: `Nova mensagem de ${newMessage.name}`,
          });
        } else {
          console.log(`Mensagem duplicada de ${newMessage.name} não notificada (usuário já existe)`);
          // Still an update, but we won't show toast
          callback({...newMessage, isUpdate: true});
        }
      } catch (error) {
        console.error('Erro ao verificar duplicatas:', error);
        // In case of error, notify anyway
        callback(newMessage);
        toast({
          title: "Nova mensagem recebida",
          description: `Nova mensagem de ${newMessage.name}`,
        });
      }
    } else {
      // If we don't have email or phone, notify normally
      callback(newMessage);
      toast({
        title: "Nova mensagem recebida",
        description: `Nova mensagem de ${newMessage.name}`,
      });
    }
  };
};
