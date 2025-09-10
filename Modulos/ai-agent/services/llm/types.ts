export interface LLMProvider {
  processMessage(input: AIInput): Promise<AIResponse>;
  validateConnection(): Promise<boolean>;
  getCost(tokens: number): number;
  getQuotaStatus(): Promise<QuotaStatus>;
  name: string;
  isAvailable: boolean;
}

export interface AIInput {
  message: string;
  context?: {
    module?: string;
    page?: string;
    data?: Record<string, any>;
  };
  files?: File[];
  history?: AIMessage[];
  tenantId: string;
  userId: string;
}

export interface AIResponse {
  message: string;
  actions?: ActionPreview[];
  context?: Record<string, any>;
  error?: string;
  metadata?: {
    provider: string;
    tokensUsed: number;
    costCents: number;
    processingTime: number;
    rotatedFrom?: string;
    fallbackFrom?: string;
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ActionPreview {
  id: string;
  type: 'create' | 'update' | 'delete' | 'navigation' | 'query';
  title: string;
  description: string;
  module?: string;
  data?: Record<string, any>;
  requiresConfirmation: boolean;
  confidence?: number;
}

export interface QuotaStatus {
  requestsUsed: number;
  requestsLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  resetDate: Date;
}

export interface LLMConfig {
  provider: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

export type ProviderType = 'gemini' | 'gemini-1' | 'gemini-2' | 'openai' | 'claude' | 'mistral';