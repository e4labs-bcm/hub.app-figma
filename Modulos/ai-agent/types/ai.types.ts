export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  actions?: ActionPreview[];
  attachments?: FileAttachment[];
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

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  status: 'uploading' | 'success' | 'error';
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  currentInput: string;
  context?: {
    module?: string;
    page?: string;
    data?: Record<string, any>;
  };
  pendingAction?: ActionPreview;
  uploadingFiles: FileAttachment[];
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
    fallbackFrom?: string;
  };
}

export interface ChatContextType {
  state: ChatState;
  sendMessage: (message: string, files?: File[]) => Promise<void>;
  executeAction: (action: ActionPreview) => Promise<void>;
  cancelAction: () => void;
  uploadFile: (file: File) => Promise<FileAttachment>;
  clearChat: () => void;
  toggleChat: () => void;
  setContext: (context: ChatState['context']) => void;
}