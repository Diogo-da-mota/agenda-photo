
import React, { useState, useEffect } from 'react';
import { Gift, Share, Users, Trophy, Copy, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { useIndicacoes } from '@/hooks/useIndicacoes';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmpresa } from '@/hooks/useEmpresa';

export default function Indicacoes() {
  const { toast } = useToast();
  const { indicacoes, stats, loading, getBeneficios, criarIndicacao } = useIndicacoes();
  const { configuracoes } = useEmpresa();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome_indicado: '',
    email_indicado: '',
    telefone_indicado: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preenche os campos com dados da empresa quando o diálogo é aberto
  useEffect(() => {
    if (isDialogOpen && configuracoes) {
      setFormData({
        nome_indicado: configuracoes.nome_empresa || '',
        email_indicado: configuracoes.email_empresa || '',
        telefone_indicado: configuracoes.telefone || ''
      });
    }
  }, [isDialogOpen, configuracoes]);

  const beneficios = getBeneficios();

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    
  };

  const handleShare = async (link: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Indique e Ganhe - Fotograf',
          text: 'Venha fazer parte da Fotograf! Use meu link de indicação e ganhe benefícios exclusivos.',
          url: link
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      handleCopyLink(link);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await criarIndicacao(formData);
      if (result) {
        setIsDialogOpen(false);
        setFormData({
          nome_indicado: '',
          email_indicado: '',
          telefone_indicado: ''
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Indique e Ganhe</h1>
          <p className="text-muted-foreground mt-2">
            Indique amigos fotógrafos e ganhe benefícios exclusivos.
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Convertidas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.convertidas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nivel}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.faltamParaProximo > 0
                  ? `Faltam ${stats.faltamParaProximo} para o próximo nível`
                  : 'Nível máximo alcançado!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benefício Atual</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{beneficios.atual.beneficio}</div>
            </CardContent>
          </Card>
        </div>

        {/* Níveis de Benefícios */}
        <Card>
          <CardHeader>
            <CardTitle>Níveis de Benefícios</CardTitle>
            <CardDescription>
              Quanto mais amigos você indicar, mais benefícios você ganha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {beneficios.todos.map((beneficio) => (
                <div
                  key={beneficio.nivel}
                  className={`p-4 rounded-lg ${beneficio.cor} bg-opacity-10 border border-opacity-20 ${
                    beneficio.nivel === stats.nivel ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="font-semibold mb-1">Nível {beneficio.nivel}</div>
                  <div className="text-sm text-muted-foreground mb-2">{beneficio.requisito}</div>
                  <div className="font-medium">{beneficio.beneficio}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Indicações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Suas Indicações</CardTitle>
              <CardDescription>
                Gerencie e acompanhe suas indicações.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nova Indicação</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Indicação</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do fotógrafo que você quer indicar.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={formData.nome_indicado}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome_indicado: e.target.value }))}
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email_indicado}
                        onChange={(e) => setFormData(prev => ({ ...prev, email_indicado: e.target.value }))}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone_indicado}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone_indicado: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar Indicação'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todas" className="w-full">
              <TabsList>
                <TabsTrigger value="todas">Todas ({stats.total})</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes ({stats.pendentes})</TabsTrigger>
                <TabsTrigger value="convertidas">Convertidas ({stats.convertidas})</TabsTrigger>
              </TabsList>

              <TabsContent value="todas" className="space-y-4">
                {indicacoes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Você ainda não tem indicações.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {indicacoes.map((indicacao) => (
                      <Card key={indicacao.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{indicacao.nome_indicado}</CardTitle>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              indicacao.status === 'convertido' 
                                ? 'bg-green-500 bg-opacity-10 text-green-500'
                                : 'bg-yellow-500 bg-opacity-10 text-yellow-500'
                            }`}>
                              {indicacao.status === 'convertido' ? 'Convertido' : 'Pendente'}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="grid gap-1">
                            <div className="text-sm text-muted-foreground">
                              {indicacao.email_indicado}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {indicacao.telefone_indicado}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Indicado em: {new Date(indicacao.data_indicacao).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(indicacao.link_indicacao)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar Link
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleShare(indicacao.link_indicacao)}
                          >
                            <Share className="h-4 w-4 mr-2" />
                            Compartilhar
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pendentes" className="space-y-4">
                {indicacoes.filter(i => i.status === 'pendente').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma indicação pendente.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {indicacoes
                      .filter(i => i.status === 'pendente')
                      .map((indicacao) => (
                        <Card key={indicacao.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{indicacao.nome_indicado}</CardTitle>
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-500 bg-opacity-10 text-yellow-500">
                                Pendente
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid gap-1">
                              <div className="text-sm text-muted-foreground">
                                {indicacao.email_indicado}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {indicacao.telefone_indicado}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Indicado em: {new Date(indicacao.data_indicacao).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(indicacao.link_indicacao)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Link
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleShare(indicacao.link_indicacao)}
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Compartilhar
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="convertidas" className="space-y-4">
                {indicacoes.filter(i => i.status === 'convertido').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma indicação convertida.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {indicacoes
                      .filter(i => i.status === 'convertido')
                      .map((indicacao) => (
                        <Card key={indicacao.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{indicacao.nome_indicado}</CardTitle>
                              <span className="px-2 py-1 rounded-full text-xs bg-green-500 bg-opacity-10 text-green-500">
                                Convertido
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-1">
                              <div className="text-sm text-muted-foreground">
                                {indicacao.email_indicado}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {indicacao.telefone_indicado}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Indicado em: {new Date(indicacao.data_indicacao).toLocaleDateString()}
                              </div>
                              {indicacao.data_conversao && (
                                <div className="text-xs text-muted-foreground">
                                  Convertido em: {new Date(indicacao.data_conversao).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
}
