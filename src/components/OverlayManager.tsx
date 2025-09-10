import { useEffect, useState } from 'react';
import { useOverlayModules } from '../hooks/useOverlayModules';
import { AIAgentProvider } from '../../Modulos/ai-agent';

interface OverlayManagerProps {
  children: React.ReactNode;
}

export function OverlayManager({ children }: OverlayManagerProps) {
  const { overlayModules, moduleContext, isOverlayModuleInstalled } = useOverlayModules();
  
  // Debug logs removidos para reduzir overhead - sistema funcionando!
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Context change logging removed for performance

  // Render AI Agent if installed
  const renderAIAgent = () => {
    if (!isOverlayModuleInstalled('ai-agent')) {
      return null;
    }

    return (
      <AIAgentProvider
        enabled={true}
        isMobile={isMobile}
      />
    );
  };

  // Render other overlay modules (extensible for future overlays)
  const renderOtherOverlays = () => {
    const otherOverlays = overlayModules.filter(module => 
      module.slug !== 'ai-agent' && module.is_installed
    );

    return otherOverlays.map(module => {
      console.log(`🧩 Rendering overlay module: ${module.nome}`);
      
      // Future overlay modules can be added here
      switch (module.slug) {
        case 'notifications-overlay':
          // return <NotificationsOverlay key={module.id} />;
          return null;
        case 'help-overlay':
          // return <HelpOverlay key={module.id} />;
          return null;
        default:
          console.warn(`Unknown overlay module: ${module.slug}`);
          return null;
      }
    });
  };

  return (
    <>
      {/* Main app content */}
      {children}
      
      {/* Render overlay modules */}
      <div id="overlay-modules" className="relative">
        {/* AI Agent Overlay */}
        {renderAIAgent()}
        
        {/* Other Overlay Modules */}
        {renderOtherOverlays()}
        
        {/* Debug info (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            id="overlay-debug" 
            className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-[9999] max-w-xs"
            style={{ fontSize: '10px', lineHeight: '1.2' }}
          >
            <div><strong>Context:</strong> {moduleContext.currentModule || 'none'}</div>
            <div><strong>Page:</strong> {moduleContext.currentPage || 'none'}</div>
            <div><strong>Overlays:</strong> {overlayModules.filter(m => m.is_installed).length}</div>
            <div><strong>AI Agent:</strong> {isOverlayModuleInstalled('ai-agent') ? '✅' : '❌'}</div>
          </div>
        )}
      </div>
    </>
  );
}

// Export context for external access (useful for AI Agent)
export { useOverlayModules };