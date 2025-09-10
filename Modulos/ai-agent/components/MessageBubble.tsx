import { motion } from "framer-motion";
import { Bot, User, Loader2, FileText, CheckCircle, XCircle } from "lucide-react";
import { Message } from "../types/ai.types";
import { ActionConfirmation } from "./ActionConfirmation";
import { useFileProcessor } from "../hooks/useFileProcessor";

interface MessageBubbleProps {
  message: Message;
  onActionExecute?: (actionId: string) => void;
  onActionCancel?: () => void;
}

export function MessageBubble({
  message,
  onActionExecute,
  onActionCancel,
}: MessageBubbleProps) {
  const { getFileIcon, formatFileSize } = useFileProcessor();
  const isUser = message.type === 'user';

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
          }
        `}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`
            px-4 py-2 rounded-lg break-words
            ${isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
            }
          `}
        >
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processando...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}

          {/* File Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((file) => (
                <div
                  key={file.id}
                  className={`
                    flex items-center gap-2 p-2 rounded border
                    ${isUser ? 'bg-primary-foreground/10' : 'bg-background/50'}
                  `}
                >
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs opacity-70">{formatFileSize(file.size)}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {file.status === 'uploading' && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Confirmation */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 w-full">
            <ActionConfirmation
              actions={message.actions}
              onExecute={onActionExecute}
              onCancel={onActionCancel}
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
}