import { LLMProvider, AIInput, AIResponse, ProviderType, LLMConfig } from './types';
import { GeminiProvider } from './providers/GeminiProvider';

interface ProviderInstance {
  provider: LLMProvider;
  priority: number;
  isHealthy: boolean;
  lastError?: Date;
  lastHealthCheck?: Date;
  quotaExhausted?: boolean;
  quotaResetTime?: Date;
}

export class LLMRouter {
  private providers: Map<ProviderType, ProviderInstance> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private static instance: LLMRouter | null = null;
  
  constructor() {
    // Singleton pattern to avoid multiple health check intervals
    if (LLMRouter.instance) {
      return LLMRouter.instance;
    }
    
    this.initializeProviders();
    this.startHealthChecks();
    LLMRouter.instance = this;
  }

  private initializeProviders() {
    // Obter chaves disponíveis
    const apiKeys = this.getAvailableApiKeys();
    
    if (apiKeys.length === 0) {
      console.error('❌ Nenhuma chave API encontrada!');
      return;
    }
    
    // Usar primeira chave disponível
    const primaryKey = apiKeys[0];
    
    const geminiProvider = new GeminiProvider({
      provider: 'gemini',
      apiKey: primaryKey,
      model: 'gemini-1.5-flash',
    });

    this.providers.set('gemini', {
      provider: geminiProvider,
      priority: 1,
      isHealthy: true,
    });
    
    // Gemini provider ready
    
    // TODO: Implementar rotação completa depois que o básico funcionar
    // Por enquanto, usar apenas a chave primária
  }
  
  private getAvailableApiKeys(): string[] {
    const keys = [];
    
    // Priorizar KEY_2 (nova) primeiro
    const key2 = import.meta.env.VITE_GEMINI_API_KEY_2;
    const key1 = import.meta.env.VITE_GEMINI_API_KEY_1;
    const keyDefault = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Ordem de prioridade: KEY_2, KEY_1, DEFAULT
    if (key2) keys.push(key2);
    if (key1 && key1 !== key2) keys.push(key1);
    if (keys.length === 0 && keyDefault) keys.push(keyDefault);
    
    return [...new Set(keys)];
  }

  async processMessage(input: AIInput): Promise<AIResponse> {
    const routedProvider = this.selectProvider(input);
    
    if (!routedProvider) {
      return {
        message: 'Desculpe, nenhum provedor de IA está disponível no momento. Tente novamente em alguns instantes.',
        error: 'No available providers',
      };
    }

    try {
      console.log(`🤖 Routing to provider: ${routedProvider.provider.name}`);
      const response = await routedProvider.provider.processMessage(input);
      
      // Marcar provider como saudável após sucesso
      routedProvider.isHealthy = true;
      routedProvider.lastError = undefined;
      
      return response;
    } catch (error) {
      console.error(`❌ Provider ${routedProvider.provider.name} failed:`, error);
      
      // Verificar se é erro de quota
      if (error instanceof Error && error.message.includes('quota')) {
        routedProvider.quotaExhausted = true;
        routedProvider.quotaResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Reset em 24h
        console.log(`🚫 Provider ${routedProvider.provider.name} quota exhausted, trying fallback`);
      } else {
        routedProvider.isHealthy = false;
      }
      
      routedProvider.lastError = new Date();
      
      // Tentar fallback local quando provider falha
      return this.tryFallback(input, routedProvider.provider.name as ProviderType);
    }
  }

  private selectProvider(input: AIInput): ProviderInstance | null {
    // Estratégia de roteamento inteligente baseada no tipo de tarefa
    const taskType = this.analyzeTaskType(input);
    
    // Obter providers disponíveis e saudáveis (considerar quota)
    const availableProviders = Array.from(this.providers.values())
      .filter(p => {
        const isAvailable = p.provider.isAvailable && p.isHealthy;
        const quotaOk = !p.quotaExhausted || (p.quotaResetTime && p.quotaResetTime < new Date());
        return isAvailable && quotaOk;
      })
      .sort((a, b) => a.priority - b.priority);

    if (availableProviders.length === 0) {
      return null;
    }

    // Por enquanto, usar sempre o primeiro disponível (Gemini)
    // TODO: Implementar lógica mais sofisticada baseada no tipo de tarefa
    switch (taskType) {
      case 'simple_query':
      case 'create_action':
      case 'update_action':
      case 'pdf_processing':
      default:
        return availableProviders[0];
    }
  }

  private analyzeTaskType(input: AIInput): string {
    const message = input.message.toLowerCase();
    
    if (message.includes('pdf') || message.includes('documento') || input.files?.length) {
      return 'pdf_processing';
    }
    
    if (message.includes('criar') || message.includes('adicionar')) {
      return 'create_action';
    }
    
    if (message.includes('editar') || message.includes('atualizar')) {
      return 'update_action';
    }
    
    if (message.includes('relatório') || message.includes('buscar')) {
      return 'complex_query';
    }
    
    return 'simple_query';
  }

  private async tryFallback(input: AIInput, failedProvider: ProviderType): Promise<AIResponse> {
    console.log(`🔄 Attempting fallback from ${failedProvider}`);
    
    const fallbackProviders = Array.from(this.providers.values())
      .filter(p => 
        p.provider.name !== failedProvider && 
        p.provider.isAvailable && 
        p.isHealthy
      )
      .sort((a, b) => a.priority - b.priority);

    for (const provider of fallbackProviders) {
      try {
        console.log(`🔄 Trying fallback provider: ${provider.provider.name}`);
        const response = await provider.provider.processMessage(input);
        
        // Adicionar metadata sobre fallback
        if (response.metadata) {
          response.metadata.fallbackFrom = failedProvider;
        }
        
        return response;
      } catch (error) {
        console.error(`❌ Fallback provider ${provider.provider.name} also failed:`, error);
        provider.isHealthy = false;
        provider.lastError = new Date();
      }
    }

      // Se todos os fallbacks falharam, retornar resposta de fallback local
    return this.getFallbackResponse(input);
  }
  
  private getFallbackResponse(input: AIInput): AIResponse {
    // Resposta de fallback baseada em análise local simples
    const message = input.message.toLowerCase();
    
    if (message.includes('cliente') || message.includes('crm')) {
      return {
        message: 'Posso ajudar você com gerenciamento de clientes. Para criar um novo cliente, vá até o módulo CRM e clique em "Novo Cliente".',
        actions: [{
          id: crypto.randomUUID(),
          type: 'navigation',
          title: 'Ir para CRM',
          description: 'Navegar para o módulo de CRM',
          module: 'crm',
          requiresConfirmation: false,
          confidence: 0.8,
          data: { type: 'navigation', action: 'navigate', target: 'crm' }
        }],
        metadata: { provider: 'fallback', tokensUsed: 0, costCents: 0, processingTime: 50 }
      };
    }
    
    if (message.includes('receita') || message.includes('financeiro')) {
      return {
        message: 'Para gerenciar suas receitas e finanças, acesse o módulo Multifins onde você pode lançar receitas, despesas e gerar relatórios.',
        actions: [{
          id: crypto.randomUUID(),
          type: 'navigation', 
          title: 'Ir para Multifins',
          description: 'Navegar para o módulo financeiro',
          module: 'multifins',
          requiresConfirmation: false,
          confidence: 0.8,
          data: { type: 'navigation', action: 'navigate', target: 'multifins' }
        }],
        metadata: { provider: 'fallback', tokensUsed: 0, costCents: 0, processingTime: 50 }
      };
    }
    
    return {
      message: 'Os serviços de IA estão temporariamente indisponíveis por limite de quota. Você pode navegar pelos módulos do Hub.App manualmente ou tentar novamente mais tarde.',
      error: 'Quota exhausted - fallback response',
      metadata: { provider: 'fallback', tokensUsed: 0, costCents: 0, processingTime: 50 }
    };
  }

  private startHealthChecks() {
    // Verificar saúde dos providers a cada 30 minutos (reduzido para economizar quota)
    this.healthCheckInterval = setInterval(async () => {
      console.log('🏥 Starting periodic provider health checks...');
      
      for (const [providerType, instance] of this.providers.entries()) {
        // Pular health check se quota exaurida e ainda não resetou
        if (instance.quotaExhausted && instance.quotaResetTime && instance.quotaResetTime > new Date()) {
          console.log(`⏳ Skipping health check for ${providerType} - quota reset at ${instance.quotaResetTime.toLocaleTimeString()}`);
          continue;
        }
        
        // Só fazer health check se passou tempo suficiente desde o último
        const timeSinceLastCheck = instance.lastHealthCheck ? Date.now() - instance.lastHealthCheck.getTime() : Infinity;
        if (timeSinceLastCheck < 10 * 60 * 1000) { // 10 minutos mínimo
          continue;
        }
        
        try {
          // Reset quota status se passou o tempo
          if (instance.quotaExhausted && instance.quotaResetTime && instance.quotaResetTime <= new Date()) {
            instance.quotaExhausted = false;
            instance.quotaResetTime = undefined;
            console.log(`🔄 Quota reset for ${providerType}`);
          }
          
          const isHealthy = await instance.provider.validateConnection();
          instance.isHealthy = isHealthy;
          instance.lastHealthCheck = new Date();
          
          if (isHealthy && instance.lastError) {
            console.log(`✅ Provider ${providerType} recovered`);
            instance.lastError = undefined;
          }
        } catch (error) {
          console.error(`❌ Health check failed for ${providerType}:`, error);
          
          if (error instanceof Error && error.message.includes('quota')) {
            instance.quotaExhausted = true;
            instance.quotaResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
          } else {
            instance.isHealthy = false;
          }
          
          instance.lastError = new Date();
          instance.lastHealthCheck = new Date();
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Método para rotacionar para próxima chave API quando quota esgotar
  private rotateToNextProvider(failedProvider: ProviderType) {
    console.log(`🔄 Provider ${failedProvider} falhou - implementar rotação futura`);
    // Por enquanto, retornar null para usar fallback local
    return null;
  }

  // Método para adicionar novos providers dinamicamente
  addProvider(type: ProviderType, config: LLMConfig, priority: number = 10) {
    let provider: LLMProvider;
    
    switch (type) {
      case 'gemini':
        provider = new GeminiProvider(config);
        break;
      // TODO: Adicionar outros providers
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }

    this.providers.set(type, {
      provider,
      priority,
      isHealthy: true,
    });
  }

  // Método para obter status de todos os providers
  getProvidersStatus() {
    const status: Record<string, any> = {};
    
    for (const [type, instance] of this.providers.entries()) {
      status[type] = {
        name: instance.provider.name,
        isAvailable: instance.provider.isAvailable,
        isHealthy: instance.isHealthy,
        priority: instance.priority,
        lastError: instance.lastError?.toISOString(),
      };
    }
    
    return status;
  }

  // Cleanup ao destruir o router
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}