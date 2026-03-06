import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../services/api'
import { User, Mail, Phone, Camera, Loader2, Save, Trash2, Star, MapPin, Calendar } from 'lucide-react'
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
    bio: (user as any)?.bio || '',
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
      return
    }

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
      const updatedUser = { ...user! }
      delete updatedUser.avatar
      updateUser(updatedUser)
      toast.success('Photo de profil supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <div className="animate-fadeIn max-w-5xl">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon profil</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm">Gérez vos informations personnelles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: avatar + stats */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Avatar card */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-6 flex flex-col items-center text-center">
            {/* Avatar with upload overlay */}
            <div className="relative mb-4">
              {user?.avatar ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/storage/${user.avatar}`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-white/[0.07]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-gray-100 dark:ring-white/[0.07]">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full shadow-lg flex items-center justify-center border border-gray-200 dark:border-white/[0.07] hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-gray-600 dark:text-white/60 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-600 dark:text-white/60" />
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

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-white/40 text-sm mb-3">{user?.email}</p>
            {(user as any)?.email_verified_at ? (
              <span className="badge badge-success">Compte vérifié</span>
            ) : (
              <span className="badge badge-warning">Non vérifié</span>
            )}

            {user?.avatar && (
              <button
                onClick={handleAvatarDelete}
                disabled={isUploadingAvatar}
                className="mt-4 text-xs text-red-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer la photo
              </button>
            )}
          </div>

          {/* Stats card */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.07]">
              <p className="text-gray-900 dark:text-white font-bold text-sm">Statistiques</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/[0.07]">
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 dark:text-white/55 text-xs font-medium">Trajets effectués</p>
                  <p className="text-gray-900 dark:text-white font-bold text-sm">{(user as any)?.trips_count ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 dark:text-white/55 text-xs font-medium">Note moyenne</p>
                  <p className="text-gray-900 dark:text-white font-bold text-sm">{(user as any)?.average_rating ? `${(user as any).average_rating}/5` : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 dark:text-white/55 text-xs font-medium">Membre depuis</p>
                  <p className="text-gray-900 dark:text-white font-bold text-sm capitalize">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: edit form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
            {/* Section: Informations personnelles */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-gray-900 dark:text-white font-bold">Informations personnelles</h2>
                  <p className="text-gray-500 dark:text-white/40 text-sm">Mettez à jour vos données de profil</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom"
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="699 123 456"
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-white/[0.07]" />

            {/* Section: Biographie */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
              <h2 className="text-gray-900 dark:text-white font-bold">Biographie</h2>
              <p className="text-gray-500 dark:text-white/40 text-sm">Présentez-vous aux autres membres</p>
            </div>
            <div className="p-6">
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Parlez de vous, de vos habitudes de conduite, de ce que vous aimez pendant les trajets..."
                className="input min-h-[120px] resize-none"
              />
            </div>

            {/* Footer: save button */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.07] flex justify-end">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                  : <><Save className="w-4 h-4" /> Enregistrer les modifications</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
