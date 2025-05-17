/**
 * Screen Reader Announcer Component
 * 
 * This component provides a way to make announcements to screen readers
 * for important state changes, notifications, and other dynamic content.
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Types of announcements
type AnnouncementType = 'polite' | 'assertive';

// The announcer context
interface AnnouncerContextValue {
  announce: (message: string, type?: AnnouncementType) => void;
  clear: () => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

// Style for visually hiding content while keeping it accessible to screen readers
const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};

/**
 * The announcer component that manages live regions
 * 
 * @example
 * ```
 * function App() {
 *   return (
 *     <AnnouncerProvider>
 *       <div>
 *         <h1>My App</h1>
 *         <MainContent />
 *       </div>
 *     </AnnouncerProvider>
 *   );
 * }
 * ```
 */
interface AnnouncerProviderProps {
  children: React.ReactNode;
}

export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  // Function to make an announcement
  const announce = (message: string, type: AnnouncementType = 'polite') => {
    if (type === 'assertive') {
      setAssertiveMessage(''); // Clear first to ensure announcement if message is the same
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage(''); // Clear first to ensure announcement if message is the same
      setTimeout(() => setPoliteMessage(message), 50);
    }
  };

  // Function to clear all announcements
  const clear = () => {
    setPoliteMessage('');
    setAssertiveMessage('');
  };

  // Clear announcements when component unmounts
  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce, clear }}>
      {children}

      {/* Polite live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        style={visuallyHiddenStyle}
        data-testid="announcer-polite"
      >
        {politeMessage}
      </div>

      {/* Assertive live region */}
      <div
        aria-live="assertive"
        aria-atomic="true" 
        aria-relevant="additions text"
        style={visuallyHiddenStyle}
        data-testid="announcer-assertive"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

/**
 * Hook to use the announcer context
 * 
 * @example
 * ```
 * function TodoList() {
 *   const { announce } = useAnnouncer();
 *   
 *   const addTodo = (todo) => {
 *     // Add todo to the list
 *     announce(`Added todo: ${todo.title}`, 'polite');
 *   };
 *   
 *   return (
 *     <div>
 *       <span>Todo list UI would go here</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  
  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }
  
  return context;
}

/**
 * Component to make announcements declaratively
 * 
 * @example
 * ```
 * function Form() {
 *   const [submitted, setSubmitted] = useState(false);
 *   
 *   return (
 *     <form onSubmit={() => setSubmitted(true)}>
 *       <span>Form fields would go here</span>
 *       <button type="submit">Submit</button>
 *       
 *       {submitted && (
 *         <Announcement
 *           message="Form submitted successfully!"
 *           type="polite"
 *         />
 *       )}
 *     </form>
 *   );
 * }
 * ```
 */
interface AnnouncementProps {
  message: string;
  type?: AnnouncementType;
}

export function Announcement({ message, type = 'polite' }: AnnouncementProps) {
  const { announce } = useAnnouncer();
  
  useEffect(() => {
    if (message) {
      announce(message, type);
    }
  }, [message, type, announce]);
  
  return null;
} 
