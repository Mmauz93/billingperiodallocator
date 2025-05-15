/**
 * Translation system entry point - 100% eval-free
 * This file exports from language-service.ts and lib/translation.ts for backward compatibility
 */

// Import getCurrentLanguage specifically first

import { getCurrentLanguage } from './lib/language-service';

// Export these from language-service (the new central location)
export { 
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE as DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getCurrentLanguage,
  changeLanguage,
  getLanguageFromPath
} from './lib/language-service';

// Export translation functions from translation.ts
export { 
  t,
  i18n,
  useTranslation
} from './lib/translation';

// For backward compatibility with existing code
export const getLanguage = getCurrentLanguage; 
 