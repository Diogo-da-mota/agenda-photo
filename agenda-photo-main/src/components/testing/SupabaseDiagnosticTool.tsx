
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserInfoDisplay from './diagnostic/UserInfoDisplay';
import TestButton from './diagnostic/TestButton';
import DiagnosticLog from './diagnostic/DiagnosticLog';
import { useSupabaseDiagnostic } from './diagnostic/useSupabaseDiagnostic';

const SupabaseDiagnosticTool = () => {
  const { user } = useAuth();
  const { loading, logs, testSupabaseSave } = useSupabaseDiagnostic(user);

  return (
    <Card className="border-amber-300 shadow-md">
      <CardHeader className="bg-amber-50">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Ferramenta de Diagnóstico Supabase
        </CardTitle>
        <CardDescription>
          Identifique e solucione problemas de salvamento no Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <UserInfoDisplay user={user} />
        <TestButton 
          onClick={testSupabaseSave} 
          loading={loading} 
          disabled={!user} 
        />
        <DiagnosticLog logs={logs} />
      </CardContent>
    </Card>
  );
};

export default SupabaseDiagnosticTool;
