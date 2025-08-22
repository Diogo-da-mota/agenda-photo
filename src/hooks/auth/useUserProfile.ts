
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from './types';

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Como não temos mais a tabela profiles, vamos criar um perfil mock
          const mockProfile: UserProfile = {
            id: currentUser.id,
            updated_at: new Date().toISOString(),
            username: currentUser.email?.split('@')[0] || 'user',
            full_name: currentUser.user_metadata?.full_name || 'Usuário',
            avatar_url: 'https://github.com/shadcn.png',
            billing_address: '',
            billing_city: '',
            billing_country: '',
            email: currentUser.email,
            phone: currentUser.user_metadata?.phone
          };

          setProfile(mockProfile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) return;
      
      // Como não temos mais a tabela profiles, apenas atualizamos o estado local
      setProfile((prev) => ({
        ...(prev as UserProfile),
        ...data,
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };
  
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Mock profile como acima
        const mockProfile: UserProfile = {
          id: currentUser.id,
          updated_at: new Date().toISOString(),
          username: currentUser.email?.split('@')[0] || 'user',
          full_name: currentUser.user_metadata?.full_name || 'Usuário',
          avatar_url: 'https://github.com/shadcn.png',
          billing_address: '',
          billing_city: '',
          billing_country: '',
          email: currentUser.email,
          phone: currentUser.user_metadata?.phone
        };

        setProfile(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { user, profile, loading, updateProfile, fetchProfile };
};
