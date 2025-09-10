import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent } from '../../../src/components/ui/card';

interface QuotaExhaustedMessageProps {
  onRetry?: () => void;
  quotaResetTime?: Date;
}

export function QuotaExhaustedMessage({ onRetry, quotaResetTime }: QuotaExhaustedMessageProps) {
  const getTimeUntilReset = () => {
    if (!quotaResetTime) return 'em algumas horas';
    
    const now = new Date();
    const diff = quotaResetTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'agora';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `em ${hours}h ${minutes}m`;
    } else {
      return `em ${minutes} minutos`;
    }
  };

  return (
    <Card className="mx-4 my-2 border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">
              Limite de uso atingido
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              O limite gratuito da IA foi temporariamente atingido. 
              Você ainda pode navegar pelos módulos do Hub.App normalmente.
            </p>
            
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center text-xs text-amber-600">
                <Clock className="h-4 w-4 mr-1" />
                Reset {getTimeUntilReset()}
              </div>
              
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRetry}
                  className="h-8 px-3 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Tentar novamente
                </Button>
              )}
            </div>
            
            <div className="mt-3 text-xs text-amber-600">
              <strong>Dica:</strong> Você pode usar os módulos CRM, Multifins e Agenda 
              diretamente pelos ícones do Hub.App.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}