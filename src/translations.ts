/**
 * Translation system entry point - 100% eval-free
 * This file replaces i18n-client.ts with a simpler implementation
 */

import { getLanguage } from './lib/translation';

export { 
  t,
  i18n,
  useTranslation,
  changeLanguage,
  getLanguage,
  getLanguageFromPath
} from './lib/translation';

// Constants exported for backward compatibility with existing code
export const LANGUAGE_STORAGE_KEY = 'billingperiodallocator-language';
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'de'];

// For backward compatibility with existing code
export const getCurrentLanguage = getLanguage; 
 