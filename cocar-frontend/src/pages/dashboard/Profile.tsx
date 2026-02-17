import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../services/api'
import { User, Mail, Phone, Camera, Loader2, Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
      return
    }

    // Vérifier le type
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
      toast.error('Format d\'image non supporté')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await authApi.uploadAvatar(formData)
      updateUser({ ...user!, avatar: response.data.data.avatar })
      toast.success('Photo de profil mise à jour')
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return
    
    if (!confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) return

    setIsUploadingAvatar(true)
    try {
      await authApi.deleteAvatar()
      updateUser({ ...user!, avatar: null })
      toast.success('Photo de profil supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <div className="animate-fadeIn max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Mon profil</h1>

      <div className="card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={`${import.meta.env.VITE_API_URL}/storage/${user.avatar}`} 
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-gray-600 dark:text-gray-300 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <span className="badge badge-success mt-2">Compte vérifié</span>
            {user?.avatar && (
              <button
                onClick={handleAvatarDelete}
                disabled={isUploadingAvatar}
                className="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer la photo
              </button>
            )}
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
