import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, Loader2, Car, User, Phone, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (!acceptTerms) {
      toast.error('Veuillez accepter les conditions d\'utilisation')
      return
    }

    setIsLoading(true)
    try {
      await register(formData)
      navigate('/dashboard', { replace: true })
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = formData.password && formData.password === formData.password_confirmation

  return (
    <div className="animate-fadeIn">
      {/* Mobile logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="w-16 h-16 gradient-header rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CoCar</h1>
      </div>

      <div className="card p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Créer un compte
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Rejoignez la communauté CoCar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nom complet *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jean Kamga"
                className="input pl-12"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                className="input pl-12"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="699 123 456"
                className="input pl-12"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="input pl-12 pr-12"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                placeholder="••••••••"
                className={`input pl-12 pr-12 ${passwordsMatch ? 'border-green-500 focus:border-green-500' : ''}`}
                required
              />
              {passwordsMatch && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
              J'accepte les{' '}
              <a href="#" className="text-primary-600 hover:underline">conditions d'utilisation</a>
              {' '}et la{' '}
              <a href="#" className="text-primary-600 hover:underline">politique de confidentialité</a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création du compte...
              </>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
