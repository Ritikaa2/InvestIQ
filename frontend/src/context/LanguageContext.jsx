import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: 'Dashboard',
    research: 'Research Hub',
    history: 'Research History',
    bookmarks: 'Watchlist',
    savedReports: 'Saved Reports',
    analytics: 'Analytics',
    settings: 'Settings',
    logout: 'Log Out',
    welcomeBack: 'Welcome Back',
    totalResearch: 'Total Research Runs',
    savedReportsCount: 'Saved Reports',
    activeWatchlist: 'Watchlist Tickers',
    totalTokens: 'AI Tokens Utilized',
    responseTime: 'Average Run Speed',
    trendingStocks: 'Trending Watchlist Tickers',
    dailyUsage: 'Daily Analytical Requests',
    recentActivity: 'Recent Search Activity',
    noActivity: 'No recent research found. Start by entering a stock ticker above!',
    enterTicker: 'Enter Company Ticker (e.g. AAPL, TSLA, MSFT)',
    runAnalysis: 'Synthesize Research',
    profile: 'User Profile'
  },
  es: {
    dashboard: 'Panel de Control',
    research: 'Centro de Investigación',
    history: 'Historial',
    bookmarks: 'Lista de Vigilancia',
    savedReports: 'Informes Guardados',
    analytics: 'Analítica',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    welcomeBack: 'Bienvenido de nuevo',
    totalResearch: 'Búsquedas Totales',
    savedReportsCount: 'Informes Guardados',
    activeWatchlist: 'Acciones Vigiladas',
    totalTokens: 'Tokens de IA Usados',
    responseTime: 'Velocidad de Ejecución',
    trendingStocks: 'Tendencias Recientes',
    dailyUsage: 'Solicitudes Diarias',
    recentActivity: 'Actividad Reciente',
    noActivity: 'No se encontraron búsquedas. ¡Comience ingresando un ticker de acciones arriba!',
    enterTicker: 'Ingrese el Ticker de la Empresa (ej. AAPL, TSLA)',
    runAnalysis: 'Sintetizar Investigación',
    profile: 'Perfil de Usuario'
  }
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', locale);
  }, [locale]);

  const t = (key) => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};


