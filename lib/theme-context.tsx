'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeType, getCSSVariables, getThemeColors } from './themes'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  colors: ReturnType<typeof getThemeColors>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('discipline')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as ThemeType
    if (savedTheme && ['discipline', 'struggle', 'performance', 'warrior'].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
  }, [])

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Apply CSS variables
    const cssVars = getCSSVariables(newTheme)
    Object.entries(cssVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme)
      const cssVars = getCSSVariables(theme)
      Object.entries(cssVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value)
      })
    }
  }, [theme, mounted])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: getThemeColors(theme) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
