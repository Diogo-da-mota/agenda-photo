import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReferralPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [indicacao, setIndicacao] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processReferral = async () => {
      if (!code) {
        navigate('/');
        return;
      }

      // Se o usuário já está logado, não pode usar link de indicação
      if (user) {
        toast({
          title: "Você já possui uma conta",
          description: "Links de indicação são apenas para novos usuários.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Busca a indicação pelo código
        const { data: indicacaoData, error: indicacaoError } = await supabase
          .from('indicacoes')
          .select('*, users:user_id(*)')
          .eq('codigo_referencia', code)
          .single();

        if (indicacaoError) throw indicacaoError;
        if (!indicacaoData) throw new Error('Indicação não encontrada');

        setIndicacao(indicacaoData);

        // Armazena o código na sessão para usar depois do registro
        sessionStorage.setItem('referral_code', code);

        // Redireciona para o registro após 3 segundos
        setTimeout(() => {
          navigate('/auth/register');
        }, 3000);
      } catch (err) {
        console.error('Erro ao processar indicação:', err);
        setError('Link de indicação inválido ou expirado');
      } finally {
        setLoading(false);
      }
    };

    processReferral();
  }, [code, user, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Processando sua indicação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Link Inválido</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Bem-vindo ao Fotograf!</CardTitle>
          <CardDescription>
            Você foi indicado por {indicacao?.users?.name || 'um fotógrafo profissional'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Estamos te redirecionando para a página de cadastro. 
            Ao se cadastrar, você e quem te indicou receberão benefícios exclusivos!
          </p>
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 