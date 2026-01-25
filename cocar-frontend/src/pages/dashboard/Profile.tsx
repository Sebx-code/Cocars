import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../services/api'
import { User, Mail, Phone, Camera, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await authApi.updateProfile(formData)
      updateUser(response.data.data)
      toast.success('Profil mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fadeIn max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Mon profil</h1>

      <div className="card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-slate-600 hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <span className="badge badge-success mt-2">Compte vérifié</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input pl-10" placeholder="699 123 456" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : <><Save className="w-5 h-5" /> Enregistrer</>}
          </button>
        </form>
      </div>
    </div>
  )
}
