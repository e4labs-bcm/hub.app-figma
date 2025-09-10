import { Message, ActionPreview } from '../types/ai.types';

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60000) {
    return 'agora';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}min`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  }
  
  // More than a day
  return date.toLocaleDateString('pt-BR');
}

/**
 * Extract context from current URL or path
 */
export function extractPageContext(): { module?: string; page?: string } {
  if (typeof window === 'undefined') return {};
  
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // Extract module from URL patterns
  const moduleMatch = path.match(/\/(vendas|financeiro|estoque|clientes|relatorios)/);
  const module = moduleMatch ? moduleMatch[1] : undefined;
  
  // Extract page from URL or search params
  const pageMatch = path.match(/\/([^\/]+)$/);
  const page = searchParams.get('page') || (pageMatch ? pageMatch[1] : undefined);
  
  return { module, page };
}

/**
 * Generate action suggestions based on context
 */
export function generateContextualActions(
  module?: string,
  userMessage?: string
): ActionPreview[] {
  const actions: ActionPreview[] = [];
  const lowerMessage = userMessage?.toLowerCase() || '';
  
  switch (module) {
    case 'vendas':
      if (lowerMessage.includes('nova') || lowerMessage.includes('criar')) {
        actions.push({
          id: crypto.randomUUID(),
          type: 'create',
          title: 'Nova Venda',
          description: 'Criar uma nova venda no sistema',
          module: 'vendas',
          requiresConfirmation: true,
        });
      }
      if (lowerMessage.includes('relatório') || lowerMessage.includes('relatorio')) {
        actions.push({
          id: crypto.randomUUID(),
          type: 'navigation',
          title: 'Relatório de Vendas',
          description: 'Ir para relatórios de vendas',
          module: 'vendas',
          requiresConfirmation: false,
        });
      }
      break;
      
    case 'financeiro':
      if (lowerMessage.includes('receita') || lowerMessage.includes('lançar')) {
        actions.push({
          id: crypto.randomUUID(),
          type: 'create',
          title: 'Lançar Receita',
          description: 'Criar novo lançamento de receita',
          module: 'financeiro',
          requiresConfirmation: true,
        });
      }
      break;
      
    case 'estoque':
      if (lowerMessage.includes('produto') || lowerMessage.includes('adicionar')) {
        actions.push({
          id: crypto.randomUUID(),
          type: 'create',
          title: 'Adicionar Produto',
          description: 'Cadastrar novo produto no estoque',
          module: 'estoque',
          requiresConfirmation: true,
        });
      }
      break;
  }
  
  return actions;
}

/**
 * Clean and format user input
 */
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .slice(0, 1000); // Limit length
}

/**
 * Generate conversation summary
 */
export function generateConversationSummary(messages: Message[]): string {
  if (messages.length === 0) return 'Conversa vazia';
  
  const userMessages = messages.filter(m => m.type === 'user').length;
  const assistantMessages = messages.filter(m => m.type === 'assistant').length;
  const actionsCount = messages.reduce(
    (count, m) => count + (m.actions?.length || 0), 
    0
  );
  
  return `${userMessages} pergunta${userMessages !== 1 ? 's' : ''}, ${assistantMessages} resposta${assistantMessages !== 1 ? 's' : ''}, ${actionsCount} ação${actionsCount !== 1 ? 'ões' : ''} sugerida${actionsCount !== 1 ? 's' : ''}`;
}

/**
 * Check if message contains sensitive information
 */
export function containsSensitiveInfo(message: string): boolean {
  const sensitivePatterns = [
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF
    /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/, // CNPJ
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
    /\bpassword\b|\bsenha\b/i, // Password keywords
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(message));
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Store conversation in localStorage
 */
export function saveConversation(messages: Message[], sessionId?: string): void {
  if (typeof window === 'undefined') return;
  
  const id = sessionId || generateSessionId();
  const conversation = {
    id,
    messages,
    timestamp: new Date().toISOString(),
    summary: generateConversationSummary(messages),
  };
  
  try {
    const existing = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
    const updated = [...existing, conversation].slice(-10); // Keep last 10 conversations
    localStorage.setItem('ai_conversations', JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save conversation:', error);
  }
}

/**
 * Load conversations from localStorage
 */
export function loadConversations(): Array<{
  id: string;
  messages: Message[];
  timestamp: string;
  summary: string;
}> {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('ai_conversations') || '[]');
  } catch (error) {
    console.warn('Failed to load conversations:', error);
    return [];
  }
}