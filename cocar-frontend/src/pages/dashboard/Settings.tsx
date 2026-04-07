import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme, THEMES } from '../../contexts/ThemeContext'
import { authApi } from '../../services/api'
import { Lock, Bell, Shield, Loader2, Check, Sun, Moon, Palette } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { theme, mode, setTheme, setMode, currentThemeDef } = useTheme()
  const { logout } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setIsChangingPassword(true)
    try {
      await authApi.changePassword(passwordForm)
      toast.success('Mot de passe modifié')
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch {
      toast.error('Erreur lors du changement')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="animate-fadeIn max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>

      {/* ── Apparence & Thème ────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <Palette className="w-5 h-5" style={{ color: currentThemeDef.colors.accent }} />
          Apparence
        </h3>

        {/* Mode light / dark */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Mode d'affichage
          </p>
          <div className="flex gap-3">
            {(
              [
                { value: 'light', label: 'Clair', Icon: Sun },
                { value: 'dark', label: 'Sombre', Icon: Moon },
              ] as const
            ).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  mode === value
                    ? 'text-white border-transparent shadow-md'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
                style={
                  mode === value
                    ? {
                        background: `linear-gradient(to right, ${currentThemeDef.colors.from}, ${currentThemeDef.colors.to})`,
                        boxShadow: `0 4px 12px ${currentThemeDef.colors.ring}`,
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

        {/* Colour themes */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Couleur principale
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {THEMES.map(def => {
              const isActive = theme === def.name
              return (
                <button
                  key={def.name}
                  onClick={() => setTheme(def.name)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left"
                  style={
                    isActive
                      ? {
                          borderColor: def.colors.from,
                          background: `linear-gradient(135deg, ${def.colors.from}15, ${def.colors.to}25)`,
                        }
                      : {
                          borderColor: 'transparent',
                        }
                  }
                >
                  {/* Gradient circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${def.colors.from}, ${def.colors.to})`,
                      boxShadow: isActive ? `0 4px 12px ${def.colors.ring}` : undefined,
                    }}
                  >
                    {def.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: isActive ? def.colors.accentDark : undefined }}
                    >
                      {def.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {def.description}
                    </p>
                  </div>

                  {/* 3 colour dots */}
                  <div className="flex gap-1 shrink-0">
                    {[def.colors.from, def.colors.to, def.colors.sidebarTo].map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>

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
            })}
          </div>
        </div>

        {/* Live preview strip */}
        <div className="mt-5 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          <div
            className="h-2"
            style={{
              background: `linear-gradient(to right, ${currentThemeDef.colors.sidebarFrom}, ${currentThemeDef.colors.sidebarMid}, ${currentThemeDef.colors.sidebarTo})`,
            }}
          />
          <div className="px-4 py-3 flex items-center gap-3 bg-gray-50 dark:bg-slate-800/60">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow"
              style={{
                background: `linear-gradient(135deg, ${currentThemeDef.colors.from}, ${currentThemeDef.colors.to})`,
              }}
            >
              C
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {currentThemeDef.emoji} Thème {currentThemeDef.label} · Mode {mode === 'dark' ? 'Sombre' : 'Clair'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {currentThemeDef.description}
              </p>
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow"
              style={{
                background: `linear-gradient(to right, ${currentThemeDef.colors.from}, ${currentThemeDef.colors.to})`,
              }}
            >
              Aperçu
            </button>
          </div>
        </div>
      </div>

      {/* ── Sécurité ──────────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Sécurité
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="input"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordForm.new_password_confirmation}
              onChange={e =>
                setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })
              }
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={isChangingPassword} className="btn-primary">
            {isChangingPassword ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Modification...
              </>
            ) : (
              'Changer le mot de passe'
            )}
          </button>
        </form>
      </div>

      {/* ── Notifications ─────────────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </h3>
        <div className="space-y-4">
          {['Nouvelles réservations', 'Messages', 'Rappels de trajets'].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Zone de danger ────────────────────────────────────── */}
      <div className="card p-6 border-red-200 dark:border-red-900">
        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Zone de danger
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Actions irréversibles sur votre compte
        </p>
        <div className="flex gap-4">
          <button
            onClick={logout}
            className="btn-outline text-red-600 border-red-200 hover:bg-red-50"
          >
            Déconnexion
          </button>
          <button className="btn-outline text-red-600 border-red-200 hover:bg-red-50">
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}