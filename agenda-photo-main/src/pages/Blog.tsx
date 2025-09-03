import React from 'react';
import LandingLayout from "@/layouts/LandingLayout";
import ResponsiveContainer from "@/components/ResponsiveContainer";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  ArrowRight,
  Camera,
  Zap,
  Users,
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Blog: React.FC = () => {
  // Posts simulados do blog
  const posts = [
    {
      id: 1,
      title: "Como a AgendaPRO revoluciona a gestão de fotógrafos profissionais",
      excerpt: "Descubra como nossa plataforma está transformando a forma como fotógrafos gerenciam seus negócios, desde o agendamento até o controle financeiro.",
      date: "15 de Janeiro, 2025",
      author: "Equipe AgendaPRO",
      category: "Gestão",
      icon: TrendingUp,
      readTime: "5 min"
    },
    {
      id: 2,
      title: "5 funcionalidades essenciais para fotógrafos modernos",
      excerpt: "Explore as ferramentas mais importantes que todo fotógrafo profissional precisa para otimizar seu workflow e aumentar sua produtividade.",
      date: "12 de Janeiro, 2025",
      author: "Equipe AgendaPRO",
      category: "Funcionalidades",
      icon: Zap,
      readTime: "7 min"
    },
    {
      id: 3,
      title: "Automação de WhatsApp: O futuro da comunicação com clientes",
      excerpt: "Aprenda como automatizar suas mensagens no WhatsApp pode economizar horas do seu tempo e melhorar a experiência dos seus clientes.",
      date: "10 de Janeiro, 2025",
      author: "Equipe AgendaPRO",
      category: "Automação",
      icon: Users,
      readTime: "6 min"
    },
    {
      id: 4,
      title: "Organizando seu portfólio digital: Dicas práticas",
      excerpt: "Estratégias eficazes para criar um portfólio online que converte visitantes em clientes e destaca seu trabalho fotográfico.",
      date: "8 de Janeiro, 2025",
      author: "Equipe AgendaPRO",
      category: "Portfolio",
      icon: Camera,
      readTime: "4 min"
    }
  ];

  return (
    <LandingLayout>
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.01]"></div>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-400/10 blur-3xl translate-x-1/3 translate-y-1/3 animate-float" style={{ animationDelay: '2s' }}></div>
          
          <ResponsiveContainer className="relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-8">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">Conhecimento e Inspiração</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight">
                Blog{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AgendaPRO
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Dicas, tutoriais e novidades sobre gestão fotográfica e crescimento profissional
              </p>
            </div>
          </ResponsiveContainer>
        </section>

        {/* Posts do Blog */}
        <section className="py-20">
          <ResponsiveContainer>
            <div className="grid gap-8 lg:gap-12">
              
              {/* Post Principal (Featured) */}
              <Card className="group overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200/50 dark:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 animate-fade-in">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-transform">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {posts[0].category}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {posts[0].date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Clock className="w-4 h-4" />
                          {posts[0].readTime}
                        </div>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-600 transition-colors">
                        {posts[0].title}
                      </h2>
                      
                      <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {posts[0].excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <User className="w-4 h-4" />
                          {posts[0].author}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          className="group/btn text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold"
                        >
                          Ler mais
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-64 h-48 md:h-64 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {React.createElement(posts[0].icon, { className: "w-16 h-16 text-white opacity-80" })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts Secundários */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.slice(1).map((post, index) => (
                  <Card 
                    key={post.id} 
                    className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 border-blue-200/50 animate-fade-in-up" 
                    style={{animationDelay: `${0.2 * (index + 1)}s`}}
                  >
                    <CardContent className="p-6">
                      <div className="w-full h-48 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500">
                        {React.createElement(post.icon, { className: "w-12 h-12 text-white opacity-80" })}
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="group/btn text-blue-600 hover:text-blue-700 p-0 h-auto text-xs font-semibold"
                        >
                          Ler mais
                          <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA para Newsletter */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden animate-fade-in" style={{animationDelay: '0.8s'}}>
                <div className="absolute inset-0 bg-black/10"></div>
                <CardContent className="p-8 md:p-12 text-center relative z-10">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                      Não perca nenhuma novidade!
                    </h2>
                    
                    <p className="text-lg opacity-90 mb-8">
                      Receba dicas exclusivas, tutoriais e atualizações sobre fotografia e gestão empresarial diretamente no seu email.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                      <input 
                        type="email" 
                        placeholder="Seu melhor email"
                        className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <Button 
                        className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold rounded-lg transition-colors"
                      >
                        Assinar
                      </Button>
                    </div>
                    
                    <p className="text-sm opacity-70 mt-4">
                      100% livre de spam. Cancele quando quiser.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </ResponsiveContainer>
        </section>

      </div>
    </LandingLayout>
  );
};

export default Blog; 