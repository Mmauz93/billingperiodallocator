"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useTranslation } from 'react-i18next'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)

  // Add effect to detect system preference on first load
  React.useEffect(() => {
    setMounted(true)
    
    // Check if theme is not already set in localStorage
    const storedTheme = localStorage.getItem('theme')
    if (!storedTheme) {
      // Auto-detect system preference
      setTheme('system')
    }
    
    // Add transition styles to html element for smooth theme transitions
    const html = document.documentElement
    html.style.transition = 'background-color 0.5s, color 0.5s'
    
    return () => {
      // Clean up transition styles when component unmounts
      html.style.transition = ''
    }
  }, [setTheme])

  if (!mounted) {
    return (
       <Button variant="ghost" size="icon" disabled aria-label="Toggle theme">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('ThemeToggle.toggleTheme')} className="text-foreground hover:text-primary">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('ThemeToggle.toggleTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-lg shadow-md">
        <DropdownMenuItem onClick={() => setTheme("light")} className={`cursor-pointer hover:text-primary ${theme === 'light' ? 'font-medium' : ''}`}>
          {t('ThemeToggle.light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className={`cursor-pointer hover:text-primary ${theme === 'dark' ? 'font-medium' : ''}`}>
          {t('ThemeToggle.dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className={`cursor-pointer hover:text-primary ${theme === 'system' ? 'font-medium' : ''}`}>
          {t('ThemeToggle.system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
