/**
 * SkipLink Component
 * 
 * Provides an accessible way for keyboard users to bypass navigation
 * and repetitive elements to get directly to the main content.
 */

import React from 'react';
import { useTranslation } from '@/translations';

interface SkipLinkProps {
  targetId?: string;
  className?: string;
}

export function SkipLink({
  targetId = 'main-content',
  className,
}: SkipLinkProps) {
  const { t } = useTranslation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      // Reset tabIndex after a delay to avoid visual focus indicators
      setTimeout(() => {
        target.removeAttribute('tabindex');
      }, 100);
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:outline-offset-4 focus:outline-primary ${className || ''}`}
      onClick={handleClick}
    >
      {t('Accessibility.skipToContent', {
        defaultValue: 'Skip to main content',
      })}
    </a>
  );
} 
