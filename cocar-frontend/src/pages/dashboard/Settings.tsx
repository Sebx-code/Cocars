import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { authApi } from '../../services/api'
import { Lock, Bell, Moon, Sun, Shield, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { isDark, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })

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
    } catch (error) {
      toast.error('Erreur lors du changement')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="animate-fadeIn max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Paramètres</h1>

      {/* Appearance */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} Apparence
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Mode sombre</p>
            <p className="text-sm text-gray-500">Activer le thème sombre de l'application</p>
          </div>
          <button onClick={toggleTheme} className={`w-14 h-8 rounded-full p-1 transition-colors ${isDark ? 'bg-primary-500' : 'bg-gray-200'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${isDark ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Sécurité
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
            <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
            <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="input" minLength={8} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer le nouveau mot de passe</label>
            <input type="password" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} className="input" required />
          </div>
          <button type="submit" disabled={isChangingPassword} className="btn-primary">
            {isChangingPassword ? <><Loader2 className="w-5 h-5 animate-spin" /> Modification...</> : 'Changer le mot de passe'}
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notifications
        </h3>
        <div className="space-y-4">
          {['Nouvelles réservations', 'Messages', 'Rappels de trajets'].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600" />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-200 dark:border-red-900">
        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Zone de danger
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Actions irréversibles sur votre compte</p>
        <div className="flex gap-4">
          <button onClick={logout} className="btn-outline text-red-600 border-red-200 hover:bg-red-50">Déconnexion</button>
          <button className="btn-outline text-red-600 border-red-200 hover:bg-red-50">Supprimer mon compte</button>
        </div>
      </div>
    </div>
  )
}
