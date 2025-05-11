/**
 * A secure i18n helper that replaces the parts of i18next that use eval
 */

/**
 * Safe interpolation that doesn't use eval
 * @param template The string template with {{key}} patterns
 * @param data The data object to interpolate with
 * @returns The interpolated string
 */
export function safeInterpolate(template: string, data: Record<string, unknown>): string {
  if (!template || typeof template !== 'string') return '';
  
  // Replace {{key}} with the corresponding value from data
  return template.replace(/\{\{([^{}]+)\}\} /g, (match, key) => {
    const trimmedKey = key.trim();
    
    // Handle nested keys (obj.prop.subprop)
    if (trimmedKey.includes('.')) {
      const keyParts = trimmedKey.split('.');
      let currentValue: unknown = data;
      
      for (const part of keyParts) {
        if (typeof currentValue === 'object' && currentValue !== null && part in currentValue) {
          currentValue = (currentValue as Record<string, unknown>)[part];
        } else {
          return match; // Key path not found or not an object
        }
      }
      
      return currentValue !== undefined && currentValue !== null ? String(currentValue) : match;
    }
    
    // Handle direct key access
    const directValue = data[trimmedKey];
    return directValue !== undefined && directValue !== null ? String(directValue) : match;
  });
}

/**
 * Safe string formatting without eval
 * @param value The value to format
 * @param format The format to apply (e.g., 'uppercase', 'lowercase')
 * @returns The formatted value
 */
export function safeFormat(value: unknown, format?: string): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  if (!format) return stringValue;
  
  switch (format.toLowerCase()) {
    case 'uppercase':
      return stringValue.toUpperCase();
    case 'lowercase':
      return stringValue.toLowerCase();
    case 'capitalize':
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
    case 'number':
      return isNaN(Number(value)) ? stringValue : Number(value).toString();
    case 'currency':
      return isNaN(Number(value)) ? stringValue : 
        new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(Number(value));
    default:
      return stringValue;
  }
}

/**
 * Safe nesting handler that doesn't use eval
 * @param template The template with $t(key) patterns
 * @param translateFn The translation function to call for nested keys
 * @returns The processed template
 */
export function safeNesting(template: string, translateFn: (key: string) => string): string {
  if (!template || typeof template !== 'string') return '';
  
  return template.replace(/\$t\(([^)]+)\)/g, (match, key) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return match;
    
    // If it's wrapped in quotes, remove them
    const cleanKey = trimmedKey.replace(/^['"]|['"]$/g, '');
    
    return translateFn(cleanKey) || match;
  });
} 
 