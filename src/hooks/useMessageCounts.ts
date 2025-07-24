import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/lib/supabase";

export const useMessageCounts = () => {
  const { user } = useAuth();

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Por enquanto, consideramos as mensagens dos últimos 7 dias como "não lidas"
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const counts = {
    total: messages.length,
    naoLidas: messages.filter(message => 
      new Date(message.criado_em) > sevenDaysAgo
    ).length,
    recentes: messages.filter(message => 
      new Date(message.criado_em) > sevenDaysAgo
    ).length,
  };

  return {
    counts,
    messages,
    isLoading,
    error
  };
};
