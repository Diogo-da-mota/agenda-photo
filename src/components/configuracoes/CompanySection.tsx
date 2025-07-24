import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEmpresa } from '@/hooks/useEmpresa';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Building } from 'lucide-react';
import { aplicarMascaraCpfCnpj, aplicarMascaraTelefone } from '@/utils/formatters';

const CompanySection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [telefone, setTelefone] = useState('');
  const [emailEmpresa, setEmailEmpresa] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [cnpj, setCnpj] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [site, setSite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { configuracoes, carregando, atualizarConfiguracoes, carregarConfiguracoes, initialLoadCompleted } = useEmpresa();

  // Função para formatar CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    return aplicarMascaraCpfCnpj(value);
  };

  // Função para formatar telefone
  const formatTelefone = (value: string) => {
    return aplicarMascaraTelefone(value);
  };

  // Carregar dados automaticamente ao montar o componente
  useEffect(() => {
    if (user && !initialLoadCompleted) {
  
      carregarConfiguracoes();
    }
  }, [user, carregarConfiguracoes, initialLoadCompleted]);

  // Preencher formulário quando dados estiverem disponíveis
  useEffect(() => {
    if (configuracoes) {

      setNomeEmpresa(configuracoes.nome_empresa || '');
      setTelefone(formatTelefone(configuracoes.telefone || '')); // 🔥 APLICAR FORMATAÇÃO AO CARREGAR
      setEmailEmpresa(configuracoes.email_empresa || '');
      setEndereco(configuracoes.endereco || '');
      setCidade(configuracoes.cidade || '');
      setEstado(configuracoes.estado || '');
      setCep(configuracoes.cep || '');
      setLogoUrl(configuracoes.logo_url || null);
      setCnpj(formatCpfCnpj(configuracoes.cnpj || '')); // 🔥 APLICAR FORMATAÇÃO AO CARREGAR
      setWhatsapp(formatTelefone(configuracoes.whatsapp || '')); // 🔥 APLICAR FORMATAÇÃO AO CARREGAR
      setInstagram(configuracoes.instagram || '');
      setFacebook(configuracoes.facebook || '');
      setSite(configuracoes.site || '');
    }
  }, [configuracoes]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Preparar dados com valores explícitos (incluindo null para campos vazios)
      const dadosParaSalvar = {
        nome_empresa: nomeEmpresa.trim() || null,
        cnpj: cnpj.replace(/\D/g, '').trim() || null, // 🔥 REMOVER FORMATAÇÃO ANTES DE SALVAR
        telefone: telefone.replace(/\D/g, '').trim() || null, // 🔥 REMOVER FORMATAÇÃO ANTES DE SALVAR
        whatsapp: whatsapp.replace(/\D/g, '').trim() || null, // 🔥 REMOVER FORMATAÇÃO ANTES DE SALVAR
        email_empresa: emailEmpresa.trim() || null,
        endereco: endereco.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        cep: cep.trim() || null,
        instagram: instagram.trim() || null,
        facebook: facebook.trim() || null,
        site: site.trim() || null,
        logo_url: logoUrl?.trim() || null
      };



      // Salvar configurações da empresa usando o hook
      const success = await atualizarConfiguracoes(dadosParaSalvar);

      if (success) {
        toast({
          title: "Configurações salvas!",
          description: "As informações da empresa foram atualizadas com sucesso no banco de dados.",
        });
      } else {
        throw new Error("Falha ao salvar configurações");
      }
    } catch (error) {
      console.error('Erro detalhado no CompanySection:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações da empresa. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading inicial enquanto carrega dados
  if (carregando && !initialLoadCompleted) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Carregando dados da empresa...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informações da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nome da Empresa e CNPJ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome-empresa">Nome da Empresa</Label>
            <Input
              id="nome-empresa"
              type="text"
              placeholder="Nome da Empresa"
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CPF/CNPJ</Label>
            <Input
              id="cnpj"
              type="text"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => {
                const formatted = formatCpfCnpj(e.target.value);
                setCnpj(formatted);
              }}
              disabled={carregando || isLoading}
            />
          </div>
        </div>

        {/* Telefone e WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="text"
              placeholder="(00)0 0000-0000"
              value={telefone}
              onChange={(e) => {
                const formatted = formatTelefone(e.target.value);
                setTelefone(formatted);
              }}
              disabled={carregando || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="text"
              placeholder="(00)0 0000-0000"
              value={whatsapp}
              onChange={(e) => {
                const formatted = formatTelefone(e.target.value);
                setWhatsapp(formatted);
              }}
              disabled={carregando || isLoading}
            />
          </div>
        </div>

        {/* E-mail da Empresa */}
        <div className="space-y-2">
          <Label htmlFor="email-empresa">E-mail da Empresa</Label>
          <Input
            id="email-empresa"
            type="email"
            placeholder="E-mail de contato da empresa"
            value={emailEmpresa}
            onChange={(e) => setEmailEmpresa(e.target.value)}
            disabled={carregando || isLoading}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            type="text"
            placeholder="Endereço da empresa"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            disabled={carregando || isLoading}
          />
        </div>

        {/* Cidade, Estado e CEP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              type="text"
              placeholder="Cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              type="text"
              placeholder="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>
        </div>

        {/* Redes Sociais e Site */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              type="text"
              placeholder="@seuinstagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              type="text"
              placeholder="Facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            <Input
              id="site"
              type="text"
              placeholder="https://www.seusite.com.br"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              disabled={carregando || isLoading}
            />
          </div>
        </div>

        {/* URL do Logo */}
        <div className="space-y-2">
          <Label htmlFor="logo-url">URL do Logo</Label>
          <Input
            id="logo-url"
            type="text"
            placeholder="URL do Logo"
            value={logoUrl || ''}
            onChange={(e) => setLogoUrl(e.target.value)}
            disabled={carregando || isLoading}
          />
        </div>

        {/* Botão de Salvar */}
        <div className="pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={isLoading || carregando}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Dados da Empresa
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanySection;
