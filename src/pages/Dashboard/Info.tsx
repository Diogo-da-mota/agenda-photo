import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Info, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Camera, 
  Globe, 
  Smartphone,
  Clock,
  Shield,
  HelpCircle,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';

const InfoPage: React.FC = () => {
  return (
    <div className="container p-6 mx-auto">
      <div className="flex flex-col space-y-8">
        {/* Animated Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl -z-10 animate-pulse"></div>
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl animate-ping"></div>
              <Info className="h-12 w-12 text-blue-600 relative z-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Informações do Sistema
              </h1>
              <p className="text-lg text-muted-foreground animate-slide-up">
                Tudo que você precisa saber sobre o AgendaPRO
              </p>
            </div>
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse ml-auto" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Sobre o Sistema */}
          <Card className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 border-blue-200/50 animate-fade-in-up" style={{animationDelay: '0.1s', backgroundColor: '#1e293b'}}>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
                  <Info className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-white group-hover:text-blue-300 transition-colors duration-300">Sobre o AgendaPRO</span>
              </CardTitle>
            </CardHeader>
                          <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-300">Versão:</span>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:scale-105 transition-transform">
                  v2.0.1
                </Badge>
              </div>
                              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-300">Última atualização:</span>
                  <span className="text-sm font-medium text-blue-300">Janeiro 2025</span>
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
                              <p className="text-sm text-gray-300 leading-relaxed">
                  Sistema completo de gestão para fotógrafos profissionais.
                  Gerencie clientes, agenda, financeiro e muito mais.
                </p>
            </CardContent>
          </Card>

          {/* Funcionalidades */}
          <Card className="group hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:-translate-y-2 border-green-200/50 animate-fade-in-up" style={{animationDelay: '0.2s', backgroundColor: '#1e293b'}}>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                  <Calendar className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-white group-hover:text-green-300 transition-colors duration-300">Funcionalidades</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Users, color: "text-green-600", label: "Gestão de Clientes" },
                { icon: Calendar, color: "text-blue-600", label: "Agenda Inteligente" },
                { icon: CreditCard, color: "text-red-600", label: "Controle Financeiro" },
                { icon: FileText, color: "text-purple-600", label: "Contratos Digitais" },
                { icon: Camera, color: "text-orange-600", label: "Portfólio Online" },
                { icon: Globe, color: "text-teal-600", label: "Portal do Cliente" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 group/item">
                  <div className="p-1.5 bg-white/80 rounded-md group-hover/item:shadow-md transition-all duration-300">
                    <item.icon className={`h-4 w-4 ${item.color} group-hover/item:scale-110 transition-transform duration-300`} />
                  </div>
                  <span className="text-sm font-medium text-gray-300 group-hover/item:text-white transition-colors duration-300">
                    {item.label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compatibilidade */}
          <Card className="group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 border-purple-200/50 animate-fade-in-up" style={{animationDelay: '0.3s', backgroundColor: '#1e293b'}}>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
                  <Smartphone className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-white group-hover:text-purple-300 transition-colors duration-300">Compatibilidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300">Dispositivos</h4>
                                  {["Desktop", "Tablet", "Smartphone"].map((device, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full block animate-pulse"></span>
                      <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-40"></span>
                    </div>
                    <span className="text-sm font-medium text-gray-300">{device}</span>
                  </div>
                ))}
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300">Navegadores</h4>
                                  {["Chrome", "Firefox", "Safari"].map((browser, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full block animate-pulse"></span>
                      <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-40"></span>
                    </div>
                                          <span className="text-sm font-medium text-gray-300">{browser}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:-translate-y-2 border-emerald-200/50 animate-fade-in-up" style={{animationDelay: '0.4s', backgroundColor: '#1e293b'}}>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors duration-300">
                  <Shield className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-white group-hover:text-emerald-300 transition-colors duration-300">Segurança & Privacidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Criptografia SSL", desc: "Todos os dados são protegidos" },
                { title: "Backup Automático", desc: "Seus dados estão seguros" },
                { title: "LGPD Compliance", desc: "Conformidade com a legislação" }
              ].map((item, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 group/security">
                  <div className="p-1 bg-emerald-100 rounded-md group-hover/security:bg-emerald-200 transition-colors duration-300">
                    <Shield className="h-4 w-4 text-emerald-600 group-hover/security:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                                          <p className="text-sm font-semibold text-gray-300 group-hover/security:text-emerald-300 transition-colors duration-300">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Disponibilidade */}
          <Card className="group hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:-translate-y-2 border-cyan-200/50 animate-fade-in-up" style={{animationDelay: '0.5s', backgroundColor: '#1e293b'}}>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors duration-300">
                  <Clock className="h-5 w-5 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-white group-hover:text-cyan-300 transition-colors duration-300">Disponibilidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                              <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Sistema</h4>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full block animate-pulse"></span>
                    <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-40"></span>
                  </div>
                                      <span className="text-sm font-medium text-gray-300">24/7 Online</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Sistema disponível 24 horas por dia
                  </p>
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                              <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Suporte</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">Segunda a Sexta: 8h às 18h</p>
                    <p className="text-sm text-gray-300">Sábado: 8h às 12h</p>
                    <p className="text-xs text-gray-400">Horário de Brasília</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suporte */}
          <Card className="group hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:-translate-y-2 border-orange-200/50 animate-fade-in-up" style={{animationDelay: '0.6s', backgroundColor: '#1e293b'}}>
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300">
                  <HelpCircle className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-white group-hover:text-orange-300 transition-colors duration-300">Suporte & Contato</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 group/contact">
                  <div className="p-2 bg-blue-100 rounded-md group-hover/contact:bg-blue-200 transition-colors duration-300">
                    <Mail className="h-4 w-4 text-blue-600 group-hover/contact:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-300">Email</p>
                    <p className="text-xs text-gray-400">suporte@agendapro.com.br</p>
                </div>
              </div>
                              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 group/contact">
                  <div className="p-2 bg-green-100 rounded-md group-hover/contact:bg-green-200 transition-colors duration-300">
                    <Phone className="h-4 w-4 text-green-600 group-hover/contact:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-300">WhatsApp</p>
                    <p className="text-xs text-gray-400">(11) 99999-9999</p>
                </div>
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
                              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Central de Ajuda</h4>
                  <p className="text-xs text-gray-400">
                    Acesse nossa documentação e tutoriais online
                  </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Animated Footer */}
        <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 border-indigo-200/50 animate-fade-in-up" style={{animationDelay: '0.7s', backgroundColor: '#1e293b'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="pt-8 pb-6 relative z-10">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AgendaPRO
                </h3>
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
                              <p className="text-lg text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                  Sistema de gestão completo para fotógrafos profissionais
                </p>
                <div className="flex justify-center gap-6 text-sm text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                <span>© 2025 AgendaPRO</span>
                <span className="text-purple-400">•</span>
                <span>Todos os direitos reservados</span>
                <span className="text-purple-400">•</span>
                <span className="font-semibold">Versão 2.0.1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default InfoPage; 