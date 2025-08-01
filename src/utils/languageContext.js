import React, { createContext, useState, useContext, useEffect } from 'react';
import { getItem, setItem } from './storage';

// Create a context for language state
const LanguageContext = createContext({
  language: 'EN',
  setLanguage: () => {},
});

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('EN');

  // Load stored language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await getItem('app_language', 'EN');
        if (storedLanguage) {
          setLanguageState(storedLanguage);
        }
      } catch (error) {
        console.error('Error loading app language:', error);
      }
    };

    loadLanguage();
  }, []);

  // Set language and store it
  const setLanguage = (lang) => {
    setLanguageState(lang);
    setItem('app_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
