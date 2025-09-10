import { MessageCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface FloatingChatButtonProps {
  isOpen: boolean;
  isMinimized?: boolean;
  isLoading: boolean;
  hasNewMessages?: boolean;
  onClick: () => void;
  className?: string;
}

export function FloatingChatButton({
  isOpen,
  isMinimized = false,
  isLoading,
  hasNewMessages = false,
  onClick,
  className = "",
}: FloatingChatButtonProps) {
  // HOOKS PRIMEIRO - ANTES DE QUALQUER RETURN!
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for responsive positioning
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // CSS for animations
  const breatheKeyframes = `
    @keyframes breathe {
      0%, 100% { 
        transform: scale(1);
        opacity: 0.8;
      }
      50% { 
        transform: scale(1.05);
        opacity: 1;
      }
    }
  `;

  // Add CSS to document if not already present
  useEffect(() => {
    if (!document.querySelector('#floating-button-animations')) {
      const style = document.createElement('style');
      style.id = 'floating-button-animations';
      style.textContent = breatheKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  // Show button when chat is closed or minimized, hide when fully open
  const shouldShowButton = !isOpen || isMinimized;

  if (!shouldShowButton) return null;

  return (
    <div
      style={{
        position: 'fixed',
        // Canto superior direito - edge emergence (evitar sobreposição com banner)
        top: '170px',
        bottom: 'auto',
        right: '-32px', // Metade do botão (64px) fora da tela
        transform: 'none',
        zIndex: 99999,
        width: '64px',
        height: '64px',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' // Elastic easing
      }}
      onMouseEnter={(e) => {
        if (!isMobile) { // Hover effects apenas para desktop
          e.currentTarget.style.right = '16px';
          e.currentTarget.style.transform = 'scale(1.05)';
          
          // Mostrar hint text no hover
          const hintText = e.currentTarget.querySelector('[data-hint-text]') as HTMLElement;
          if (hintText && !hasNewMessages) {
            hintText.style.opacity = '1';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.currentTarget.style.right = '-32px';
          e.currentTarget.style.transform = 'scale(1)';
          
          // Esconder hint text
          const hintText = e.currentTarget.querySelector('[data-hint-text]') as HTMLElement;
          if (hintText) {
            hintText.style.opacity = '0';
          }
        }
      }}
      onTouchStart={() => {
        // Para mobile: mostrar botão completo no touch
        if (isMobile) {
          document.querySelector('[data-floating-container]')!.style.right = '16px';
        }
      }}
      data-floating-container
    >
      {/* Círculo branco com breathing effect */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          zIndex: 1,
          animation: hasNewMessages ? 'breathe 2s ease-in-out infinite' : 'none'
        }}
      />
      
      <button
        onClick={() => {
          console.log('🔥 FloatingChatButton clicked - calling onClick');
          onClick();
        }}
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          top: '4px',
          left: '4px',
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fontSize: '0',
          zIndex: 2,
          minWidth: '44px', // Acessibilidade: target size mínimo
          minHeight: '44px'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.9)';
          // Ripple effect simulation
          e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }}
        aria-label="Abrir chat do AI Agent"
        title="Abrir chat - AI Agent"
      >
        {isLoading ? (
          <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite' }} />
        ) : (
          <MessageCircle style={{ width: '24px', height: '24px' }} />
        )}

        {/* New messages indicator com pulse animation */}
        {(!isOpen || isMinimized) && hasNewMessages && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'breathe 1.5s ease-in-out infinite',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
            zIndex: 3
          }} />
        )}
      </button>
      
      {/* Subtle hint text para primeira visualização */}
      {!hasNewMessages && (
        <div
          style={{
            position: 'absolute',
            right: '70px',
            top: '18px',
            transform: 'none',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            opacity: '0',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
            zIndex: 4
          }}
          data-hint-text
        >
          🤖 AI Assistant
        </div>
      )}
    </div>
  );
}