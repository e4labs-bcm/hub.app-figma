import { useState, useCallback, useRef } from 'react';
import { Message, ChatState, ActionPreview, FileAttachment } from '../types/ai.types';
import { useAI } from './useAI';
import { useFileProcessor } from './useFileProcessor';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isLoading: false,
    isTyping: false,
    currentInput: '',
    uploadingFiles: [],
  });

  const { processMessage } = useAI();
  const { uploadFile: processFile } = useFileProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    setTimeout(scrollToBottom, 100);
    return newMessage;
  }, [scrollToBottom]);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  }, []);

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return;

    // Add user message
    const userMessage = addMessage({
      type: 'user',
      content: content.trim(),
      attachments: files?.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading' as const,
      })),
    });

    // Process file uploads if any
    if (files && files.length > 0) {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const uploadedFiles = await Promise.all(
          files.map(file => processFile(file))
        );
        
        updateMessage(userMessage.id, {
          attachments: uploadedFiles,
        });
      } catch (error) {
        console.error('Error uploading files:', error);
        updateMessage(userMessage.id, {
          attachments: userMessage.attachments?.map(att => ({
            ...att,
            status: 'error' as const,
          })),
        });
      }
    }

    // Add loading assistant message
    const assistantMessage = addMessage({
      type: 'assistant',
      content: '',
      isLoading: true,
    });

    setState(prev => ({ ...prev, isLoading: true, isTyping: true }));

    try {
      const response = await processMessage(content, {
        context: state.context,
        files: files,
        history: state.messages.slice(-10), // Last 10 messages for context
      });

      updateMessage(assistantMessage.id, {
        content: response.message,
        isLoading: false,
        actions: response.actions,
      });

      if (response.actions && response.actions.length > 0) {
        setState(prev => ({
          ...prev,
          pendingAction: response.actions![0],
        }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      updateMessage(assistantMessage.id, {
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isLoading: false,
      });
    } finally {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isTyping: false,
        currentInput: '',
      }));
    }
  }, [state.context, state.messages, addMessage, updateMessage, processMessage, processFile]);

  const executeAction = useCallback(async (action: ActionPreview) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Here you would implement the actual action execution
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addMessage({
        type: 'assistant',
        content: `Ação "${action.title}" executada com sucesso!`,
      });

      setState(prev => ({ ...prev, pendingAction: undefined }));
    } catch (error) {
      console.error('Error executing action:', error);
      addMessage({
        type: 'assistant',
        content: `Erro ao executar a ação "${action.title}". Tente novamente.`,
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage]);

  const cancelAction = useCallback(() => {
    setState(prev => ({ ...prev, pendingAction: undefined }));
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<FileAttachment> => {
    const attachment: FileAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
    };

    setState(prev => ({
      ...prev,
      uploadingFiles: [...prev.uploadingFiles, attachment],
    }));

    try {
      const result = await processFile(file);
      
      setState(prev => ({
        ...prev,
        uploadingFiles: prev.uploadingFiles.filter(f => f.id !== attachment.id),
      }));

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploadingFiles: prev.uploadingFiles.map(f =>
          f.id === attachment.id ? { ...f, status: 'error' as const } : f
        ),
      }));
      throw error;
    }
  }, [processFile]);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      pendingAction: undefined,
      uploadingFiles: [],
    }));
  }, []);

  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const setContext = useCallback((context: ChatState['context']) => {
    setState(prev => ({ ...prev, context }));
  }, []);

  const setCurrentInput = useCallback((input: string) => {
    setState(prev => ({ ...prev, currentInput: input }));
  }, []);

  return {
    state,
    sendMessage,
    executeAction,
    cancelAction,
    uploadFile,
    clearChat,
    toggleChat,
    setContext,
    setCurrentInput,
    messagesEndRef,
  };
}