/**
 * useFocusTrap Hook
 * 
 * A React hook that traps focus within a specified element.
 * This is important for modals, dialogs, and other overlay components
 * to ensure keyboard navigation stays within the focused element.
 */

import { useCallback, useEffect, useRef } from 'react';

// List of focusable selectors
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details',
  'summary',
  '[contenteditable="true"]',
].join(',');

interface UseFocusTrapOptions {
  isActive?: boolean;
  autoFocus?: boolean;
  returnFocusOnDeactivate?: boolean;
  onEscape?: () => void;
}

/**
 * Hook that traps focus within a container
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose
 *   });
 *   
 *   if (!isOpen) return null;
 *   
 *   return (
 *     <div ref={modalRef} className="modal">
 *       <button>Focusable element</button>
 *       <button>Another focusable element</button>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap({
  isActive = true,
  autoFocus = true,
  returnFocusOnDeactivate = true,
  onEscape
}: UseFocusTrapOptions = {}): React.RefObject<HTMLElement | null> {
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  // Find all focusable elements
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    ).filter(element => element.offsetWidth > 0 && element.offsetHeight > 0);
  }, []);

  // Focus the first element in the container
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else if (containerRef.current) {
      // If no focusable elements, focus the container itself
      containerRef.current.setAttribute('tabindex', '-1');
      containerRef.current.focus();
    }
  }, [getFocusableElements]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current || !isActive) return;

    // Handle Escape
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Handle Tab
    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements();
      
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Shift + Tab navigation
      if (event.shiftKey) {
        // If the active element is the first item, cycle to the last focusable item
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } 
      // Tab navigation
      else {
        // If the active element is the last item, cycle to the first focusable item
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isActive, getFocusableElements, onEscape]);

  // Set up focus trap when component mounts or isActive changes
  useEffect(() => {
    if (!isActive) return;

    // Store currently focused element to restore it later
    previouslyFocusedElement.current = document.activeElement;

    // Auto-focus the first focusable element
    if (autoFocus) {
      setTimeout(focusFirstElement, 0);
    }

    // Add keydown event listener
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, autoFocus, focusFirstElement, handleKeyDown]);

  // Restore focus to previously focused element when component unmounts
  useEffect(() => {
    return () => {
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        // Ensure it's an HTMLElement
        if (previouslyFocusedElement.current instanceof HTMLElement) {
          previouslyFocusedElement.current.focus();
        }
      }
    };
  }, [returnFocusOnDeactivate]);

  return containerRef;
} 
