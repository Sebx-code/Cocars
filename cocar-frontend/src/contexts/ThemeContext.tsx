import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'

// ─── Theme definitions ───────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark'

export type ThemeName =
  | 'emerald'
  | 'ocean'
  | 'sunset'
  | 'violet'
  | 'rose'
  | 'gold'

export interface ThemeDefinition {
  name: ThemeName
  label: string
  description: string
  emoji: string
  colors: {
    from: string
    to: string
    mid?: string
    sidebarFrom: string
    sidebarMid: string
    sidebarTo: string
    accent: string
    accentDark: string
    ring: string
    text: string
    badge: string
    badgeText: string
  }
}

export const THEMES: ThemeDefinition[] = [
  {
    name: 'emerald',
    label: 'Emeraude',
    description: 'Vert nature & fraîcheur',
    emoji: '🌿',
    colors: {
      from: '#10b981',
      to: '#14b8a6',
      mid: '#059669',
      sidebarFrom: '#10b981',
      sidebarMid: '#059669',
      sidebarTo: '#0f766e',
      accent: '#10b981',
      accentDark: '#059669',
      ring: 'rgba(16, 185, 129, 0.35)',
      text: '#059669',
      badge: '#d1fae5',
      badgeText: '#065f46',
    },
  },
  {
    name: 'ocean',
    label: 'Océan',
    description: 'Bleu profond & cyan',
    emoji: '🌊',
    colors: {
      from: '#0ea5e9',
      to: '#06b6d4',
      mid: '#0284c7',
      sidebarFrom: '#0ea5e9',
      sidebarMid: '#0284c7',
      sidebarTo: '#0369a1',
      accent: '#0ea5e9',
      accentDark: '#0284c7',
      ring: 'rgba(14, 165, 233, 0.35)',
      text: '#0284c7',
      badge: '#e0f2fe',
      badgeText: '#075985',
    },
  },
  {
    name: 'sunset',
    label: 'Coucher de soleil',
    description: 'Orange chaleureux & corail',
    emoji: '🌅',
    colors: {
      from: '#f97316',
      to: '#ef4444',
      mid: '#ea580c',
      sidebarFrom: '#f97316',
      sidebarMid: '#ea580c',
      sidebarTo: '#c2410c',
      accent: '#f97316',
      accentDark: '#ea580c',
      ring: 'rgba(249, 115, 22, 0.35)',
      text: '#ea580c',
      badge: '#fff7ed',
      badgeText: '#9a3412',
    },
  },
  {
    name: 'violet',
    label: 'Violet',
    description: 'Violet mystique & fuchsia',
    emoji: '🔮',
    colors: {
      from: '#8b5cf6',
      to: '#d946ef',
      mid: '#7c3aed',
      sidebarFrom: '#8b5cf6',
      sidebarMid: '#7c3aed',
      sidebarTo: '#6d28d9',
      accent: '#8b5cf6',
      accentDark: '#7c3aed',
      ring: 'rgba(139, 92, 246, 0.35)',
      text: '#7c3aed',
      badge: '#f5f3ff',
      badgeText: '#5b21b6',
    },
  },
  {
    name: 'rose',
    label: 'Rose',
    description: 'Rose vif & rubis',
    emoji: '🌸',
    colors: {
      from: '#f43f5e',
      to: '#fb7185',
      mid: '#e11d48',
      sidebarFrom: '#f43f5e',
      sidebarMid: '#e11d48',
      sidebarTo: '#be123c',
      accent: '#f43f5e',
      accentDark: '#e11d48',
      ring: 'rgba(244, 63, 94, 0.35)',
      text: '#e11d48',
      badge: '#fff1f2',
      badgeText: '#9f1239',
    },
  },
  {
    name: 'gold',
    label: 'Or',
    description: 'Ambré luxueux & doré',
    emoji: '✨',
    colors: {
      from: '#f59e0b',
      to: '#d97706',
      mid: '#d97706',
      sidebarFrom: '#f59e0b',
      sidebarMid: '#d97706',
      sidebarTo: '#b45309',
      accent: '#f59e0b',
      accentDark: '#d97706',
      ring: 'rgba(245, 158, 11, 0.35)',
      text: '#d97706',
      badge: '#fffbeb',
      badgeText: '#92400e',
    },
  },
]

// ─── Context ────────────────────────────────────────────────────────────────

interface ThemeContextType {
  theme: ThemeName
  mode: ThemeMode
  isDark: boolean
  currentThemeDef: ThemeDefinition
  setTheme: (name: ThemeName) => void
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
  // Legacy compat
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ─── CSS variable injection ──────────────────────────────────────────────────

function applyTheme(def: ThemeDefinition, mode: ThemeMode) {
  const root = document.documentElement
  const c = def.colors

  root.setAttribute('data-theme', def.name)
  root.setAttribute('data-mode', mode)

  // gradient vars
  root.style.setProperty('--theme-from', c.from)
  root.style.setProperty('--theme-to', c.to)
  root.style.setProperty('--theme-mid', c.mid ?? c.from)
  root.style.setProperty('--theme-sidebar-from', c.sidebarFrom)
  root.style.setProperty('--theme-sidebar-mid', c.sidebarMid)
  root.style.setProperty('--theme-sidebar-to', c.sidebarTo)
  root.style.setProperty('--theme-accent', c.accent)
  root.style.setProperty('--theme-accent-dark', c.accentDark)
  root.style.setProperty('--theme-ring', c.ring)
  root.style.setProperty('--theme-text', c.text)
  root.style.setProperty('--theme-badge', c.badge)
  root.style.setProperty('--theme-badge-text', c.badgeText)

  // dark mode
  if (mode === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem('cocar-theme') as ThemeName) || 'emerald'
  })
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cocar-mode') as ThemeMode | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const currentThemeDef = THEMES.find(t => t.name === theme) ?? THEMES[0]

  useEffect(() => {
    applyTheme(currentThemeDef, mode)
    localStorage.setItem('cocar-theme', theme)
    localStorage.setItem('cocar-mode', mode)
  }, [theme, mode, currentThemeDef])

  const setTheme = (name: ThemeName) => setThemeState(name)
  const toggleMode = useCallback(() => setModeState(m => (m === 'dark' ? 'light' : 'dark')), [])
  const setMode = useCallback((m: ThemeMode) => setModeState(m), [])

  const value = useMemo(() => ({
    theme,
    mode,
    isDark: mode === 'dark',
    currentThemeDef,
    setTheme,
    toggleMode,
    setMode,
    toggleTheme: toggleMode, // Legacy compat
  }), [theme, mode, currentThemeDef, setTheme, toggleMode, setMode])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}