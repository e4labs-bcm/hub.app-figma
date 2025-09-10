import { motion } from "framer-motion";
import { Bot, Home, Settings, Store, X, Minus } from "lucide-react";
import { Button } from "../../../src/components/ui/button";

interface ContextualHeaderProps {
  currentModule?: string;
  currentPage?: string;
  onClose: () => void;
  onMinimize?: () => void;
  isMobile?: boolean;
}

export function ContextualHeader({
  currentModule,
  currentPage,
  onClose,
  onMinimize,
  isMobile = false,
}: ContextualHeaderProps) {
  const getModuleIcon = (module?: string) => {
    switch (module) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'store':
        return <Store className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getContextInfo = () => {
    if (currentModule && currentPage) {
      return `${currentModule} • ${currentPage}`;
    }
    if (currentModule) {
      return currentModule;
    }
    if (currentPage) {
      return currentPage;
    }
    return 'Assistente de IA';
  };

  const getContextDescription = () => {
    if (currentModule) {
      return `Estou aqui para ajudar com ${currentModule.toLowerCase()}`;
    }
    return 'Como posso ajudá-lo hoje?';
  };

  return (
    <motion.div
      className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {/* Context Icon */}
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          {getModuleIcon(currentModule)}
        </div>

        {/* Context Info */}
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-foreground">
            {getContextInfo()}
          </h3>
          <p className="text-xs text-muted-foreground">
            {getContextDescription()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Minimize button */}
        {onMinimize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-8 w-8 p-0"
            title="Minimizar"
          >
            <Minus className="w-4 h-4" />
          </Button>
        )}
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}