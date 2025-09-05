import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BackgroundSettings {
  image: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size: 'cover' | 'contain' | 'auto';
  opacity: number;
}

interface LogoSettings {
  type: 'text' | 'image';
  imageUrl?: string;
  text: string;
  showShadow: boolean;
  size: {
    width: number;  // em rem (1-20)
    height: number; // em rem (1-10)
  };
}

interface BannerSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  imageUrl: string;
}

interface AccessControl {
  modules: {
    appStore: boolean;
    eventBanner: boolean;
    sidebar: boolean;
    notifications: boolean;
  };
  level: 'basic' | 'standard' | 'premium';
}

interface PushSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  weeklyDigest: boolean;
  eventNotifications: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  familyName: string;
  phone?: string;
  avatar?: string;
}

interface SettingsContextType {
  background: BackgroundSettings;
  logo: LogoSettings;
  banner: BannerSettings;
  accessControl: AccessControl;
  pushSettings: PushSettings;
  userProfile: UserProfile;
  updateBackground: (settings: Partial<BackgroundSettings>) => void;
  updateLogo: (settings: Partial<LogoSettings>) => void;
  updateBanner: (settings: Partial<BannerSettings>) => void;
  updateAccessControl: (settings: Partial<AccessControl>) => void;
  updatePushSettings: (settings: Partial<PushSettings>) => void;
  updateUserProfile: (settings: Partial<UserProfile>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Omit<SettingsContextType, 'updateBackground' | 'updateLogo' | 'updateBanner' | 'updateAccessControl' | 'updatePushSettings' | 'updateUserProfile' | 'resetToDefaults'> = {
  background: {
    image: 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png',
    position: 'center',
    size: 'cover',
    opacity: 1
  },
  logo: {
    type: 'text',
    text: 'Família',
    showShadow: true,
    size: {
      width: 12, // ~192px (max-w-48)
      height: 3  // ~48px (max-h-12)
    }
  },
  banner: {
    enabled: true,
    title: 'CELEBRAÇÃO',
    subtitle: 'Momentos especiais em família',
    imageUrl: 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png'
  },
  accessControl: {
    modules: {
      appStore: true,
      eventBanner: true,
      sidebar: true,
      notifications: true
    },
    level: 'standard'
  },
  pushSettings: {
    enabled: true,
    dailyReminder: false,
    reminderTime: '09:00',
    weeklyDigest: true,
    eventNotifications: true
  },
  userProfile: {
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    familyName: 'Família'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('familyAppSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Ensure logo has size property for backward compatibility
        const migratedSettings = {
          ...defaultSettings,
          ...parsed,
          logo: {
            ...defaultSettings.logo,
            ...parsed.logo,
            size: parsed.logo?.size || defaultSettings.logo.size
          }
        };
        setSettings(migratedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        const settingsString = JSON.stringify(settings);
        
        // Check if the data size is too large (limit to ~4MB to be safe)
        const sizeInBytes = new Blob([settingsString]).size;
        const maxSizeInBytes = 4 * 1024 * 1024; // 4MB
        
        if (sizeInBytes > maxSizeInBytes) {
          console.warn('Settings data too large for localStorage, skipping image data...');
          
          // Create a copy without large image data
          const settingsWithoutImages = {
            ...settings,
            background: {
              ...settings.background,
              // Keep the image reference if it's a figma asset, remove if it's base64
              image: settings.background.image.startsWith('data:') 
                ? 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png' 
                : settings.background.image
            },
            logo: {
              ...settings.logo,
              // Remove base64 image data for logo as well
              imageUrl: settings.logo.imageUrl?.startsWith('data:') 
                ? undefined 
                : settings.logo.imageUrl
            },
            banner: {
              ...settings.banner,
              // Remove base64 image data for banner as well
              imageUrl: settings.banner.imageUrl.startsWith('data:') 
                ? 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png' 
                : settings.banner.imageUrl
            }
          };
          
          localStorage.setItem('familyAppSettings', JSON.stringify(settingsWithoutImages));
          
          // Show user feedback about the limitation
          console.info('Uploaded images are not persisted due to browser storage limitations');
        } else {
          localStorage.setItem('familyAppSettings', settingsString);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded. Saving without image data...');
          
          // Fallback: save without image data
          try {
            const fallbackSettings = {
              ...settings,
              background: {
                ...settings.background,
                image: 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png'
              },
              logo: {
                ...settings.logo,
                imageUrl: undefined
              },
              banner: {
                ...settings.banner,
                imageUrl: 'figma:asset/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png'
              }
            };
            localStorage.setItem('familyAppSettings', JSON.stringify(fallbackSettings));
          } catch (fallbackError) {
            console.error('Failed to save even fallback settings:', fallbackError);
          }
        } else {
          console.error('Error saving settings:', error);
        }
      }
    }
  }, [settings, isLoaded]);

  const updateBackground = (newSettings: Partial<BackgroundSettings>) => {
    setSettings(prev => ({
      ...prev,
      background: { ...prev.background, ...newSettings }
    }));
  };

  const updateLogo = (newSettings: Partial<LogoSettings>) => {
    setSettings(prev => ({
      ...prev,
      logo: { ...prev.logo, ...newSettings }
    }));
  };

  const updateBanner = (newSettings: Partial<BannerSettings>) => {
    setSettings(prev => ({
      ...prev,
      banner: { ...prev.banner, ...newSettings }
    }));
  };

  const updateAccessControl = (newSettings: Partial<AccessControl>) => {
    setSettings(prev => ({
      ...prev,
      accessControl: { ...prev.accessControl, ...newSettings }
    }));
  };

  const updatePushSettings = (newSettings: Partial<PushSettings>) => {
    setSettings(prev => ({
      ...prev,
      pushSettings: { ...prev.pushSettings, ...newSettings }
    }));
  };

  const updateUserProfile = (newSettings: Partial<UserProfile>) => {
    setSettings(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...newSettings }
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('familyAppSettings');
    } catch (error) {
      console.error('Error removing settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{
      ...settings,
      updateBackground,
      updateLogo,
      updateBanner,
      updateAccessControl,
      updatePushSettings,
      updateUserProfile,
      resetToDefaults
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    console.error('useSettings must be used within a SettingsProvider');
    // Return default values instead of throwing to prevent crashes
    return {
      ...defaultSettings,
      updateBackground: () => {},
      updateLogo: () => {},
      updateBanner: () => {},
      updateAccessControl: () => {},
      updatePushSettings: () => {},
      updateUserProfile: () => {},
      resetToDefaults: () => {}
    };
  }
  return context;
}