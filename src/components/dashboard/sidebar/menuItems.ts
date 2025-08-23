import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Settings, 
  UserPlus,
  Info,
  Heart,
  Image,
  Globe,
  History,
  Award,
  Camera,
  Album
} from 'lucide-react';
import { MenuItem } from './types';

export const createMenuItems = (unreadMessages: number = 0, pendingContracts: number = 0): MenuItem[] => [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    iconColor: "#4285F4", // Azul da marca Agenda Pro
    category: "PRINCIPAL"
  },
  {
    name: "Agenda",
    icon: Calendar,
    path: "/agenda",
    iconColor: "#FBBC05", // Amarelo da marca Agenda Pro
    category: "PRINCIPAL"
  },
  {
    name: "Clientes",
    icon: Users,
    path: "/clientes",
    iconColor: "#34A853", // Verde da marca Agenda Pro
    category: "PRINCIPAL"
  },
  {
    name: "Mensagens",
    icon: MessageSquare,
    path: "/mensagens",
    badge: unreadMessages > 0 ? unreadMessages : undefined,
    iconColor: "#A142F4", // Roxo da marca (mantém cor original)
    category: "ATIVIDADES"
  },
  {
    name: "Contratos",
    icon: FileText,
    path: "/contratos",
    badge: pendingContracts > 0 ? pendingContracts : undefined,
    newBadge: "Novo", // Adicionando o badge "Novo"
    iconColor: "#F39C12", // Laranja para contratos
    category: "CONTRATOS"
  },
  {
    name: "Financeiro",
    icon: CreditCard,
    path: "/financeiro",
    iconColor: "#EA4335", // Vermelho da marca Agenda Pro
    category: "FINANCEIRO"
  },
  {
    name: "Relatórios",
    icon: FileText,
    path: "/relatorios",
    iconColor: "#34A853", // Verde da marca Agenda Pro
    category: "FINANCEIRO"
  },  {
    name: "Portfólio",
    icon: Image,
    path: "/portfolio",
    iconColor: "#00BCD4", // Teal da marca
    category: "SITE"
  },
  {
    name: "Entrega de Fotos",
    icon: Camera,
    path: "/entrega-fotos",
    iconColor: "#FFFFFF", // Cor branca para o ícone da câmera
    category: "SITE"
  },
  {
    name: "Escolher Álbum",
    icon: Album,
    path: "/escolher-album",
    iconColor: "#8E44AD", // Roxo para álbuns (mantém cor original)
    category: "SITE",
    roles: ["admin"], // Visível apenas para admin
    isAdminOnly: true // Para aplicar background vermelho
  },
  {
    name: "Hist Atividades",
    icon: History,
    path: "/atividades-linha-do-tempo",
    iconColor: "#6B7280", // Cinza para histórico
    category: "ATIVIDADES"
  },
  {
    name: "Portal do Cliente",
    icon: Users,
    path: "/cliente",
    iconColor: "#34A853", // Verde da marca Agenda Pro (mantém cor original)
    category: "ATIVIDADES",
    roles: ["admin"], // Visível apenas para admin
    isAdminOnly: true // Para aplicar background vermelho
  },
  {
    name: "Indique e Ganhe",
    icon: Award,
    path: "/indique-ganhe",
    iconColor: "#FBBC05", // Amarelo da marca Agenda Pro
    category: "RECURSOS"
  },
  {
    name: "Configurações",
    icon: Settings,
    path: "/configuracoes",
    iconColor: "#6B7280", // Cinza neutro para configurações
    category: "SISTEMA"
  },
  {
    name: "Roadmap",
    icon: Award,
    path: "/roadmap",
    iconColor: "#FFD700", // Dourado para conquistas (mantém cor original)
    category: "ATIVIDADES",
    roles: ["admin"], // Visível apenas para admin
    isAdminOnly: true // Para aplicar background vermelho
  },
  {
    name: "Informações",
    icon: Info,
    path: "/info",
    iconColor: "#6B7280", // Cinza neutro para informações
    category: "SISTEMA"
  }
];
