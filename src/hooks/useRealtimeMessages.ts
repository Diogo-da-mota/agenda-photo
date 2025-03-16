
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

  useEffect(() => {
    if (isAuthenticated && tableExists) {
      // Listen for changes on contact_messages
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
            
            onNewMessage(standardizedMessage);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem de ${newMessage.name}`,
            });
          }
        )
        .subscribe();

      // Listen for changes on mensagens_de_contato
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
            
            onNewMessage(standardizedMessage);
            toast({
              title: "Nova mensagem recebida",
              description: `Nova mensagem de ${newMessage.nome}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(contactMessagesChannel);
        supabase.removeChannel(mensagensDeContatoChannel);
      };
    }
  }, [isAuthenticated, tableExists, toast, onNewMessage]);
};
