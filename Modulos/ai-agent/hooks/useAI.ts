import { useCallback, useRef } from 'react';
import { AIResponse, Message, ActionPreview } from '../types/ai.types';
import { LLMRouter } from '../services/llm/LLMRouter';
import { AIInput } from '../services/llm/types';
import { useAuth } from '../../../src/hooks/useAuth';

interface ProcessMessageOptions {
  context?: {
    module?: string;
    page?: string;
    data?: Record<string, any>;
  };
  files?: File[];
  history?: Message[];
}

export function useAI() {
  const llmRouter = useRef<LLMRouter>();
  const { user } = useAuth();
  
  // Lazy initialization com logs de debug
  if (!llmRouter.current) {
    console.log('🔧 Inicializando LLMRouter...');
    try {
      llmRouter.current = new LLMRouter();
      console.log('✅ LLMRouter inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar LLMRouter:', error);
    }
  }

  const processMessage = useCallback(async (
    message: string,
    options: ProcessMessageOptions = {}
  ): Promise<AIResponse> => {
    try {
      // Obter contexto real de autenticação
      const tenantId = user?.tenant_id || 'anonymous';
      const userId = user?.id || 'anonymous';

      console.log('🤖 Processing message with real auth context:', {
        message: message.substring(0, 50) + '...',
        tenantId: tenantId.substring(0, 8) + '...',
        userId: userId.substring(0, 8) + '...',
        module: options.context?.module
      });

      // Preparar input para o LLM Router
      const aiInput: AIInput = {
        message,
        context: options.context,
        files: options.files,
        history: options.history?.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        tenantId,
        userId,
      };

      // Verificar se o router está disponível
      if (!llmRouter.current) {
        throw new Error('LLM Router não inicializado');
      }
      
      // Processar através do LLM Router com Gemini real
      console.log('🚀 Calling LLM Router with Gemini provider...');
      const response = await llmRouter.current.processMessage(aiInput);
      
      console.log('✅ Gemini AI Response received:', {
        message: response.message.substring(0, 100) + '...',
        actionsCount: response.actions?.length || 0,
        provider: response.metadata?.provider,
        tokensUsed: response.metadata?.tokensUsed,
        processingTime: response.metadata?.processingTime + 'ms'
      });
      
      return response;
      
    } catch (error) {
      console.error('❌ Error processing message with Gemini:', error);
      
      // Erro mais específico baseado no tipo
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Erro de configuração da IA. Contacte o suporte.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = 'Limite de uso da IA temporariamente atingido. Tente novamente em alguns minutos.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
      }
      
      return {
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: {
          processedAt: new Date().toISOString(),
          module: options.context?.module,
          actionCount: 0,
        },
        metadata: {
          provider: 'error',
          tokensUsed: 0,
          costCents: 0,
          processingTime: 0
        }
      };
    }
  }, [user]);

  const generateSuggestions = useCallback((context?: string): string[] => {
    const baseSuggestions = [
      '💡 Como funciona o Hub.App?',
      '📊 Mostrar relatório geral',
      '🚀 Quais funcionalidades posso usar?',
    ];

    const contextSuggestions: Record<string, string[]> = {
      'crm': [
        '👤 Criar novo cliente',
        '🔍 Buscar clientes inativos',
        '📈 Relatório de leads do mês',
      ],
      'multifins': [
        '💰 Lançar uma receita',
        '📊 Relatório financeiro',
        '💸 Adicionar despesa',
      ],
      'agenda': [
        '📅 Agendar um compromisso',
        '🕒 Ver horários livres hoje',
        '📋 Compromissos da semana',
      ],
      'home': [
        '📈 Resumo geral da empresa',
        '🎯 Ir para módulo específico',
        '⚙️ Configurar notificações',
      ]
    };

    return context && contextSuggestions[context] 
      ? contextSuggestions[context] 
      : baseSuggestions;
  }, []);

  return {
    processMessage,
    generateSuggestions,
  };
}