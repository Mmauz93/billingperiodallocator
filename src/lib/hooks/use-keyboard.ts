/**
 * useKeyboard Hook
 * 
 * A React hook that provides enhanced keyboard interactions for components.
 * Supports multiple key combinations and provides a declarative way to handle keyboard events.
 */

import { useCallback, useEffect, useRef } from 'react';

// Types of keys that can be pressed
type Key =
  | 'Enter'
  | 'Escape'
  | 'Space'
  | 'Tab'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | 'Delete'
  | 'Backspace'
  | string;

// Modifier keys
type Modifier = 'Alt' | 'Control' | 'Meta' | 'Shift';

// A key combination
interface KeyCombo {
  key: Key;
  modifiers?: Modifier[];
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// Map of key combinations to handlers
type KeyMap = Record<string, (event: KeyboardEvent) => void>;

interface UseKeyboardOptions {
  keyMap: KeyMap;
  target?: HTMLElement | null | 'global';
  enabled?: boolean;
}

/**
 * Creates a standardized string representation of a key combo
 */
function normalizeKeyCombo(combo: KeyCombo | string): string {
  if (typeof combo === 'string') {
    return combo.toLowerCase();
  }
  
  const { key, modifiers = [] } = combo;
  const sortedModifiers = [...modifiers].sort();
  return `${sortedModifiers.join('+')}${sortedModifiers.length ? '+' : ''}${key.toLowerCase()}`;
}

/**
 * Parses a key combo string into its components
 */
function parseKeyCombo(comboStr: string): KeyCombo {
  const parts = comboStr.split('+');
  const key = parts.pop() as Key;
  const modifiers = parts as Modifier[];
  
  return { key, modifiers };
}

/**
 * Checks if a keyboard event matches a key combo
 */
function matchesKeyCombo(event: KeyboardEvent, combo: KeyCombo | string): boolean {
  const normalizedCombo = typeof combo === 'string' ? parseKeyCombo(combo) : combo;
  const { key, modifiers = [] } = normalizedCombo;
  
  // Check if the key matches
  if (event.key.toLowerCase() !== key.toLowerCase()) {
    return false;
  }
  
  // Check modifiers
  const hasAlt = modifiers.includes('Alt');
  const hasControl = modifiers.includes('Control');
  const hasShift = modifiers.includes('Shift');
  const hasMeta = modifiers.includes('Meta');
  
  return (
    event.altKey === hasAlt &&
    event.ctrlKey === hasControl &&
    event.shiftKey === hasShift &&
    event.metaKey === hasMeta
  );
}

/**
 * Hook for handling keyboard events declaratively
 * 
 * @example
 * ```tsx
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * 
 * useKeyboard({
 *   target: buttonRef.current,
 *   keyMap: {
 *     'Enter': () => console.log('Enter pressed'),
 *     'Shift+ArrowUp': (e) => {
 *       e.preventDefault();
 *       console.log('Shift+Up pressed');
 *     },
 *   },
 * });
 * 
 * return <button ref={buttonRef}>Press Enter or Shift+Up</button>;
 * ```
 */
export function useKeyboard({
  keyMap,
  target = 'global',
  enabled = true,
}: UseKeyboardOptions): void {
  // Normalize the key map for faster lookups
  const normalizedKeyMapRef = useRef<Map<string, { 
    handler: (event: KeyboardEvent) => void; 
    combo: KeyCombo; 
  }>>(new Map());
  
  // Update the normalized key map when keyMap changes
  useEffect(() => {
    const newMap = new Map();
    
    Object.entries(keyMap).forEach(([comboStr, handler]) => {
      const combo = typeof comboStr === 'string' 
        ? parseKeyCombo(comboStr) 
        : comboStr;
      
      const normalizedKey = normalizeKeyCombo(combo);
      newMap.set(normalizedKey, { handler, combo });
    });
    
    normalizedKeyMapRef.current = newMap;
  }, [keyMap]);
  
  // Handle keyboard events
  const handleKeyDown = useCallback((event: Event) => {
    if (!enabled) return;
    
    const keyboardEvent = event as KeyboardEvent;
    
    for (const [, { handler, combo }] of normalizedKeyMapRef.current.entries()) {
      if (matchesKeyCombo(keyboardEvent, combo)) {
        if (combo.preventDefault) {
          keyboardEvent.preventDefault();
        }
        
        if (combo.stopPropagation) {
          keyboardEvent.stopPropagation();
        }
        
        handler(keyboardEvent);
        break;
      }
    }
  }, [enabled]);
  
  // Attach event listeners
  useEffect(() => {
    if (!enabled) return;
    
    const targetElement = target === 'global' ? document : target;
    if (!targetElement) return;
    
    targetElement.addEventListener('keydown', handleKeyDown);
    
    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, enabled, handleKeyDown]);
}

/**
 * Helper hook for arrow key navigation in lists
 * 
 * @example
 * ```tsx
 * const [selectedIndex, setSelectedIndex] = useState(0);
 * const listRef = useRef<HTMLUListElement>(null);
 * 
 * useArrowNavigation({
 *   containerRef: listRef,
 *   selectedIndex,
 *   onIndexChange: setSelectedIndex,
 *   itemCount: 5,
 *   orientation: 'vertical',
 * });
 * 
 * return (
 *   <ul ref={listRef}>
 *     {[0, 1, 2, 3, 4].map(i => (
 *       <li key={i} aria-selected={i === selectedIndex}>
 *         Item {i}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useArrowNavigation({
  containerRef,
  selectedIndex,
  onIndexChange,
  itemCount,
  orientation = 'vertical',
  loop = true,
  enabled = true,
}: {
  containerRef: React.RefObject<HTMLElement>;
  selectedIndex: number;
  onIndexChange: (newIndex: number) => void;
  itemCount: number;
  orientation?: 'vertical' | 'horizontal' | 'both';
  loop?: boolean;
  enabled?: boolean;
}): void {
  useKeyboard({
    target: containerRef.current,
    enabled,
    keyMap: {
      ArrowUp: (e) => {
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          if (selectedIndex > 0) {
            onIndexChange(selectedIndex - 1);
          } else if (loop) {
            onIndexChange(itemCount - 1);
          }
        }
      },
      ArrowDown: (e) => {
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          if (selectedIndex < itemCount - 1) {
            onIndexChange(selectedIndex + 1);
          } else if (loop) {
            onIndexChange(0);
          }
        }
      },
      ArrowLeft: (e) => {
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          if (selectedIndex > 0) {
            onIndexChange(selectedIndex - 1);
          } else if (loop) {
            onIndexChange(itemCount - 1);
          }
        }
      },
      ArrowRight: (e) => {
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          if (selectedIndex < itemCount - 1) {
            onIndexChange(selectedIndex + 1);
          } else if (loop) {
            onIndexChange(0);
          }
        }
      },
      Home: (e) => {
        e.preventDefault();
        onIndexChange(0);
      },
      End: (e) => {
        e.preventDefault();
        onIndexChange(itemCount - 1);
      },
    },
  });
} 
