
import React from 'react';
import { User } from '@supabase/supabase-js';

interface UserInfoDisplayProps {
  user: User | null;
}

const UserInfoDisplay: React.FC<UserInfoDisplayProps> = ({ user }) => {
  return (
    <div className="p-3 bg-gray-50 rounded-md border">
      <p className="font-medium mb-1">ID do usuário logado:</p>
      {user ? (
        <p className="text-sm font-mono bg-black/95 text-green-400 p-2 rounded overflow-x-auto">
          {user.id}
        </p>
      ) : (
        <p className="text-red-500">Nenhum usuário autenticado</p>
      )}
    </div>
  );
};

export default UserInfoDisplay;
