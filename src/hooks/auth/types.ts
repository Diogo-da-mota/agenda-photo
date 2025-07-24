
import { AuthSession, User } from '@supabase/supabase-js';

// Interface simplificada para perfil de usuário
export interface UserProfile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
  billing_address: string;
  billing_city: string;
  billing_country: string;
  payment_method?: string;
  user_id?: string;
  email?: string;
  phone?: string;
}

export interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  profile: UserProfile | null; 
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: { full_name: string, phone?: string }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  // Função simplificada que sempre retorna false, já que a integração foi removida
  isGoogleConnected: () => boolean;
  refreshProfile: () => Promise<void>;
}
