// ============================================
// ARQUITETURA FLEXÍVEL MULTI-LLM
// ============================================

// 1. INTERFACE COMUM - BASE DE TUDO
interface LLMProvider {
  name: string;
  processMessage(input: AIInput): Promise<AIResponse>;
  validateConnection(): Promise<boolean>;
  getCost(tokens: number): number;
  getQuotaStatus(): Promise<QuotaStatus>;
}

interface AIInput {
  message: string;
  context: ModuleContext;
  userId: string;
  tenantId: string;
  availableActions: Action[];
}

interface AIResponse {
  message: string;
  action?: {
    actionId: string;
    parameters: Record<string, any>;
    confidence: number;
  };
  provider: string;
  tokensUsed: number;
  cost: number;
}

interface QuotaStatus {
  remaining: number;
  resetTime: Date;
  isNearLimit: boolean;
}

// ============================================
// 2. IMPLEMENTAÇÃO GEMINI (STARTER)
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider implements LLMProvider {
  name = "gemini";
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 1000,
      }
    });
  }

  async processMessage(input: AIInput): Promise<AIResponse> {
    const prompt = this.buildStructuredPrompt(input);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Parse manual da resposta (sem function calling nativo)
      const parsed = this.parseGeminiResponse(response, input.availableActions);
      
      return {
        message: parsed.message,
        action: parsed.action,
        provider: this.name,
        tokensUsed: this.estimateTokens(prompt + response),
        cost: this.getCost(this.estimateTokens(prompt + response))
      };
    } catch (error) {
      throw new Error(`Gemini error: ${error.message}`);
    }
  }

  private buildStructuredPrompt(input: AIInput): string {
    return `
Você é o assistente IA do Hub.App para ${input.context.moduleId || 'hub geral'}.

CONTEXTO:
- Módulo atual: ${input.context.moduleId}
- Ações disponíveis: ${JSON.stringify(input.availableActions.map(a => ({
  id: a.actionId, 
  description: a.description_for_ai,
  parameters: Object.keys(a.parameters_schema.properties || {})
})))}

MENSAGEM DO USUÁRIO: "${input.message}"

INSTRUÇÕES:
1. Se a mensagem solicita uma AÇÃO, responda com JSON:
{
  "type": "action",
  "message": "Mensagem amigável confirmando a ação",
  "action": {
    "actionId": "id_da_acao",
    "parameters": {"param1": "valor1", "param2": "valor2"},
    "confidence": 0.95
  }
}

2. Se é apenas uma CONSULTA, responda com JSON:
{
  "type": "query", 
  "message": "Resposta informativa ao usuário"
}

3. Se NÃO ENTENDER, responda:
{
  "type": "clarification",
  "message": "Preciso de mais informações. Você pode especificar..."
}

RESPONDA APENAS COM JSON VÁLIDO:`;
  }

  private parseGeminiResponse(response: string, availableActions: Action[]): any {
    try {
      // Limpar possível markdown
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      if (parsed.type === 'action' && parsed.action) {
        // Validar se a ação existe
        const actionExists = availableActions.find(a => a.actionId === parsed.action.actionId);
        if (!actionExists) {
          return {
            message: "Desculpe, essa ação não está disponível neste módulo.",
            action: null
          };
        }
        
        // Validar parâmetros básicos
        const validatedParams = this.validateParameters(
          parsed.action.parameters, 
          actionExists.parameters_schema
        );
        
        return {
          message: parsed.message,
          action: {
            actionId: parsed.action.actionId,
            parameters: validatedParams,
            confidence: parsed.action.confidence || 0.8
          }
        };
      }
      
      return {
        message: parsed.message,
        action: null
      };
    } catch (error) {
      // Fallback para parsing simples se JSON falhar
      return {
        message: "Entendi sua mensagem, mas preciso de mais informações para executar uma ação específica.",
        action: null
      };
    }
  }

  private validateParameters(params: any, schema: any): any {
    // Validação básica de tipos e campos obrigatórios
    const validated: any = {};
    const properties = schema.properties || {};
    const required = schema.required || [];
    
    for (const [key, value] of Object.entries(params)) {
      if (properties[key]) {
        // Validação de tipo simples
        const expectedType = properties[key].type;
        if (expectedType === 'number' && typeof value === 'string') {
          validated[key] = parseFloat(value as string);
        } else {
          validated[key] = value;
        }
      }
    }
    
    return validated;
  }

  async validateConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Test connection");
      return result.response.text().length > 0;
    } catch {
      return false;
    }
  }

  getCost(tokens: number): number {
    // Gemini pricing (input + output)
    return (tokens * 0.075) / 1000000; // $0.075 per 1M tokens
  }

  async getQuotaStatus(): Promise<QuotaStatus> {
    // Gemini free tier: 1M tokens/day, 15 requests/minute
    return {
      remaining: 1000000, // Seria obtido via API de quota
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isNearLimit: false
    };
  }

  private estimateTokens(text: string): number {
    // Estimativa simples: ~4 chars = 1 token
    return Math.ceil(text.length / 4);
  }
}

// ============================================
// 3. IMPLEMENTAÇÃO OPENAI (FUTURO)
// ============================================

import OpenAI from "openai";

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async processMessage(input: AIInput): Promise<AIResponse> {
    const tools = this.buildOpenAITools(input.availableActions);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é o assistente IA do Hub.App para ${input.context.moduleId || 'hub geral'}.`
          },
          {
            role: "user", 
            content: input.message
          }
        ],
        tools,
        tool_choice: "auto",
        temperature: 0.1
      });

      const response = completion.choices[0];
      const usage = completion.usage;

      if (response.message.tool_calls?.length > 0) {
        const toolCall = response.message.tool_calls[0];
        return {
          message: `Executando: ${toolCall.function.name}`,
          action: {
            actionId: toolCall.function.name,
            parameters: JSON.parse(toolCall.function.arguments),
            confidence: 0.95
          },
          provider: this.name,
          tokensUsed: usage?.total_tokens || 0,
          cost: this.getCost(usage?.total_tokens || 0)
        };
      }

      return {
        message: response.message.content || "Não consegui processar sua solicitação.",
        provider: this.name,
        tokensUsed: usage?.total_tokens || 0,
        cost: this.getCost(usage?.total_tokens || 0)
      };
    } catch (error) {
      throw new Error(`OpenAI error: ${error.message}`);
    }
  }

  private buildOpenAITools(actions: Action[]): any[] {
    return actions.map(action => ({
      type: "function",
      function: {
        name: action.actionId,
        description: action.description_for_ai,
        parameters: action.parameters_schema
      }
    }));
  }

  async validateConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  getCost(tokens: number): number {
    // GPT-4o-mini pricing
    return (tokens * 0.15) / 1000000; // $0.15 per 1M tokens
  }

  async getQuotaStatus(): Promise<QuotaStatus> {
    // OpenAI não tem limite gratuito, sempre pago
    return {
      remaining: Infinity,
      resetTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isNearLimit: false
    };
  }
}

// ============================================
// 4. MANAGER INTELIGENTE (CORE DO SISTEMA)
// ============================================

export class AIProviderManager {
  private providers: Map<string, LLMProvider> = new Map();
  private primaryProvider: string;
  private fallbackProviders: string[] = [];
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Gemini como primary (gratuito)
    if (this.config.gemini?.apiKey) {
      const gemini = new GeminiProvider(this.config.gemini.apiKey);
      this.providers.set("gemini", gemini);
      this.primaryProvider = "gemini";
    }

    // OpenAI como fallback (futuro)
    if (this.config.openai?.apiKey) {
      const openai = new OpenAIProvider(this.config.openai.apiKey);
      this.providers.set("openai", openai);
      this.fallbackProviders.push("openai");
    }
  }

  async processMessage(input: AIInput): Promise<AIResponse> {
    // 1. Tentar provider primário
    try {
      const primaryProvider = this.providers.get(this.primaryProvider);
      if (primaryProvider) {
        // Verificar quota antes
        const quota = await primaryProvider.getQuotaStatus();
        if (!quota.isNearLimit) {
          return await primaryProvider.processMessage(input);
        }
      }
    } catch (error) {
      console.warn(`Primary provider ${this.primaryProvider} failed:`, error.message);
    }

    // 2. Tentar fallbacks
    for (const fallbackName of this.fallbackProviders) {
      try {
        const fallback = this.providers.get(fallbackName);
        if (fallback) {
          console.info(`Using fallback provider: ${fallbackName}`);
          return await fallback.processMessage(input);
        }
      } catch (error) {
        console.warn(`Fallback provider ${fallbackName} failed:`, error.message);
      }
    }

    throw new Error("All AI providers failed");
  }

  // MÉTODO PARA ESTRATÉGIA HÍBRIDA INTELIGENTE
  async processMessageSmart(input: AIInput): Promise<AIResponse> {
    const strategy = this.determineStrategy(input);
    
    switch (strategy) {
      case 'simple_query':
        // Queries simples -> Gemini (mais barato)
        return this.processWithProvider(input, 'gemini');
        
      case 'complex_action':
        // Ações complexas -> OpenAI (mais confiável)
        return this.processWithProvider(input, 'openai');
        
      case 'pdf_processing':
        // PDFs -> Gemini (context longo)
        return this.processWithProvider(input, 'gemini');
        
      default:
        return this.processMessage(input); // Fallback normal
    }
  }

  private determineStrategy(input: AIInput): string {
    const message = input.message.toLowerCase();
    
    // Patterns para classificar tipos de request
    if (/^(mostrar|ver|listar|consultar|qual|quanto)/.test(message)) {
      return 'simple_query';
    }
    
    if (/pdf|extrato|arquivo|documento/.test(message)) {
      return 'pdf_processing';
    }
    
    if (/criar|adicionar|cadastrar|agendar|marcar/.test(message)) {
      return 'complex_action';
    }
    
    return 'auto';
  }

  private async processWithProvider(input: AIInput, providerName: string): Promise<AIResponse> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not available`);
    }
    
    try {
      return await provider.processMessage(input);
    } catch (error) {
      // Fallback para primary se específico falhar
      return this.processMessage(input);
    }
  }

  // MIGRAÇÃO FÁCIL DE PROVIDERS
  async migrateProvider(newPrimary: string): Promise<boolean> {
    const newProvider = this.providers.get(newPrimary);
    if (!newProvider) {
      throw new Error(`Provider ${newPrimary} not configured`);
    }

    const isValid = await newProvider.validateConnection();
    if (isValid) {
      this.primaryProvider = newPrimary;
      console.info(`Migrated to primary provider: ${newPrimary}`);
      return true;
    }
    
    return false;
  }

  // ADICIONAR NOVO PROVIDER DINAMICAMENTE
  addProvider(name: string, provider: LLMProvider) {
    this.providers.set(name, provider);
    if (!this.primaryProvider) {
      this.primaryProvider = name;
    } else {
      this.fallbackProviders.push(name);
    }
  }

  // MONITORAMENTO E ESTATÍSTICAS
  async getProvidersStatus(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];
    
    for (const [name, provider] of this.providers) {
      const isConnected = await provider.validateConnection();
      const quota = await provider.getQuotaStatus();
      
      statuses.push({
        name,
        isConnected,
        quota,
        isPrimary: name === this.primaryProvider,
        isFallback: this.fallbackProviders.includes(name)
      });
    }
    
    return statuses;
  }
}

// ============================================
// 5. CONFIGURAÇÃO E TIPOS
// ============================================

interface AIConfig {
  gemini?: {
    apiKey: string;
    model?: string;
  };
  openai?: {
    apiKey: string;
    model?: string;
  };
  claude?: {
    apiKey: string;
    model?: string;
  };
}

interface ProviderStatus {
  name: string;
  isConnected: boolean;
  quota: QuotaStatus;
  isPrimary: boolean;
  isFallback: boolean;
}

interface Action {
  actionId: string;
  description_for_ai: string;
  parameters_schema: any;
  requires_confirmation: boolean;
}

interface ModuleContext {
  moduleId: string;
  currentPath: string;
  availableData?: any;
}

// ============================================
// 6. SETUP INICIAL (GEMINI ONLY)
// ============================================

export function createAIService(): AIProviderManager {
  const config: AIConfig = {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
      model: "gemini-1.5-flash"
    }
    // OpenAI será adicionado depois:
    // openai: {
    //   apiKey: process.env.OPENAI_API_KEY!,
    //   model: "gpt-4o-mini"
    // }
  };

  return new AIProviderManager(config);
}

// ============================================
// 7. EXEMPLO DE USO
// ============================================

/*
// Início: Só Gemini (gratuito)
const aiService = createAIService();

// Depois: Adicionar OpenAI facilmente
aiService.addProvider("openai", new OpenAIProvider(process.env.OPENAI_API_KEY!));

// Migrar para OpenAI como primary
await aiService.migrateProvider("openai");

// Ou usar estratégia híbrida inteligente
const response = await aiService.processMessageSmart(input);
*/