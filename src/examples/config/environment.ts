// Configuração de ambiente
export const config = {
  // URLs da API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 10000, // 10 segundos
  },

  // Autenticação
  auth: {
    tokenKey: 'family_auth_token',
    refreshTokenKey: 'family_refresh_token',
    tokenExpiration: 24 * 60 * 60 * 1000, // 24 horas
  },

  // Aplicação
  app: {
    name: 'Portal da Família',
    version: '1.0.0',
    defaultFamilyName: 'Família',
    maxAppsInGrid: 16,
  },

  // PWA
  pwa: {
    enabled: import.meta.env.VITE_PWA_ENABLED === 'true',
    swPath: '/sw.js',
  },

  // Analytics (opcional)
  analytics: {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
    googleAnalyticsId: import.meta.env.VITE_GA_ID,
  },

  // Supabase (se usar)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // Firebase (se usar)
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // Features flags
  features: {
    enableChat: import.meta.env.VITE_FEATURE_CHAT === 'true',
    enableLocation: import.meta.env.VITE_FEATURE_LOCATION === 'true',
    enableNotifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS === 'true',
    enableOfflineMode: import.meta.env.VITE_FEATURE_OFFLINE === 'true',
  },

  // Desenvolvimento
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Função para validar configuração obrigatória
export function validateConfig() {
  const required = [
    'VITE_API_URL',
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não definidas: ${missing.join(', ')}`);
  }
}

// Tipos para TypeScript
export type Config = typeof config;

// Exemplo de uso:
// import { config, validateConfig } from './config/environment';
// validateConfig(); // Chamar no início da aplicação