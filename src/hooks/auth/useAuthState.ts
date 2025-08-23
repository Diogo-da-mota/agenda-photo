import { useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);
  
  // Controle para evitar múltiplas inicializações
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    initialSessionChecked,
    setInitialSessionChecked,
    initializingRef,
    initializedRef
  };
};