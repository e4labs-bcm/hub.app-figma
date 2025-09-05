import { useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from './useAuth';

interface AuditLogEntry {
  acao: string;
  entidade: string;
  entidade_id?: string;
  detalhes?: any;
  ip_address?: string;
  user_agent?: string;
}

export function useErrorHandler() {
  const { signOut } = useAuth();

  // Função para logar ação no audit log
  const logAction = useCallback(async (entry: AuditLogEntry) => {
    try {
      console.log('Registrando ação no audit log:', entry);

      // Adicionar informações extras
      const enrichedEntry = {
        ...entry,
        ip_address: entry.ip_address || await getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3150113/audit-log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enrichedEntry)
      });

      if (!response.ok) {
        console.error('Erro ao registrar no audit log:', response.status);
      } else {
        console.log('Ação registrada no audit log com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar no audit log:', error);
      // Não propagar erro do audit log para não afetar a operação principal
    }
  }, []);

  // Função para obter IP do cliente
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        return data.ip;
      }
    } catch (error) {
      console.error('Erro ao obter IP:', error);
    }
    return 'unknown';
  };

  // Handler principal de erros
  const handleError = useCallback((error: any, context: string = '') => {
    console.error(`Error in ${context}:`, error);

    // Extrair mensagem do erro
    const message = error?.message || error?.error || error || 'Erro inesperado';

    // Tratar tipos específicos de erro
    if (message.includes('Row Level Security') || message.includes('RLS')) {
      toast.error('Você não tem permissão para esta ação');
      logAction({
        acao: 'ERROR_RLS',
        entidade: 'security',
        detalhes: { context, message }
      });
    } else if (message.includes('JWT expired') || message.includes('expired')) {
      toast.error('Sessão expirada. Você será redirecionado para o login.');
      logAction({
        acao: 'ERROR_JWT_EXPIRED',
        entidade: 'auth',
        detalhes: { context, message }
      });
      // Aguardar um pouco antes de fazer logout para o usuário ler a mensagem
      setTimeout(() => {
        signOut();
      }, 2000);
    } else if (message.includes('Network') || message.includes('fetch')) {
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      logAction({
        acao: 'ERROR_NETWORK',
        entidade: 'network',
        detalhes: { context, message }
      });
    } else if (message.includes('Unauthorized') || message.includes('401')) {
      toast.error('Não autorizado. Faça login novamente.');
      logAction({
        acao: 'ERROR_UNAUTHORIZED',
        entidade: 'auth',
        detalhes: { context, message }
      });
      setTimeout(() => {
        signOut();
      }, 1500);
    } else if (message.includes('Forbidden') || message.includes('403')) {
      toast.error('Acesso negado. Você não tem permissão para esta ação.');
      logAction({
        acao: 'ERROR_FORBIDDEN',
        entidade: 'permission',
        detalhes: { context, message }
      });
    } else if (message.includes('Not Found') || message.includes('404')) {
      toast.error('Recurso não encontrado.');
      logAction({
        acao: 'ERROR_NOT_FOUND',
        entidade: 'resource',
        detalhes: { context, message }
      });
    } else if (message.includes('Server Error') || message.includes('500')) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      logAction({
        acao: 'ERROR_SERVER',
        entidade: 'server',
        detalhes: { context, message }
      });
    } else {
      // Erro genérico
      toast.error(message);
      logAction({
        acao: 'ERROR_GENERIC',
        entidade: 'unknown',
        detalhes: { context, message, errorType: typeof error }
      });
    }
  }, [signOut, logAction]);

  // Handler para erros de validação
  const handleValidationError = useCallback((errors: Record<string, string>) => {
    const errorMessages = Object.values(errors);
    const firstError = errorMessages[0];
    
    toast.error(`Erro de validação: ${firstError}`);
    
    logAction({
      acao: 'ERROR_VALIDATION',
      entidade: 'form',
      detalhes: { errors }
    });
  }, [logAction]);

  // Handler para success com log
  const handleSuccess = useCallback((message: string, action?: string, entity?: string, details?: any) => {
    toast.success(message);
    
    if (action && entity) {
      logAction({
        acao: action,
        entidade: entity,
        entidade_id: details?.id,
        detalhes: details
      });
    }
  }, [logAction]);

  // Handler para warnings
  const handleWarning = useCallback((message: string, action?: string, entity?: string, details?: any) => {
    toast.warning(message);
    
    if (action && entity) {
      logAction({
        acao: action,
        entidade: entity,
        entidade_id: details?.id,
        detalhes: details
      });
    }
  }, [logAction]);

  // Handler para info
  const handleInfo = useCallback((message: string, action?: string, entity?: string, details?: any) => {
    toast.info(message);
    
    if (action && entity) {
      logAction({
        acao: action,
        entidade: entity,
        entidade_id: details?.id,
        detalhes: details
      });
    }
  }, [logAction]);

  return {
    handleError,
    handleValidationError,
    handleSuccess,
    handleWarning,
    handleInfo,
    logAction
  };
}