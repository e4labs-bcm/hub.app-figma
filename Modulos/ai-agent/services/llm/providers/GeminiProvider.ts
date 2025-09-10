import { LLMProvider, AIInput, AIResponse, QuotaStatus, LLMConfig, ActionPreview } from '../types';

interface CachedResponse {
  response: AIResponse;
  timestamp: Date;
}

export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  public isAvailable = true;
  
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private lastValidation: Date | null = null;
  private validationCache: boolean = true;
  private validationCacheTTL = 10 * 60 * 1000; // 10 minutes
  private responseCache = new Map<string, CachedResponse>();
  private responseCacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gemini-1.5-flash';
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  async processMessage(input: AIInput): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      // Gerar chave de cache baseada na mensagem e contexto
      const cacheKey = this.generateCacheKey(input);
      
      // 1. Verificar respostas locais primeiro (sem usar API)
      const localResponse = this.getLocalResponse(input);
      if (localResponse) {
        console.log('⚡ Resposta local rápida - sem usar tokens');
        return localResponse;
      }
      
      // 2. Verificar cache
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('💾 Cache hit - usando resposta cacheada');
        return cachedResponse;
      }
      
      // Anonimizar dados sensíveis antes de enviar para o Gemini
      const sanitizedInput = this.sanitizeInput(input);
      
      // Construir prompt contextual ultra compacto
      const prompt = this.buildPrompt(sanitizedInput);
      
      // Chamar Gemini API
      const response = await this.callGeminiAPI(prompt, sanitizedInput);
      
      // Processar resposta e extrair ações
      const { message, actions } = this.parseResponse(response, input.context);
      
      const processingTime = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + response);
      
      const finalResponse = {
        message,
        actions,
        context: {
          processedAt: new Date().toISOString(),
          module: input.context?.module,
          actionCount: actions?.length || 0,
        },
        metadata: {
          provider: this.name,
          tokensUsed,
          costCents: this.getCost(tokensUsed),
          processingTime,
        },
      };
      
      // Cachear a resposta
      this.cacheResponse(this.generateCacheKey(input), finalResponse);
      
      return finalResponse;
    } catch (error) {
      console.error('Gemini Provider Error:', error);
      return {
        message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          provider: this.name,
          tokensUsed: 0,
          costCents: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  async validateConnection(): Promise<boolean> {
    // Usar cache se ainda válido para economizar quota
    if (this.lastValidation && (Date.now() - this.lastValidation.getTime()) < this.validationCacheTTL) {
      console.log('🔄 Using cached validation result for Gemini');
      return this.validationCache;
    }
    
    try {
      // Fazer uma chamada simples para testar a conexão
      const testPrompt = 'OK';
      await this.callGeminiAPI(testPrompt, { message: 'test', tenantId: 'test', userId: 'test' });
      
      this.validationCache = true;
      this.lastValidation = new Date();
      this.isAvailable = true;
      return true;
    } catch (error) {
      console.error('Gemini connection validation failed:', error);
      
      // Se for erro de quota, manter disponibilidade mas marcar como temporariamente indisponível
      if (error instanceof Error && error.message.includes('quota')) {
        this.validationCache = false; // Temporariamente indisponível
        this.isAvailable = true; // Mas ainda configurado corretamente
      } else {
        this.validationCache = false;
        this.isAvailable = false;
      }
      
      this.lastValidation = new Date();
      return false;
    }
  }

  getCost(tokens: number): number {
    // Gemini 1.5 Flash é gratuito até 1M tokens/dia
    // Retorna 0 para tier gratuito
    return 0;
  }

  async getQuotaStatus(): Promise<QuotaStatus> {
    // Para tier gratuito do Gemini - valores mais conservadores baseado no erro real
    return {
      requestsUsed: 45, // Assumindo próximo do limite baseado no erro 429
      requestsLimit: 50, // 50 requests por dia no tier gratuito
      tokensUsed: 0,
      tokensLimit: 1000000, // 1M tokens por dia
      resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // próximas 24h
    };
  }

  private sanitizeInput(input: AIInput): AIInput {
    // Anonimizar dados sensíveis conforme LGPD
    const sanitized = { ...input };
    
    // Substituir nomes por tokens
    sanitized.message = input.message
      .replace(/\b[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-záàâãéêíóôõúç]+\b/g, 'CLIENTE_XXX')
      .replace(/\bR\$\s*[\d.,]+/g, 'VALOR_XXX')
      .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, 'DATA_XXX');
    
    // Anonimizar contexto se necessário
    if (sanitized.context?.data) {
      sanitized.context.data = this.anonimizeData(sanitized.context.data);
    }
    
    return sanitized;
  }

  private anonimizeData(data: Record<string, any>): Record<string, any> {
    const anonimized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        if (key.includes('nome') || key.includes('name')) {
          anonimized[key] = 'NOME_ANONIMO';
        } else if (key.includes('valor') || key.includes('price')) {
          anonimized[key] = 'VALOR_ANONIMO';
        } else {
          anonimized[key] = value;
        }
      } else {
        anonimized[key] = value;
      }
    }
    
    return anonimized;
  }

  private buildPrompt(input: AIInput): string {
    // Prompt ultra compacto para economizar tokens
    const module = input.context?.module || 'home';
    
    return `Hub.App AI (português): ${module === 'crm' ? 'CRM' : module === 'multifins' ? 'Financeiro' : module === 'agenda' ? 'Agenda' : 'Principal'}

Usuário: "${input.message}"

Responda em 1-2 frases. Se puder ajudar com ação, termine com "AÇÃO_SUGERIDA: [create-cliente|create-receita|create-agendamento|query-relatorio]"`;
  }

  private async callGeminiAPI(prompt: string, input: AIInput): Promise<string> {
    const apiKey = this.apiKey;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;
    
    try {
      console.log('🤖 Calling Gemini API with model:', this.model);
      
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100, // Reduzir drasticamente
          topP: 0.9,
          topK: 20
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      console.log('📤 Sending request to Gemini:', { url, prompt: prompt.substring(0, 100) + '...' });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Gemini API response:', data);

      // Extract text from Gemini response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const content = data.candidates[0].content;
        if (content.parts && content.parts[0] && content.parts[0].text) {
          const responseText = content.parts[0].text;
          console.log('✅ Gemini response text:', responseText);
          return responseText;
        }
      }

      // Fallback if response format is unexpected
      console.warn('⚠️ Unexpected Gemini response format:', data);
      return 'Desculpe, recebi uma resposta inesperada da IA. Tente reformular sua pergunta.';

    } catch (error) {
      console.error('💥 Error calling Gemini API:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Configuração de API do Gemini incorreta. Verifique as variáveis de ambiente.');
        }
        if (error.message.includes('quota')) {
          throw new Error('Limite de uso da API do Gemini atingido. Tente novamente mais tarde.');
        }
        if (error.message.includes('network')) {
          throw new Error('Erro de conexão com o Gemini. Verifique sua conexão com a internet.');
        }
      }
      
      throw new Error('Erro temporário ao processar sua solicitação. Tente novamente.');
    }
  }

  private parseResponse(response: string, context?: AIInput['context']): { message: string; actions?: ActionPreview[] } {
    const actions: ActionPreview[] = [];
    let message = response;
    
    // Extrair ações do novo formato: AÇÃO_SUGERIDA: tipo-descrição
    const actionMatch = response.match(/AÇÃO_SUGERIDA:\s*([a-z-]+)/i);
    if (actionMatch) {
      const actionType = actionMatch[1];
      // Remove a linha da ação da mensagem
      message = response.replace(/AÇÃO_SUGERIDA:.*$/im, '').trim();
      
      // Determinar confiança baseada no contexto
      const confidence = this.calculateActionConfidence(actionType, context);
      
      switch (actionType) {
        case 'create-cliente':
          actions.push({
            id: crypto.randomUUID(),
            type: 'create',
            title: 'Criar novo cliente',
            description: 'Adicionar cliente no CRM do Hub.App',
            module: 'crm',
            requiresConfirmation: true,
            confidence,
            data: { type: 'cliente', action: 'create' },
          });
          break;
          
        case 'create-receita':
          actions.push({
            id: crypto.randomUUID(),
            type: 'create',
            title: 'Lançar receita',
            description: 'Criar nova receita no módulo financeiro',
            module: 'multifins',
            requiresConfirmation: true,
            confidence,
            data: { type: 'receita', action: 'create' },
          });
          break;
          
        case 'create-agendamento':
          actions.push({
            id: crypto.randomUUID(),
            type: 'create',
            title: 'Agendar compromisso',
            description: 'Criar novo agendamento na agenda',
            module: 'agenda',
            requiresConfirmation: true,
            confidence,
            data: { type: 'agendamento', action: 'create' },
          });
          break;
          
        case 'query-relatorio':
          actions.push({
            id: crypto.randomUUID(),
            type: 'query',
            title: 'Gerar relatório',
            description: 'Buscar dados e gerar relatório',
            module: context?.module || 'multifins',
            requiresConfirmation: false,
            confidence,
            data: { type: 'relatorio', action: 'query' },
          });
          break;
          
        case 'query-clientes':
          actions.push({
            id: crypto.randomUUID(),
            type: 'query',
            title: 'Buscar clientes',
            description: 'Pesquisar informações de clientes',
            module: 'crm',
            requiresConfirmation: false,
            confidence,
            data: { type: 'clientes', action: 'query' },
          });
          break;
          
        case 'navigation-modulo':
          actions.push({
            id: crypto.randomUUID(),
            type: 'navigation',
            title: 'Ir para módulo',
            description: 'Navegar para módulo específico',
            requiresConfirmation: false,
            confidence,
            data: { type: 'navigation', action: 'navigate' },
          });
          break;
      }
    }
    
    return { message, actions };
  }

  private calculateActionConfidence(actionType: string, context?: AIInput['context']): number {
    // Maior confiança se a ação é compatível com o contexto atual
    if (context?.module) {
      const moduleActionMap: Record<string, string[]> = {
        'crm': ['create-cliente', 'query-clientes'],
        'multifins': ['create-receita', 'query-relatorio'],
        'agenda': ['create-agendamento'],
        'home': ['navigation-modulo', 'query-relatorio']
      };
      
      const compatibleActions = moduleActionMap[context.module] || [];
      if (compatibleActions.includes(actionType)) {
        return 0.9; // Alta confiança para ações compatíveis com contexto
      }
    }
    
    // Confiança baseada no tipo de ação
    const actionConfidenceMap: Record<string, number> = {
      'create-cliente': 0.85,
      'create-receita': 0.85,
      'create-agendamento': 0.85,
      'query-relatorio': 0.75,
      'query-clientes': 0.8,
      'navigation-modulo': 0.7
    };
    
    return actionConfidenceMap[actionType] || 0.6;
  }

  private getLocalResponse(input: AIInput): AIResponse | null {
    const message = input.message.toLowerCase().trim();
    const module = input.context?.module || 'home';
    
    // Respostas ultra rápidas para perguntas comuns
    const commonResponses: Record<string, { message: string; action?: string }> = {
      'ola': { message: 'Oi! Como posso ajudar?' },
      'oi': { message: 'Oi! O que você precisa?' },
      'ajuda': { message: 'Posso ajudar com CRM, financeiro ou agenda. O que você quer fazer?' },
      'cliente': { message: 'Vou te ajudar com clientes.', action: 'create-cliente' },
      'receita': { message: 'Que tal lançar uma receita?', action: 'create-receita' },
      'agendamento': { message: 'Vamos agendar algo?', action: 'create-agendamento' },
      'agenda': { message: 'Vamos ver sua agenda?', action: 'create-agendamento' },
    };
    
    // Buscar por palavras-chave
    for (const [keyword, response] of Object.entries(commonResponses)) {
      if (message.includes(keyword)) {
        const actions = response.action ? [{
          id: crypto.randomUUID(),
          type: response.action.includes('create') ? 'create' as const : 'query' as const,
          title: response.action.includes('cliente') ? 'Criar cliente' :
                 response.action.includes('receita') ? 'Lançar receita' : 'Agendar',
          description: 'Ação sugerida',
          module: response.action.includes('cliente') ? 'crm' :
                  response.action.includes('receita') ? 'multifins' : 'agenda',
          requiresConfirmation: false,
          confidence: 0.9,
          data: { type: response.action }
        }] : undefined;
        
        return {
          message: response.message,
          actions,
          metadata: {
            provider: 'local',
            tokensUsed: 0, // Zero tokens!
            costCents: 0,
            processingTime: 5
          }
        };
      }
    }
    
    return null;
  }
  
  private generateCacheKey(input: AIInput): string {
    // Gerar chave baseada na mensagem normalizada e contexto
    const normalizedMessage = input.message.toLowerCase().trim().replace(/\s+/g, ' ');
    const context = input.context?.module || 'home';
    return `${context}:${normalizedMessage}`;
  }
  
  private getCachedResponse(key: string): AIResponse | null {
    const cached = this.responseCache.get(key);
    if (!cached) return null;
    
    // Verificar se não expirou
    const isExpired = Date.now() - cached.timestamp.getTime() > this.responseCacheTTL;
    if (isExpired) {
      this.responseCache.delete(key);
      return null;
    }
    
    return cached.response;
  }
  
  private cacheResponse(key: string, response: AIResponse): void {
    this.responseCache.set(key, {
      response,
      timestamp: new Date()
    });
    
    // Limpar cache se ficar muito grande
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
  }

  private estimateTokens(text: string): number {
    // Estimativa mais precisa baseada no prompt compacto
    return Math.ceil(text.length / 3.5);
  }
}