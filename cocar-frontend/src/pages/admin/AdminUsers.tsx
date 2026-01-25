import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { 
  Search, Filter, UserCheck, UserX, Trash2, 
  Mail, Phone, Calendar, Star, ChevronLeft, ChevronRight,
  Shield, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserWithCounts {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  is_verified: boolean
  rating?: number
  created_at: string
  trips_as_driver_count: number
  bookings_count: number
  ratings_received_count: number
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithCounts[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [currentPage, roleFilter, verifiedFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = { page: currentPage }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (verifiedFilter) params.is_verified = verifiedFilter
      
      const response = await adminApi.getUsers(params)
      const data = response.data as unknown as { data: UserWithCounts[], meta: PaginationMeta }
      setUsers(data.data)
      setMeta(data.meta)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUsers()
  }

  const handleVerifyUser = async (user: UserWithCounts) => {
    try {
      await adminApi.verifyUser(user.id)
      toast.success(`${user.name} a été vérifié`)
      loadUsers()
    } catch (error) {
      toast.error('Erreur lors de la vérification')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    try {
      await adminApi.deleteUser(selectedUser.id)
      toast.success(`${selectedUser.name} a été supprimé`)
      setShowDeleteModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {meta?.total || 0} utilisateurs au total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email ou téléphone..."
                className="input pl-10"
              />
            </div>
          </form>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="input w-40"
            >
              <option value="">Tous les rôles</option>
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Verified Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => { setVerifiedFilter(e.target.value); setCurrentPage(1); }}
            className="input w-40"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Vérifié</option>
            <option value="false">Non vérifié</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statistiques</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                              {user.name}
                              {user.role === 'admin' && (
                                <Shield className="w-4 h-4 text-red-500" />
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.trips_as_driver_count || 0} trajets
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.bookings_count || 0} résa.
                          </span>
                          {user.rating && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              {Number(user.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {user.is_verified ? (
                          <span className="badge badge-success">Vérifié</span>
                        ) : (
                          <span className="badge badge-warning">Non vérifié</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {!user.is_verified && (
                            <button
                              onClick={() => handleVerifyUser(user)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Vérifier"
                            >
                              <UserCheck className="w-5 h-5" />
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-sm text-gray-500">
                  Page {meta.current_page} sur {meta.last_page} ({meta.total} résultats)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={meta.current_page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                    disabled={meta.current_page === meta.last_page}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <UserX className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Supprimer l'utilisateur</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedUser.name}</strong> ? 
              Tous ses trajets et réservations seront annulés.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                className="btn-outline flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="btn-danger flex-1"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
