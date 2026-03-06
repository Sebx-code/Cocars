import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tripsApi } from '../../services/api'
import { Trip } from '../../types'
import { Car, Plus, Calendar, Users, Loader2, MoreVertical, Edit, Trash2, X, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface EditModalProps {
  trip: Trip
  onClose: () => void
  onSaved: (updated: Trip) => void
}

function EditTripModal({ trip, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    price_per_seat: String(trip.price_per_seat),
    available_seats: String(trip.available_seats),
    description: trip.description || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const response = await tripsApi.update(trip.id, {
        price_per_seat: Number(form.price_per_seat),
        available_seats: Number(form.available_seats),
        description: form.description,
      })
      onSaved(response.data.data)
      toast.success('Trajet mis à jour')
      onClose()
    } catch (error: any) {
      const msg = error?.response?.data?.message
        || Object.values(error?.response?.data?.errors || {}).flat().join(' ')
        || 'Erreur lors de la mise à jour'
      toast.error(msg as string)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-white/[0.07]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <Edit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white font-bold text-sm">Modifier le trajet</h2>
              <p className="text-gray-500 dark:text-white/40 text-xs">{trip.departure_city} → {trip.arrival_city}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Prix / place (FCFA)</label>
              <input
                type="number"
                value={form.price_per_seat}
                onChange={e => setForm({ ...form, price_per_seat: e.target.value })}
                className="input"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Places disponibles</label>
              <select
                value={form.available_seats}
                onChange={e => setForm({ ...form, available_seats: e.target.value })}
                className="input"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 dark:text-white/55 text-sm font-medium mb-2">Notes / Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Informations supplémentaires..."
              className="input min-h-[90px] resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Annuler
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary flex-1">
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde...</>
                : <><Save className="w-4 h-4" /> Enregistrer</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const response = await tripsApi.getMyTrips()
      setTrips(response.data.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce trajet ?')) return
    try {
      await tripsApi.delete(id)
      setTrips(trips.filter(t => t.id !== id))
      toast.success('Trajet supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleTripSaved = (updated: Trip) => {
    setTrips(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
  }

  return (
    <div className="animate-fadeIn">
      {editingTrip && (
        <EditTripModal
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSaved={handleTripSaved}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes trajets</h1>
        <Link to="/create-trip" className="btn-primary"><Plus className="w-5 h-5" /> Créer un trajet</Link>
      </div>

      {trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-header flex items-center justify-center">
                      <Car className="w-5 h-5 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{trip.departure_city} → {trip.arrival_city}</h3>
                      <span className={`badge ${trip.status === 'confirmed' || trip.status === 'in_progress' ? 'badge-success' : trip.status === 'completed' ? 'badge-primary' : trip.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {trip.status === 'pending'
                          ? 'En attente'
                          : trip.status === 'confirmed'
                            ? 'Confirmé'
                            : trip.status === 'in_progress'
                              ? 'En cours'
                              : trip.status === 'completed'
                                ? 'Terminé'
                                : 'Annulé'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-white/55">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trip.departure_date}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {trip.available_seats} places</span>
                    <span className="font-semibold text-primary-600">{trip.price_per_seat.toLocaleString()} FCFA</span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === trip.id ? null : trip.id)}
                    className="p-2 hover:bg-white/5 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400 dark:text-white/30" />
                  </button>
                  {activeMenu === trip.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-200 dark:border-white/[0.07] py-2 z-10">
                      <Link
                        to={`/trips/${trip.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-white/70 hover:bg-white/5 no-underline"
                        onClick={() => setActiveMenu(null)}
                      >
                        <Eye className="w-4 h-4" /> Voir détails
                      </Link>
                      <button
                        onClick={() => { setEditingTrip(trip); setActiveMenu(null) }}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-white/70 hover:bg-white/5 w-full text-left"
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button
                        onClick={() => { handleDelete(trip.id); setActiveMenu(null) }}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Car className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun trajet</h3>
          <p className="text-gray-500 dark:text-white/55 mb-6">Créez votre premier trajet et commencez à partager vos déplacements</p>
          <Link to="/create-trip" className="btn-primary">Créer mon premier trajet</Link>
        </div>
      )}
    </div>
  )
}
