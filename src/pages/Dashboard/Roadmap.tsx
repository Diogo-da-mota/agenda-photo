
import React, { useState } from 'react';
import { Map, Calendar, ThumbsUp, MessageSquare, Send, Star, GitBranch, CheckCheck, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import ResponsiveContainer from '@/components/ResponsiveContainer';

// Tipos para as features
interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'planned' | 'progress' | 'completed';
  estimatedCompletion?: string;
  votes: number;
  hasVoted?: boolean;
  comments: number;
}

const initialFeatures: Feature[] = [
  {
    id: '1',
    title: 'Integração com WhatsApp',
    description: 'Envie lembretes de sessão e alertas diretamente para seus clientes via WhatsApp.',
    category: 'planned',
    estimatedCompletion: 'Dezembro 2023',
    votes: 127,
    comments: 12
  },
  {
    id: '2',
    title: 'App Mobile',
    description: 'Acesse seu painel através de aplicativos nativos para iOS e Android.',
    category: 'planned',
    estimatedCompletion: 'Janeiro 2024',
    votes: 203,
    comments: 17
  },
  {
    id: '3',
    title: 'Contratos Digitais',
    description: 'Crie e envie contratos para assinatura digital dos clientes.',
    category: 'progress',
    estimatedCompletion: 'Novembro 2023',
    votes: 156,
    comments: 8
  },
  {
    id: '4',
    title: 'Galerias Online',
    description: 'Compartilhe galerias de fotos protegidas por senha com seus clientes.',
    category: 'progress',
    estimatedCompletion: 'Outubro 2023',
    votes: 189,
    comments: 22
  },
  {
    id: '5',
    title: 'Sistema de Notificações',
    description: 'Receba alertas sobre eventos, pagamentos e mensagens importantes.',
    category: 'completed',
    votes: 97,
    comments: 5
  },
  {
    id: '6',
    title: 'Dashboard Personalizado',
    description: 'Interface intuitiva com indicadores de desempenho do seu negócio.',
    category: 'completed',
    votes: 145,
    comments: 9
  },
];

const Roadmap: React.FC = () => {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [suggestion, setSuggestion] = useState('');
  const [activeTab, setActiveTab] = useState<'planned' | 'progress' | 'completed'>('planned');

  // Funções
  const handleVote = (id: string) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === id 
          ? { 
              ...feature, 
              votes: feature.hasVoted ? feature.votes - 1 : feature.votes + 1,
              hasVoted: !feature.hasVoted
            } 
          : feature
      )
    );

    toast({
      title: "Voto registrado!",
      description: "Obrigado por ajudar a definir nossas prioridades.",
    });
  };

  const handleSubmitSuggestion = () => {
    if (suggestion.trim()) {
      toast({
        title: "Sugestão enviada!",
        description: "Agradecemos sua contribuição para melhorar nossa plataforma.",
      });
      setSuggestion('');
    }
  };

  const filteredFeatures = features.filter(feature => feature.category === activeTab);

  return (
    <ResponsiveContainer>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roadmap Público</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe o futuro do Fotograf e ajude a definir nossas prioridades
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Planejado</p>
                <p className="text-2xl font-bold">
                  {features.filter(f => f.category === 'planned').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                <Map className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {features.filter(f => f.category === 'progress').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Concluído</p>
                <p className="text-2xl font-bold">
                  {features.filter(f => f.category === 'completed').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Features */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Funcionalidades</CardTitle>
            <CardDescription>
              Vote nas funcionalidades para ajudar a definir nossa ordem de prioridade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="planned" 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'planned' | 'progress' | 'completed')}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="planned">Planejado</TabsTrigger>
                <TabsTrigger value="progress">Em Progresso</TabsTrigger>
                <TabsTrigger value="completed">Concluído</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="pt-4">
                {activeTab === 'planned' && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Estas são as funcionalidades que estamos planejando desenvolver. 
                    Vote para influenciar nossa ordem de prioridade.
                  </p>
                )}
                {activeTab === 'progress' && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Estas funcionalidades já estão em desenvolvimento e serão lançadas em breve.
                  </p>
                )}
                {activeTab === 'completed' && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Estas funcionalidades já foram implementadas e estão disponíveis na plataforma.
                  </p>
                )}
                
                <div className="space-y-4">
                  {filteredFeatures.map((feature) => (
                    <div key={feature.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {feature.description}
                          </p>
                        </div>
                        <Button 
                          variant={feature.hasVoted ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleVote(feature.id)}
                          disabled={activeTab === 'completed'}
                          className="flex items-center gap-1 min-w-[80px]"
                        >
                          <ThumbsUp className="h-4 w-4" /> {feature.votes}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        {feature.estimatedCompletion && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" /> 
                            Previsão: {feature.estimatedCompletion}
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-xs"
                        >
                          <MessageSquare className="h-3 w-3" /> 
                          {feature.comments} comentários
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Enviar Sugestão */}
        <Card>
          <CardHeader>
            <CardTitle>Envie sua Sugestão</CardTitle>
            <CardDescription>
              Compartilhe suas ideias para novas funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva a funcionalidade que você gostaria de ver em nossa plataforma..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t py-3">
            <p className="text-sm text-muted-foreground">
              Todas as sugestões são analisadas por nossa equipe
            </p>
            <Button onClick={handleSubmitSuggestion}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Sugestão
            </Button>
          </CardFooter>
        </Card>

        {/* Processo de Desenvolvimento */}
        <Card>
          <CardHeader>
            <CardTitle>Nosso Processo de Desenvolvimento</CardTitle>
            <CardDescription>
              Conheça como transformamos ideias em funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-7 top-0 h-full w-0.5 bg-muted-foreground/20"></div>
              <div className="space-y-8">
                <div className="relative flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shrink-0 z-10">
                    <Vote className="h-6 w-6" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-medium">Coleta de Ideias</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recebemos sugestões de usuários e analisamos necessidades do mercado
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shrink-0 z-10">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-medium">Priorização</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Avaliamos o impacto e viabilidade das ideias, considerando os votos da comunidade
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shrink-0 z-10">
                    <Map className="h-6 w-6" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-medium">Desenvolvimento</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Transformamos a ideia em uma funcionalidade real, com testes de qualidade
                    </p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full h-14 w-14 flex items-center justify-center shrink-0 z-10">
                    <Send className="h-6 w-6" />
                  </div>
                  <div className="pt-2">
                    <h3 className="font-medium">Lançamento</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      A funcionalidade é disponibilizada para todos os usuários
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default Roadmap;
