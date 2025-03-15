
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Inbox, LogOut, Users, Calendar, DollarSign, Globe, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SurveyResponse {
  id: string;
  created_at: string;
  event_type: string[];
  other_event_type: string | null;
  uses_online_calendar: boolean | null;
  calendar_tool: string | null;
  calendar_likes: string | null;
  calendar_dislikes: string | null;
  calendar_cost: number | null;
  has_portfolio: string | null;
  site_platform: string | null;
  site_likes: string | null;
  site_dislikes: string | null;
  site_cost: number | null;
  uses_other_tools: boolean | null;
  other_tools: string | null;
  other_tools_cost: number | null;
  ideal_site_description: string | null;
  contact_info: string | null;
}

const AdminDashboard = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setResponses(data as SurveyResponse[]);
      }
    } catch (error) {
      console.error("Error fetching survey responses:", error);
      toast({
        title: "Erro ao carregar respostas",
        description: "Não foi possível carregar as respostas da pesquisa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderResponseItem = (response: SurveyResponse) => {
    const hasContact = response.contact_info && response.contact_info.trim() !== "";

    return (
      <Card key={response.id} className="mb-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">
                {hasContact ? response.contact_info : "Anônimo"}
              </CardTitle>
              <CardDescription>
                Enviado em {formatDate(response.created_at)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-500">Tipo de evento que fotografa:</h4>
              <p>{response.event_type?.join(", ") || "Não informado"}</p>
              {response.other_event_type && (
                <p className="mt-1"><span className="font-medium">Outros:</span> {response.other_event_type}</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Usa agenda online:</h4>
              <p>{response.uses_online_calendar ? "Sim" : "Não"}</p>
              {response.uses_online_calendar && (
                <div className="mt-1 space-y-1 pl-4 border-l-2 border-gray-200">
                  <p><span className="font-medium">Ferramenta:</span> {response.calendar_tool || "Não informado"}</p>
                  <p><span className="font-medium">O que gosta:</span> {response.calendar_likes || "Não informado"}</p>
                  <p><span className="font-medium">O que não gosta:</span> {response.calendar_dislikes || "Não informado"}</p>
                  <p><span className="font-medium">Custo mensal:</span> {response.calendar_cost ? `R$ ${response.calendar_cost}` : "Não informado"}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Portfólio online:</h4>
              <p>{response.has_portfolio || "Não informado"}</p>
              {(response.has_portfolio === "Site" || response.has_portfolio === "Ambos") && (
                <div className="mt-1 space-y-1 pl-4 border-l-2 border-gray-200">
                  <p><span className="font-medium">Plataforma:</span> {response.site_platform || "Não informado"}</p>
                  <p><span className="font-medium">O que gosta:</span> {response.site_likes || "Não informado"}</p>
                  <p><span className="font-medium">O que não gosta:</span> {response.site_dislikes || "Não informado"}</p>
                  <p><span className="font-medium">Custo mensal:</span> {response.site_cost ? `R$ ${response.site_cost}` : "Não informado"}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Usa outras ferramentas pagas:</h4>
              <p>{response.uses_other_tools ? "Sim" : "Não"}</p>
              {response.uses_other_tools && (
                <div className="mt-1 space-y-1 pl-4 border-l-2 border-gray-200">
                  <p><span className="font-medium">Ferramentas:</span> {response.other_tools || "Não informado"}</p>
                  <p><span className="font-medium">Custo mensal total:</span> {response.other_tools_cost ? `R$ ${response.other_tools_cost}` : "Não informado"}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Site ideal:</h4>
              <p className="whitespace-pre-line">{response.ideal_site_description || "Não informado"}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-500">Informações de contato:</h4>
              <p>{response.contact_info || "Não informado"}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-end">
          <Button variant="outline" size="sm" className="text-xs">
            Ver detalhes
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const filteredResponses = responses.filter(response => {
    if (activeTab === "all") return true;
    if (activeTab === "with_contact") return !!response.contact_info;
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container px-4 mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="https://storage.alboom.ninja/sites/82835/albuns/1409267/logo-vertical-cores-e-preto.png?t=1741391284" 
              alt="Logo Agenda PRO" 
              className="h-10"
            />
            <span className="font-semibold text-xl">Admin</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container px-4 mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button variant="default" className="w-full justify-start gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                    <Inbox className="h-4 w-4" />
                    Respostas
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" disabled>
                    <Users className="h-4 w-4" />
                    Clientes
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" disabled>
                    <Calendar className="h-4 w-4" />
                    Agenda
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" disabled>
                    <DollarSign className="h-4 w-4" />
                    Financeiro
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" disabled>
                    <Globe className="h-4 w-4" />
                    Site
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2" disabled>
                    <Settings className="h-4 w-4" />
                    Configurações
                  </Button>
                </nav>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Total de respostas:</span>
                    <p className="font-semibold">{responses.length}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Com informações de contato:</span>
                    <p className="font-semibold">{responses.filter(r => !!r.contact_info).length}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Última resposta:</span>
                    <p className="font-semibold">
                      {responses.length > 0 ? formatDate(responses[0].created_at) : "Nenhuma"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Respostas da Pesquisa</CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2"
                    onClick={fetchResponses}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
                <CardDescription>
                  Visualize as respostas recebidas no formulário de pesquisa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="all">Todas ({responses.length})</TabsTrigger>
                    <TabsTrigger value="with_contact">Com contato ({responses.filter(r => !!r.contact_info).length})</TabsTrigger>
                  </TabsList>
                </Tabs>

                {isLoading ? (
                  <div className="py-20 text-center">
                    <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-500">Carregando respostas...</p>
                  </div>
                ) : filteredResponses.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResponses.map(renderResponseItem)}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-1">Nenhuma resposta encontrada</h3>
                    <p className="text-gray-500">
                      {activeTab === "all" 
                        ? "Ainda não há respostas na pesquisa." 
                        : "Não há respostas com informações de contato."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
