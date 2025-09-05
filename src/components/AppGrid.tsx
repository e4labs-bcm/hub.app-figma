import { 
  Users, 
  Brain, 
  Heart, 
  UserPlus,
  Calendar,
  Baby,
  Book,
  UsersRound,
  MessageCircle,
  Instagram,
  Youtube,
  Headphones,
  CalendarDays,
  Music,
  Sparkles,
  PauseCircle,
  ShoppingBag
} from 'lucide-react';

interface AppItem {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  onClick?: () => void;
}

const apps: AppItem[] = [
  {
    icon: <Users className="w-8 h-8 text-red-600" />,
    label: "Quem Nós Somos",
    bgColor: "bg-yellow-400"
  },
  {
    icon: <Brain className="w-8 h-8 text-black" />,
    label: "Meditação Semanal",
    bgColor: "bg-white"
  },
  {
    icon: <Heart className="w-8 h-8 text-red-500" />,
    label: "Contribua",
    bgColor: "bg-white"
  },
  {
    icon: <UserPlus className="w-8 h-8 text-blue-400" />,
    label: "Faça Parte",
    bgColor: "bg-gray-900"
  },
  {
    icon: <Calendar className="w-8 h-8 text-white" />,
    label: "Tema do Ano",
    bgColor: "bg-green-500"
  },
  {
    icon: <Baby className="w-8 h-8 text-black" />,
    label: "Kids",
    bgColor: "bg-white"
  },
  {
    icon: <Book className="w-8 h-8 text-white" />,
    label: "App Bíblia",
    bgColor: "bg-red-700"
  },
  {
    icon: <UsersRound className="w-8 h-8 text-black" />,
    label: "Grupos Pequenos",
    bgColor: "bg-white"
  },
  {
    icon: <MessageCircle className="w-8 h-8 text-white" />,
    label: "Grupo WhatsApp",
    bgColor: "bg-green-500"
  },
  {
    icon: <Instagram className="w-8 h-8 text-white" />,
    label: "Insta",
    bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
  },
  {
    icon: <Youtube className="w-8 h-8 text-white" />,
    label: "YouTube",
    bgColor: "bg-red-600"
  },
  {
    icon: <Headphones className="w-8 h-8 text-white" />,
    label: "PodCast",
    bgColor: "bg-orange-500"
  },
  {
    icon: <CalendarDays className="w-8 h-8 text-blue-600" />,
    label: "Agenda da Família",
    bgColor: "bg-white"
  },
  {
    icon: <Music className="w-8 h-8 text-white" />,
    label: "Playlist Músicas",
    bgColor: "bg-red-500"
  },
  {
    icon: <Sparkles className="w-8 h-8 text-black" />,
    label: "SOZO",
    bgColor: "bg-white"
  },
  {
    icon: <PauseCircle className="w-8 h-8 text-white" />,
    label: "Pare por Um",
    bgColor: "bg-green-700"
  }
];

interface AppGridProps {
  onAppStoreOpen?: () => void;
}

export function AppGrid({ onAppStoreOpen }: AppGridProps) {
  const apps: AppItem[] = [
    {
      icon: <ShoppingBag className="w-8 h-8 text-white" />,
      label: "App Store",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-700",
      onClick: onAppStoreOpen
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      label: "Quem Nós Somos",
      bgColor: "bg-yellow-400"
    },
    {
      icon: <Brain className="w-8 h-8 text-black" />,
      label: "Meditação Semanal",
      bgColor: "bg-white"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      label: "Contribua",
      bgColor: "bg-white"
    },
    {
      icon: <UserPlus className="w-8 h-8 text-blue-400" />,
      label: "Faça Parte",
      bgColor: "bg-gray-900"
    },
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      label: "Tema do Ano",
      bgColor: "bg-green-500"
    },
    {
      icon: <Baby className="w-8 h-8 text-black" />,
      label: "Kids",
      bgColor: "bg-white"
    },
    {
      icon: <Book className="w-8 h-8 text-white" />,
      label: "App Bíblia",
      bgColor: "bg-red-700"
    },
    {
      icon: <UsersRound className="w-8 h-8 text-black" />,
      label: "Grupos Pequenos",
      bgColor: "bg-white"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-white" />,
      label: "Grupo WhatsApp",
      bgColor: "bg-green-500"
    },
    {
      icon: <Instagram className="w-8 h-8 text-white" />,
      label: "Insta",
      bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
    },
    {
      icon: <Youtube className="w-8 h-8 text-white" />,
      label: "YouTube",
      bgColor: "bg-red-600"
    },
    {
      icon: <Headphones className="w-8 h-8 text-white" />,
      label: "PodCast",
      bgColor: "bg-orange-500"
    },
    {
      icon: <CalendarDays className="w-8 h-8 text-blue-600" />,
      label: "Agenda da Família",
      bgColor: "bg-white"
    },
    {
      icon: <Music className="w-8 h-8 text-white" />,
      label: "Playlist Músicas",
      bgColor: "bg-red-500"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-black" />,
      label: "SOZO",
      bgColor: "bg-white"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {apps.map((app, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center space-y-2 cursor-pointer"
          onClick={app.onClick}
        >
          <div 
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg
              transition-transform duration-200 hover:scale-105 active:scale-95
              ${app.bgColor}
            `}
          >
            {app.icon}
          </div>
          <span className="text-white text-xs text-center leading-tight">
            {app.label}
          </span>
        </div>
      ))}
    </div>
  );
}