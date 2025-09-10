import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import { Textarea } from "../../../src/components/ui/textarea";
import { ScrollArea } from "../../../src/components/ui/scroll-area";
import { Separator } from "../../../src/components/ui/separator";
import { ContextualHeader } from "./ContextualHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { FileUpload } from "./FileUpload";
import { QuotaExhaustedMessage } from "./QuotaExhaustedMessage";
import { useChat } from "../hooks/useChat";
import { useAI } from "../hooks/useAI";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMobile?: boolean;
  currentModule?: string;
  currentPage?: string;
}

export function ChatModal({
  isOpen,
  onClose,
  onMinimize,
  isMobile = false,
  currentModule,
  currentPage,
}: ChatModalProps) {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    state,
    sendMessage,
    executeAction,
    cancelAction,
    clearChat,
    setContext,
    setCurrentInput,
    messagesEndRef,
  } = useChat();

  const { generateSuggestions } = useAI();

  // Add setState to expose it for quota reset
  const resetQuotaErrors = () => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => !m.error?.includes('quota') && !m.error?.includes('Quota'))
    }));
  };

  // Set context when module changes
  useEffect(() => {
    setContext({
      module: currentModule,
      page: currentPage,
    });
  }, [currentModule, currentPage, setContext]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [state.currentInput]);

  const handleSendMessage = async () => {
    if (!state.currentInput.trim() && selectedFiles.length === 0) return;

    await sendMessage(state.currentInput, selectedFiles);
    setSelectedFiles([]);
    setShowFileUpload(false);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const suggestions = generateSuggestions(currentModule);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* No backdrop - completely transparent */}

        {/* Chat Container */}
        <motion.div
          className={`
            relative bg-background border border-border rounded-lg shadow-xl
            flex flex-col overflow-hidden
            ${isMobile 
              ? 'w-full h-[90vh] m-4' 
              : 'w-96 h-[80vh] mr-6 mb-20'
            }
          `}
          initial={{ 
            opacity: 0, 
            scale: 0.95,
            y: isMobile ? 100 : 50,
            x: isMobile ? 0 : 50,
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: 0,
            x: 0,
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95,
            y: isMobile ? 100 : 50,
            x: isMobile ? 0 : 50,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
        >
          {/* Header */}
          <ContextualHeader
            currentModule={currentModule}
            currentPage={currentPage}
            onClose={onClose}
            onMinimize={onMinimize}
            isMobile={isMobile}
          />

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {/* Welcome message */}
              {state.messages.length === 0 && (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      👋
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Olá! Sou seu assistente de IA
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Como posso ajudá-lo hoje?
                  </p>
                  
                  {/* Quick suggestions */}
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        className="block w-full text-left p-2 text-xs rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quota exhausted message */}
              {state.messages.some(m => m.error?.includes('quota') || m.error?.includes('Quota')) && (
                <QuotaExhaustedMessage 
                  onRetry={() => {
                    // Clear error messages and try again
                    setState(prev => ({
                      ...prev,
                      messages: prev.messages.filter(m => !m.error?.includes('quota'))
                    }));
                  }}
                  quotaResetTime={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                />
              )}

              {/* Messages */}
              {state.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onActionExecute={executeAction}
                  onActionCancel={cancelAction}
                />
              ))}

              {/* Typing indicator */}
              {state.isTyping && <TypingIndicator />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* File Upload Area */}
          <AnimatePresence>
            {showFileUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t"
              >
                <div className="p-4">
                  <FileUpload
                    onFilesSelect={setSelectedFiles}
                    disabled={state.isLoading}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="border-t bg-background/95 backdrop-blur-sm">
            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
              <div className="p-2 border-b">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1 text-xs"
                    >
                      <span>📎</span>
                      <span className="truncate max-w-24">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4">
              <div className="flex gap-2">
                {/* Textarea */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={state.currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={state.isLoading}
                    className="min-h-[40px] max-h-32 resize-none pr-12"
                    rows={1}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(!showFileUpload)}
                    disabled={state.isLoading}
                    className="h-10 w-10 p-0"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={state.isLoading || (!state.currentInput.trim() && selectedFiles.length === 0)}
                    className="h-10 w-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Footer actions */}
              {state.messages.length > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    disabled={state.isLoading}
                    className="text-xs text-muted-foreground"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Limpar conversa
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    {state.messages.length} mensagem{state.messages.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}