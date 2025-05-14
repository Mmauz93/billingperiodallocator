"use client";

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * This component forces a dark theme by directly manipulating the
 * documentElement's class list and style. It also stores the
 * original theme to restore it on unmount.
 * It should be used on pages that need to override the user's
 * selected theme or system theme, specifically for dark mode.
 */
export function ForceDarkTheme() {
  const { theme: activeTheme, forcedTheme } = useTheme();

  useEffect(() => {
    // If next-themes already forces a theme, or is already dark, respect it partly
    // However, our goal is to ensure 'dark' is applied visually
    // const htmlElement = document.documentElement; // Remove this line
    
    // Store the theme that was active before forcing dark,
    // but only if it's not already dark or being forced by this component.
    // We aim to restore to 'light' or 'system' preference if they were active.
    let themeToRestore: string | undefined = undefined;
    if (activeTheme !== 'dark' && !document.documentElement.classList.contains('force-dark-active')) {
        themeToRestore = activeTheme; // Could be 'light' or 'system'
    }
    localStorage.setItem('theme-before-forced-dark', themeToRestore || 'system');

    document.documentElement.classList.add('dark', 'force-dark-active');
    document.documentElement.style.colorScheme = 'dark';

    return () => {
      // Only remove 'dark' if no other component/page is still forcing it.
      // This check is imperfect if multiple instances of ForceDarkTheme exist on different pages
      // and navigation happens between them. For this app, it's one type of page.
      document.documentElement.classList.remove('dark', 'force-dark-active');
      document.documentElement.style.colorScheme = ''; // Clear inline dark color scheme

      // Restore previous classes if needed, being careful not to remove 'dark' if system/localStorage still wants it
      // This part is tricky because the main ThemeProvider will also try to manage the 'dark' class.
      // The simplest is to remove our marker and let ThemeProvider re-evaluate.
      
      const previouslyStoredTheme = localStorage.getItem('theme-before-forced-dark');
      if (previouslyStoredTheme === 'light') {
         document.documentElement.classList.remove('dark');
         document.documentElement.style.colorScheme = 'light';
      } else if (previouslyStoredTheme === 'system') {
        // If it was system, remove 'dark' if system is not dark, otherwise let it be
        if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light'; // or '' to let browser decide
        } else {
          document.documentElement.classList.add('dark'); // Ensure it's dark if system is dark
          document.documentElement.style.colorScheme = 'dark';
        }
      }
      // If previouslyStoredTheme was 'dark' or undefined, and we removed 'dark',
      // the main ThemeProvider or anti-flicker script should re-apply it if necessary.
      localStorage.removeItem('theme-before-forced-dark');
    };
  }, [activeTheme, forcedTheme]); // Rerun if next-themes state changes

  return null; // This component does not render anything
} 
