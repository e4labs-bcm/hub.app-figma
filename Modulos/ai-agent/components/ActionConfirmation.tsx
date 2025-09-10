import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Play, Edit, Trash2, Navigation, Search } from "lucide-react";
import { ActionPreview } from "../types/ai.types";
import { Button } from "../../../src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../src/components/ui/card";

interface ActionConfirmationProps {
  actions: ActionPreview[];
  onExecute?: (actionId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function ActionConfirmation({
  actions,
  onExecute,
  onCancel,
  className = "",
}: ActionConfirmationProps) {
  const getActionIcon = (type: ActionPreview['type']) => {
    switch (type) {
      case 'create':
        return <Play className="w-4 h-4" />;
      case 'update':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'navigation':
        return <Navigation className="w-4 h-4" />;
      case 'query':
        return <Search className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getActionColor = (type: ActionPreview['type']) => {
    switch (type) {
      case 'create':
        return 'text-green-600 bg-green-50 hover:bg-green-100';
      case 'update':
        return 'text-blue-600 bg-blue-50 hover:bg-blue-100';
      case 'delete':
        return 'text-red-600 bg-red-50 hover:bg-red-100';
      case 'navigation':
        return 'text-purple-600 bg-purple-50 hover:bg-purple-100';
      case 'query':
        return 'text-orange-600 bg-orange-50 hover:bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-50 hover:bg-gray-100';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`w-full ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ações Disponíveis</CardTitle>
            <CardDescription className="text-xs">
              Selecione uma ação para executar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {actions.map((action) => (
              <motion.div
                key={action.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded ${getActionColor(action.type)}`}>
                    {getActionIcon(action.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {action.module && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {action.module}
                        </span>
                      )}
                      {action.confidence && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          action.confidence >= 0.8 
                            ? 'bg-green-100 text-green-700' 
                            : action.confidence >= 0.6 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(action.confidence * 100)}% confiança
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {action.requiresConfirmation ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCancel?.()}
                        className="h-8"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onExecute?.(action.id)}
                        className="h-8"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Executar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onExecute?.(action.id)}
                      className="h-8"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Executar
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}