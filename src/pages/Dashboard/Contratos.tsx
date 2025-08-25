import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Clock, Check, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { ContractList } from '@/components/contratos/ContractList';
import { CreateContractButton } from '@/components/contratos/CreateContractButton';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useContractCounts } from '@/hooks/useContractCounts';

const Contratos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { counts, isLoading, error } = useContractCounts({ enabled: true });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar contratos",
        description: "Não foi possível carregar os contratos. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [error, toast]);

  const handleSendReminders = () => {
    
  };

  return (
    <ResponsiveContainer>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Contratos Digitais</h1>
          <div className="flex items-center gap-2">
            {counts.pendentes > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 relative">
                    <Bell size={16} />
                    <span>Notificações</span>
                    <Badge className="absolute -top-2 -right-2 px-1.5 h-5 bg-red-500">
                      {counts.pendentes}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleSendReminders}>
                    Enviar lembretes automáticos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <CreateContractButton />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filtros
          </Button>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="pendentes" className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-500" />
              Pendentes
              {counts.pendentes > 0 && (
                <Badge className="ml-1 px-1.5 h-5 bg-red-500">{counts.pendentes}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assinados" className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Assinados
            </TabsTrigger>
            <TabsTrigger value="expirados" className="flex items-center gap-2">
              <X size={16} className="text-red-500" />
              Expirados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <ContractList filter="todos" searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="pendentes">
            <ContractList filter="pendentes" searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="assinados">
            <ContractList filter="assinados" searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="expirados">
            <ContractList filter="expirados" searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
};

export default Contratos;
