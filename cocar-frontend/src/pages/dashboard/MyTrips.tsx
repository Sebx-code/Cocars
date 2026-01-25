import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tripsApi } from '../../services/api'
import { Trip } from '../../types'
import { Car, Plus, Calendar, Users, MapPin, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

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

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>
  }

  return (
    <div className="animate-fadeIn">
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
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{trip.departure_city} → {trip.arrival_city}</h3>
                      <span className={`badge ${trip.status === 'active' ? 'badge-success' : trip.status === 'completed' ? 'badge-primary' : 'badge-danger'}`}>
                        {trip.status === 'active' ? 'Actif' : trip.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {trip.departure_date}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {trip.available_seats} places</span>
                    <span className="font-semibold text-primary-600">{trip.price_per_seat.toLocaleString()} FCFA</span>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setActiveMenu(activeMenu === trip.id ? null : trip.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  {activeMenu === trip.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-10">
                      <Link to={`/trips/${trip.id}`} className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <MapPin className="w-4 h-4" /> Voir détails
                      </Link>
                      <Link to={`/edit-trip/${trip.id}`} className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <Edit className="w-4 h-4" /> Modifier
                      </Link>
                      <button onClick={() => handleDelete(trip.id)} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
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
          <Car className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun trajet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Créez votre premier trajet et commencez à partager vos déplacements</p>
          <Link to="/create-trip" className="btn-primary">Créer mon premier trajet</Link>
        </div>
      )}
    </div>
  )
}
