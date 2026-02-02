import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { feedApi } from '../../services/api'
import { Trip } from '../../types'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString()
  } catch {
    return dateStr
  }
}

export default function Feed() {
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<Trip[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await feedApi.get({ per_page: 10 })
        if (!mounted) return
        // backend renvoie parfois {data: items, meta: ...} mais notre ApiResponse<T> simplifie.
        // Ici, on supporte les deux formats.
        const payload: any = res.data
        const list = payload?.data ?? []
        setTrips(list)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.response?.data?.message || 'Erreur lors du chargement du fil')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fil d’actualité</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Les trajets publiés récemment par les chauffeurs</p>
        </div>
        <Link
          to="/search"
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
        >
          Rechercher
        </Link>
      </div>

      {loading && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          Chargement…
        </div>
      )}

      {error && (
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          Aucun trajet publié pour le moment.
        </div>
      )}

      <div className="space-y-5">
        {trips.map((trip) => {
          const photos = trip.vehicle?.photos || []
          const primary = photos.find((p) => p.is_primary) || photos[0]

          return (
            <div key={trip.id} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-argon">
              {primary?.url && (
                <div className="h-56 bg-gray-100 dark:bg-slate-700">
                  <img src={primary.url} alt="Véhicule" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Publié par</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {trip.driver?.name}
                      {trip.driver?.rating ? (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({Number(trip.driver.rating).toFixed(1)})</span>
                      ) : null}
                    </div>
                  </div>

                  <Link to={`/trips/${trip.id}`} className="btn-primary">
                    Voir le trajet
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Départ</div>
                    <div className="font-medium text-gray-900 dark:text-white">{trip.departure_city}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Arrivée</div>
                    <div className="font-medium text-gray-900 dark:text-white">{trip.arrival_city}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/40">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Date</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatDate(trip.departure_date)} • {trip.departure_time}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                    {trip.price_per_seat} FCFA / place
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700/50">
                    {trip.available_seats} places dispo
                  </span>
                  {trip.vehicle && (
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700/50">
                      Véhicule: {trip.vehicle.brand} {trip.vehicle.model} ({trip.vehicle.color})
                    </span>
                  )}
                </div>

                {trip.description && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300">{trip.description}</p>
                )}

                {photos.length > 1 && (
                  <div className="mt-5">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Autres photos</div>
                    <div className="flex gap-2 overflow-x-auto">
                      {photos.slice(0, 6).map((p) => (
                        <img
                          key={p.id}
                          src={p.url}
                          alt="Véhicule"
                          className="w-20 h-16 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
