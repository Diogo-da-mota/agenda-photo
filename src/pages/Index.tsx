
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Camera, Calendar, CreditCard, Users, Activity, Settings, LogOut } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="https://storage.alboom.ninja/sites/82835/albuns/1409267/logo-vertical-cores-e-preto.png?t=1741391284" 
              alt="Logo" 
              className="h-10"
            />
          </div>
          
          <nav className="space-y-1 flex-1">
            <a href="#" className="flex items-center gap-3 px-3 py-3 text-sm text-primary rounded-md bg-gray-50 font-medium">
              <Activity className="h-5 w-5" />
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
              <Calendar className="h-5 w-5" />
              Agenda
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
              <Users className="h-5 w-5" />
              Clientes
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
              <Camera className="h-5 w-5" />
              Portfólio
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
              <CreditCard className="h-5 w-5" />
              Financeiro
            </a>
          </nav>
          
          <div className="pt-4 border-t border-gray-200 mt-auto">
            <a href="#" className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
              <Settings className="h-5 w-5" />
              Configurações
            </a>
            <Link to="/login" className="flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors mt-1">
              <LogOut className="h-5 w-5" />
              Sair
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium">Bem-vindo, Fotógrafo</h1>
            <p className="text-muted-foreground mt-1">Veja um resumo das suas atividades recentes</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="h-10">
              <Camera className="h-4 w-4 mr-2" />
              Adicionar Ensaio
            </Button>
            <Button className="h-10 bg-black hover:bg-black/90 button-hover">
              <Calendar className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos</p>
                <h3 className="text-2xl font-medium mt-1">5</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Você tem 3 ensaios esta semana</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <h3 className="text-2xl font-medium mt-1">R$ 3.450</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">+12% em relação ao mês passado</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <h3 className="text-2xl font-medium mt-1">24</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">8 novos clientes este mês</p>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">Sessões Recentes</h2>
          <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Cliente</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Tipo</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Data</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Valor</th>
                    <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">Maria Silva</td>
                    <td className="px-6 py-4 text-sm">Ensaio Gestante</td>
                    <td className="px-6 py-4 text-sm">10/06/2023</td>
                    <td className="px-6 py-4 text-sm">R$ 750</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600">Concluído</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">João Santos</td>
                    <td className="px-6 py-4 text-sm">Ensaio Família</td>
                    <td className="px-6 py-4 text-sm">05/06/2023</td>
                    <td className="px-6 py-4 text-sm">R$ 650</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600">Concluído</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm">Ana Oliveira</td>
                    <td className="px-6 py-4 text-sm">Casamento</td>
                    <td className="px-6 py-4 text-sm">15/06/2023</td>
                    <td className="px-6 py-4 text-sm">R$ 2.050</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-600">Em edição</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
