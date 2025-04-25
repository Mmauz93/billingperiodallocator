'use client'

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const changeLanguage = (lng: 'en' | 'de') => {
    i18n.changeLanguage(lng);
  };

  // Avoid hydration mismatch by not rendering full component on server/initial client render
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Languages className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language"> {/* TODO: Add translation key for aria-label */}
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
            onClick={() => changeLanguage("en")} 
            disabled={i18n.language.startsWith('en')}
        >
           English
        </DropdownMenuItem>
        <DropdownMenuItem 
            onClick={() => changeLanguage("de")} 
            disabled={i18n.language.startsWith('de')}
        >
          Deutsch
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
