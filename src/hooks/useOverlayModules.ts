import { useState, useEffect } from 'react';
import { useModules } from './useModules';
import { useAuth } from './useAuth';

interface OverlayModule {
  id: string;
  nome: string;
  slug: string;
  manifest: {
    icon: string;
    icone_lucide: string;
    overlay: boolean;
    global: boolean;
    context_aware: boolean;
    supported_modules: string[];
  };
}

interface ModuleContext {
  currentModule: string | null;
  currentPage: string | null;
  previousModule: string | null;
  contextData: Record<string, any>;
}

export function useOverlayModules() {
  const { modules } = useModules();
  const { user } = useAuth();
  const [overlayModules, setOverlayModules] = useState<OverlayModule[]>([]);
  const [moduleContext, setModuleContext] = useState<ModuleContext>({
    currentModule: null,
    currentPage: null,
    previousModule: null,
    contextData: {}
  });

  // Filter overlay modules from installed modules
  useEffect(() => {
    if (!modules) return;

    console.log('🔍 useOverlayModules: Checking modules for overlays:', modules.length);
    modules.forEach(module => {
      console.log(`📦 Module: ${module.nome}, manifest:`, module.manifest);
      if (module.manifest) {
        const manifest = typeof module.manifest === 'string' 
          ? JSON.parse(module.manifest) 
          : module.manifest;
        console.log(`   - overlay: ${manifest?.overlay}, global: ${manifest?.global}`);
      }
    });

    const overlays = modules.filter(module => {
      if (!module.manifest) return false;
      
      const manifest = typeof module.manifest === 'string' 
        ? JSON.parse(module.manifest) 
        : module.manifest;
      
      const isOverlay = manifest?.overlay === true && manifest?.global === true;
      if (isOverlay) {
        console.log(`✅ Found overlay module: ${module.nome}, slug: ${module.slug || 'NO SLUG'}`);
      }
      return isOverlay;
    }) as OverlayModule[];

    console.log(`🤖 Total overlay modules found: ${overlays.length}`, overlays);
    setOverlayModules(overlays);
  }, [modules]);

  // Context detection system
  useEffect(() => {
    const detectContext = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      
      let currentModule = null;
      let currentPage = null;
      let contextData = {};

      // Detect context based on URL patterns
      if (pathname === '/' && !hash) {
        currentModule = 'home';
        currentPage = 'dashboard';
      } else if (hash) {
        // Hash-based routing (SPA style)
        const hashPath = hash.substring(1); // Remove #
        
        if (hashPath === '' || hashPath === '/') {
          currentModule = 'home';
          currentPage = 'dashboard';
        } else if (hashPath.includes('module=')) {
          // Extract module from hash parameters
          const urlParams = new URLSearchParams(hashPath.split('?')[1] || '');
          currentModule = urlParams.get('module');
          currentPage = urlParams.get('page') || 'main';
        } else {
          // Try to detect from hash structure
          const pathParts = hashPath.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            currentModule = pathParts[0];
            currentPage = pathParts[1] || 'main';
          }
        }
      }

      // Enhanced context detection based on DOM elements
      if (!currentModule) {
        // Check for module viewer
        const iframe = document.getElementById('module-iframe') as HTMLIFrameElement;
        if (iframe && iframe.src) {
          try {
            const url = new URL(iframe.src);
            const hostname = url.hostname;
            
            // Map known module URLs to module slugs
            const moduleMapping: Record<string, string> = {
              'multifins.hubapp.com.br': 'multifins',
              'crm.hubapp.com.br': 'crm-basico',
              'agenda.hubapp.com.br': 'agenda',
              'estoque.hubapp.com.br': 'estoque-inteligente'
            };
            
            currentModule = moduleMapping[hostname] || 'unknown-module';
            currentPage = 'iframe-view';
          } catch (e) {
            console.warn('Could not parse iframe URL for context:', e);
          }
        }
        
        // Check for active sidebar items or other UI indicators
        const activeSidebarItem = document.querySelector('[data-sidebar-item][data-active="true"]');
        if (activeSidebarItem) {
          const moduleSlug = activeSidebarItem.getAttribute('data-module-slug');
          if (moduleSlug) {
            currentModule = moduleSlug;
            currentPage = 'sidebar-active';
          }
        }
      }

      // Gather additional context data
      if (currentModule) {
        // Get module-specific context data
        contextData = {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          moduleLoaded: !!document.getElementById('module-iframe'),
          sidebarVisible: !!document.querySelector('[data-sidebar="sidebar"]'),
        };

        // Add module-specific context
        switch (currentModule) {
          case 'multifins':
            contextData.moduleType = 'financial';
            contextData.features = ['receitas', 'despesas', 'relatorios'];
            break;
          case 'crm-basico':
            contextData.moduleType = 'crm';
            contextData.features = ['contatos', 'leads', 'pipeline'];
            break;
          case 'agenda':
            contextData.moduleType = 'calendar';
            contextData.features = ['eventos', 'agendamentos', 'calendario'];
            break;
          case 'home':
            contextData.moduleType = 'dashboard';
            contextData.features = ['overview', 'widgets', 'navigation'];
            break;
        }
      }

      // Update context state
      setModuleContext(prev => ({
        currentModule,
        currentPage,
        previousModule: prev.currentModule !== currentModule ? prev.currentModule : prev.previousModule,
        contextData
      }));
    };

    // Initial detection
    detectContext();

    // Set up observers for context changes
    const observers: MutationObserver[] = [];
    
    // Watch for URL changes (hash changes)
    const handleHashChange = () => {
      setTimeout(detectContext, 100); // Small delay to allow DOM updates
    };
    window.addEventListener('hashchange', handleHashChange);

    // Watch for iframe changes (module loading)
    const iframeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          setTimeout(detectContext, 500); // Delay for iframe loading
        }
      });
    });
    
    const iframe = document.getElementById('module-iframe');
    if (iframe) {
      iframeObserver.observe(iframe, { attributes: true });
      observers.push(iframeObserver);
    }

    // Watch for sidebar changes
    const sidebarObserver = new MutationObserver(() => {
      setTimeout(detectContext, 100);
    });
    
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    if (sidebar) {
      sidebarObserver.observe(sidebar, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
      observers.push(sidebarObserver);
    }

    // Periodic context check (fallback)
    const contextCheckInterval = setInterval(detectContext, 5000);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observers.forEach(observer => observer.disconnect());
      clearInterval(contextCheckInterval);
    };
  }, []);

  // Helper function to check if a specific overlay module is installed
  const isOverlayModuleInstalled = (slug: string): boolean => {
    // modules from useModules are already installed, so just check if it exists in overlayModules
    return overlayModules.some(module => module.slug === slug);
  };

  // Helper function to get overlay modules for current context
  const getContextualOverlayModules = (): OverlayModule[] => {
    if (!moduleContext.currentModule) return overlayModules;

    return overlayModules.filter(module => {
      const supportedModules = module.manifest.supported_modules;
      return supportedModules.includes('*') || 
             supportedModules.includes(moduleContext.currentModule!);
    });
  };

  // Helper to save context to cache (for performance)
  const saveContextToCache = async () => {
    if (!user || !moduleContext.currentModule) return;

    try {
      // This would typically be an API call to save context
      console.log('💾 Saving context to cache:', moduleContext);
      // await supabase.from('ai_context_cache').upsert({
      //   tenant_id: user.tenant_id,
      //   user_id: user.id,
      //   module_slug: moduleContext.currentModule,
      //   context_data: moduleContext.contextData,
      //   last_accessed: new Date()
      // });
    } catch (error) {
      console.error('Error saving context to cache:', error);
    }
  };

  // Save context changes to cache
  useEffect(() => {
    if (moduleContext.currentModule) {
      saveContextToCache();
    }
  }, [moduleContext.currentModule, user]);

  return {
    overlayModules,
    moduleContext,
    isOverlayModuleInstalled,
    getContextualOverlayModules,
    // Expose context manually for testing/debugging
    setModuleContext: (context: Partial<ModuleContext>) => {
      setModuleContext(prev => ({ ...prev, ...context }));
    }
  };
}