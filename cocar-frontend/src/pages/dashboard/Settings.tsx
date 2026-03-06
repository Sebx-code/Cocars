import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { authApi } from '../../services/api'
import { Lock, Bell, Moon, Sun, Loader2, Settings as SettingsIcon, LogOut, Trash2, MessageSquare, Car, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { isDark, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [notifications, setNotifications] = useState({
    bookings: true,
    messages: true,
    reminders: true,
  })
  const [savingNotif, setSavingNotif] = useState<string | null>(null)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setIsChangingPassword(true)
    try {
      await authApi.changePassword(passwordForm)
      toast.success('Mot de passe modifié avec succès')
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (error: any) {
      const msg = error?.response?.data?.message
        || Object.values(error?.response?.data?.errors || {}).flat().join(' ') as string
        || 'Erreur lors du changement de mot de passe'
      setPasswordError(msg)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggleNotification = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key]
    setSavingNotif(key)
    try {
      await authApi.updateProfile({ [`notifications_${key}`]: newValue } as any)
      setNotifications(prev => ({ ...prev, [key]: newValue }))
      toast.success('Préférence mise à jour')
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour des notifications')
    } finally {
      setSavingNotif(null)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.'
    )
    if (!confirmed) return

    const doubleConfirm = window.confirm(
      'Dernière confirmation : voulez-vous vraiment supprimer définitivement votre compte ?'
    )
    if (!doubleConfirm) return

    setIsDeletingAccount(true)
    try {
      await authApi.updateProfile({ delete_account: true } as any)
      toast.success('Compte supprimé')
      await logout()
    } catch (error: any) {
      // Try a dedicated delete endpoint if the profile update doesn't handle it
      try {
        const api = (await import('../../services/api')).default
        await api.delete('/auth/account')
        toast.success('Compte supprimé')
        await logout()
      } catch {
        toast.error(
          error?.response?.data?.message || 'Erreur lors de la suppression du compte'
        )
      }
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const notificationItems = [
    { key: 'bookings' as const, label: 'Nouvelles réservations', description: 'Soyez notifié quand un passager réserve votre trajet', icon: Car },
    { key: 'messages' as const, label: 'Messages', description: 'Recevez une notification pour chaque nouveau message', icon: MessageSquare },
    { key: 'reminders' as const, label: 'Rappels de trajets', description: 'Rappels avant le départ de vos trajets planifiés', icon: Bell },
  ]

  return (
    <div className="animate-fadeIn max-w-2xl pb-10">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm">Gérez vos préférences et la sécurité de votre compte</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Apparence */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                {isDark ? <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-bold">Apparence</h2>
                <p className="text-gray-500 dark:text-white/40 text-sm">Personnalisez l'interface de l'application</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 dark:text-white font-medium text-sm">Mode sombre</p>
                <p className="text-gray-500 dark:text-white/40 text-sm mt-0.5">Activer le thème sombre de l'application</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${isDark ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isDark ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Sécurité */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-bold">Sécurité</h2>
                <p className="text-gray-500 dark:text-white/40 text-sm">Modifiez votre mot de passe</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}
            <div>
              <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Mot de passe actuel</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="input pl-10"
                  placeholder="Min. 8 caractères"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="password"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="pt-1">
              <button type="submit" disabled={isChangingPassword} className="btn-primary">
                {isChangingPassword
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Modification...</>
                  : <><Lock className="w-4 h-4" /> Changer le mot de passe</>
                }
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Notifications */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-gray-900 dark:text-white font-bold">Notifications</h2>
                <p className="text-gray-500 dark:text-white/40 text-sm">Choisissez ce que vous souhaitez recevoir</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/[0.07]">
            {notificationItems.map((item) => {
              const Icon = item.icon
              const enabled = notifications[item.key]
              const isSaving = savingNotif === item.key
              return (
                <div key={item.key} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-sm font-medium">{item.label}</p>
                    <p className="text-gray-500 dark:text-white/40 text-xs mt-0.5">{item.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotification(item.key)}
                    disabled={isSaving}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 disabled:opacity-60 ${enabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'}`}
                  >
                    {isSaving
                      ? <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin text-gray-400" /></div>
                      : <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${enabled ? 'translate-x-5' : ''}`} />
                    }
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 4: Zone de danger */}
        <div className="bg-white dark:bg-white/[0.03] border border-red-200 dark:border-red-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-red-100 dark:border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-red-600 dark:text-red-400 font-bold">Zone de danger</h2>
                <p className="text-gray-500 dark:text-white/40 text-sm">Actions irréversibles sur votre compte</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-gray-500 dark:text-white/40 text-sm">
              Ces actions sont permanentes et ne peuvent pas être annulées. Veuillez procéder avec prudence.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={logout}
                className="btn-outline border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="btn-outline border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
              >
                {isDeletingAccount
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Suppression...</>
                  : <><Trash2 className="w-4 h-4" /> Supprimer mon compte</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
