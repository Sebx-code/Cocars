import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { feedApi } from '../../services/api'
import { Trip } from '../../types'
import TripCard from '../../components/ui/TripCard'
import { MapPin, AlertCircle } from 'lucide-react'

function TripCardSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-2xl p-6 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Route info skeleton */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="w-0.5 h-16 bg-gray-200 dark:bg-white/10 my-2" />
              <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded w-20" />
              </div>
              <div>
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded w-20" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded w-28" />
            <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded w-20" />
          </div>
        </div>
        {/* Price & driver skeleton */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4">
          <div>
            <div className="h-7 bg-gray-200 dark:bg-white/10 rounded w-36 mb-1" />
            <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded w-16" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24 mb-1" />
              <div className="h-3 bg-gray-100 dark:bg-white/[0.05] rounded w-16" />
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      </div>
      {/* Footer skeleton */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 dark:bg-white/[0.05] rounded-full w-32" />
        </div>
        <div className="h-4 bg-gray-100 dark:bg-white/[0.05] rounded w-24" />
      </div>
    </div>
  )
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
        const payload: any = res.data
        const list = payload?.data ?? []
        setTrips(list)
      } catch (e: any) {
        if (!mounted) return
        setError(e?.response?.data?.message || 'Erreur lors du chargement du fil')
      } finally {
        if (mounted) setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fil d'actualité</h1>
          <p className="text-gray-500 dark:text-white/60 mt-1">Les trajets publiés récemment par les chauffeurs</p>
        </div>
        <Link
          to="/search"
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 hover:border-emerald-400 hover:text-emerald-500 transition-colors no-underline"
        >
          Rechercher
        </Link>
      </div>

      {/* Skeleton loading */}
      {loading && (
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-500 font-medium mb-1">Une erreur est survenue</p>
          <p className="text-sm text-gray-500 dark:text-white/40 text-center">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
            <MapPin className="w-10 h-10 text-gray-400 dark:text-white/30" />
          </div>
          <p className="text-gray-700 dark:text-white/70 font-medium mb-1">Aucun trajet publié</p>
          <p className="text-sm text-gray-400 dark:text-white/30 text-center">
            Il n'y a aucun trajet disponible pour le moment. Revenez plus tard !
          </p>
        </div>
      )}

      {/* Trip list using TripCard component */}
      {!loading && !error && trips.length > 0 && (
        <div className="space-y-5">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
