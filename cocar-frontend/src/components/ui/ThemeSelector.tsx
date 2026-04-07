import { useState } from 'react'
import { useTheme, THEMES } from '../../contexts/ThemeContext'
import { Sun, Moon, Palette, Check, X } from 'lucide-react'

interface ThemeSelectorProps {
  /** compact = small button that opens a popover; page = full embedded panel */
  variant?: 'compact' | 'page'
}

export default function ThemeSelector({ variant = 'compact' }: ThemeSelectorProps) {
  const { currentThemeDef } = useTheme()
  const [open, setOpen] = useState(false)

  if (variant === 'page') {
    return <ThemePanel />
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Changer de thème"
        className="relative p-2 rounded-lg hover:bg-white/80 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
      >
        <Palette
          className="w-5 h-5"
          style={{ color: currentThemeDef.colors.accent }}
        />
        {/* Active theme swatch dot */}
        <span
          className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800 shadow"
          style={{
            background: `linear-gradient(135deg, ${currentThemeDef.colors.from}, ${currentThemeDef.colors.to})`,
          }}
        />
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 animate-fadeIn">
            <ThemePanel onClose={() => setOpen(false)} compact />
          </div>
        </>
      )}
    </div>
  )
}

/* ─── Panel ─────────────────────────────────────────────────────────────── */

function ThemePanel({
  onClose,
  compact,
}: {
  onClose?: () => void
  compact?: boolean
}) {
  const { theme, mode, setTheme, setMode } = useTheme()

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden ${
        compact ? 'w-72' : 'w-full'
      }`}
    >
      {/* Header */}
      <div
        className="px-4 py-3 text-white flex items-center justify-between"
        style={{
          background: `linear-gradient(to right, ${
            THEMES.find(t => t.name === theme)!.colors.from
          }, ${THEMES.find(t => t.name === theme)!.colors.to})`,
        }}
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <span className="font-semibold text-sm">Thème de l'interface</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Mode selector */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Mode d'affichage
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'light', label: 'Clair', Icon: Sun },
                { value: 'dark', label: 'Sombre', Icon: Moon },
              ] as const
            ).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                  mode === value
                    ? 'border-transparent text-white shadow-md'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
                style={
                  mode === value
                    ? {
                        background: `linear-gradient(to right, ${
                          THEMES.find(t => t.name === theme)!.colors.from
                        }, ${THEMES.find(t => t.name === theme)!.colors.to})`,
                      }
                    : {}
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme palette */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Couleur principale
          </p>
          <div className="space-y-2">
            {THEMES.map(def => (
              <ThemeRow
                key={def.name}
                def={def}
                isActive={theme === def.name}
                onSelect={() => setTheme(def.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Individual theme row ───────────────────────────────────────────────── */

function ThemeRow({
  def,
  isActive,
  onSelect,
}: {
  def: (typeof THEMES)[number]
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border-2 ${
        isActive
          ? 'border-transparent'
          : 'border-transparent hover:border-gray-200 dark:hover:border-slate-600'
      }`}
      style={
        isActive
          ? {
              background: `linear-gradient(135deg, ${def.colors.from}18, ${def.colors.to}28)`,
              borderColor: def.colors.from,
            }
          : {}
      }
    >
      {/* Gradient swatch */}
      <div
        className="w-9 h-9 rounded-xl shadow-sm flex items-center justify-center text-base shrink-0"
        style={{
          background: `linear-gradient(135deg, ${def.colors.from}, ${def.colors.to})`,
          boxShadow: isActive ? `0 4px 12px ${def.colors.ring}` : undefined,
        }}
      >
        {def.emoji}
      </div>

      {/* Label */}
      <div className="flex-1 text-left">
        <p
          className="text-sm font-semibold"
          style={{ color: isActive ? def.colors.accentDark : undefined }}
        >
          {def.label}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {def.description}
        </p>
      </div>

      {/* Color dots preview */}
      <div className="flex gap-1 mr-1">
        {[def.colors.from, def.colors.to, def.colors.sidebarTo].map((c, i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Checkmark */}
      {isActive && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${def.colors.from}, ${def.colors.to})`,
          }}
        >
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}