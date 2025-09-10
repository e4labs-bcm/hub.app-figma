// Main exports for AI Agent module
export { FloatingChatButton } from './components/FloatingChatButton';
export { ChatModal } from './components/ChatModal';
export { MessageBubble } from './components/MessageBubble';
export { ActionConfirmation } from './components/ActionConfirmation';
export { FileUpload } from './components/FileUpload';
export { TypingIndicator } from './components/TypingIndicator';
export { ContextualHeader } from './components/ContextualHeader';

// Provider
export { AIAgentProvider, useAIAgent } from './AIAgentProvider';

// Examples
export { AIAgentDemo } from './examples/AIAgentDemo';

// Hooks
export { useChat } from './hooks/useChat';
export { useAI } from './hooks/useAI';
export { useFileProcessor } from './hooks/useFileProcessor';

// Types
export type {
  Message,
  ActionPreview,
  FileAttachment,
  ChatState,
  AIResponse,
  ChatContextType,
} from './types/ai.types';

// Utils
export {
  formatTimestamp,
  extractPageContext,
  generateContextualActions,
  sanitizeUserInput,
  generateConversationSummary,
  containsSensitiveInfo,
  generateSessionId,
  saveConversation,
  loadConversations,
} from './utils/aiHelpers';