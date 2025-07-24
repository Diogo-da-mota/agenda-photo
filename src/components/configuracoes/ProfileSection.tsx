
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ProfileSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          // Carregar dados básicos do usuário
          setEmail(user.email || '');
          
          // Para avatar, usamos dados do auth.users se disponível
          if (user.user_metadata?.avatar_url) {
            setProfileImage(user.user_metadata.avatar_url);
          }
          
          if (user.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
          }
          
          // Dados simulados para demonstração
          setProfession('Profissional');
          setPhone('(11) 99999-9999');
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      }
    };

    loadProfile();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Suas Informações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2">
            {profileImage && (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
          <h3 className="font-medium">{fullName || 'Nome não definido'}</h3>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium">Profissão</label>
            <p className="text-sm text-gray-600">{profession || 'Não informado'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <p className="text-sm text-gray-600">{phone || 'Não informado'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
