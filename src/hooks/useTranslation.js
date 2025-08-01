/**
 * Custom translation hook for the Leben in Deutschland App
 * 
 * Features:
 * - Automatic fallback to English if key not found
 * - Support for dynamic content (functions)
 * - Performance optimized with memoization
 * - Type-safe translation key validation
 */

import { useMemo } from 'react';
import { useLanguage } from '../utils/languageContext';
import { translations, getTranslation, getAvailableLanguages, languageMetadata } from '../data/translations-new';

/**
 * Custom hook for translations with enhanced features
 * @returns {Object} Translation utilities
 */
export const useTranslation = () => {
  const { language } = useLanguage();

  // Memoize the translation function to avoid recreating it on every render
  const tFunc = useMemo(() => {
    return (key, fallback = key, ...args) => {
      const translation = getTranslation(language, key, fallback);
      
      // If translation is a function, call it with provided arguments
      if (typeof translation === 'function') {
        return translation(...args);
      }
      
      return translation;
    };
  }, [language]);

  // Create a proxy object that returns translations directly
  const t = useMemo(() => {
    const baseTranslations = translations[language] || translations['EN'] || {};
    const translationProxy = new Proxy(baseTranslations, {
      get(target, prop) {
        if (typeof prop === 'string') {
          const translation = getTranslation(language, prop, prop);
          if (typeof translation === 'function') {
            return translation();
          }
          return translation;
        }
        return target[prop];
      }
    });
    return translationProxy;
  }, [language]);

// Check if a translation key exists
  const hasKey = useMemo(() => {
    return (key) => translations[language]?.[key] !== undefined || translations['EN']?.[key] !== undefined;
  }, [language]);

  // Get raw translation object for advanced use cases
  const getRawTranslations = useMemo(() => {
    return translations[language] || translations['EN'];
  }, [language]);

// Get current language metadata
  const getLanguageInfo = useMemo(() => {
    return languageMetadata[language] || languageMetadata['EN'];
  }, [language]);

  return {
    t,                    // Translation object with direct property access
    tFunc,               // Translation function
    hasKey,              // Check if key exists
    language,            // Current language
    getRawTranslations,  // Get raw translations object
    getLanguageInfo,     // Get language metadata
  };
};

/**
 * Higher-order component for class components that need translations
 * @param {React.Component} WrappedComponent 
 * @returns {React.Component} Enhanced component with translations
 */
export const withTranslation = (WrappedComponent) => {
  return function TranslatedComponent(props) {
    const translationProps = useTranslation();
    return <WrappedComponent {...props} {...translationProps} />;
  };
};

/**
 * Hook for getting translations in a specific language (useful for comparison)
 * @param {string} targetLanguage 
 * @returns {Function} Translation function for target language
 */
export const useTranslationFor = (targetLanguage) => {
  return useMemo(() => {
    return (key, fallback = key, ...args) => {
      const translation = getTranslation(targetLanguage, key, fallback);
      
      if (typeof translation === 'function') {
        return translation(...args);
      }
      
      return translation;
    };
  }, [targetLanguage]);
};

/**
 * Hook for getting pluralized translations
 * @returns {Function} Pluralization function
 */
export const usePluralization = () => {
  const { language } = useLanguage();

  return useMemo(() => {
    return (count, singleKey, pluralKey, fallbackSingle = singleKey, fallbackPlural = pluralKey) => {
      const key = count === 1 ? singleKey : pluralKey;
      const fallback = count === 1 ? fallbackSingle : fallbackPlural;
      return getTranslation(language, key, fallback);
    };
  }, [language]);
};

export default useTranslation;
