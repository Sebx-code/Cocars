import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tripsApi } from '../../services/api'
import { Trip } from '../../types'
import TripCard from '../../components/ui/TripCard'
import { Search, MapPin, Calendar, SlidersHorizontal, Loader2 } from 'lucide-react'

export default function SearchTrips() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    departure: searchParams.get('departure') || '',
    arrival: searchParams.get('arrival') || '',
    date: searchParams.get('date') || '',
    seats: searchParams.get('seats') || '1',
    maxPrice: '',
    sortBy: 'departure_date',
  })

  useEffect(() => {
    loadTrips()
  }, [searchParams])

  const loadTrips = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filters.departure) params.departure_city = filters.departure
      if (filters.arrival) params.arrival_city = filters.arrival
      if (filters.date) params.departure_date = filters.date
      if (filters.seats) params.min_seats = filters.seats
      if (filters.maxPrice) params.max_price = filters.maxPrice
      params.sort = filters.sortBy

      const response = await tripsApi.search(params)
      setTrips(response.data.data || [])
    } catch (error) {
      console.error('Error loading trips:', error)
      setTrips([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (filters.departure) params.set('departure', filters.departure)
    if (filters.arrival) params.set('arrival', filters.arrival)
    if (filters.date) params.set('date', filters.date)
    if (filters.seats) params.set('seats', filters.seats)
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Rechercher un trajet
        </h1>

        <form onSubmit={handleSearch} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Départ
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  value={filters.departure}
                  onChange={(e) => setFilters({ ...filters, departure: e.target.value })}
                  placeholder="Ville de départ"
                  className="w-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Arrivée
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  value={filters.arrival}
                  onChange={(e) => setFilters({ ...filters, arrival: e.target.value })}
                  placeholder="Ville d'arrivée"
                  className="w-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 bg-white hover:bg-neutral-100 text-neutral-950 font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Rechercher
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/25 text-gray-700 dark:text-white p-3 rounded-full transition-all"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                  Passagers
                </label>
                <select
                  value={filters.seats}
                  onChange={(e) => setFilters({ ...filters, seats: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n} className="bg-white dark:bg-neutral-900">{n} {n === 1 ? 'passager' : 'passagers'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                  Prix max (FCFA)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="10000"
                  className="w-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/70 mb-2">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="departure_date" className="bg-white dark:bg-neutral-900">Date de départ</option>
                  <option value="price_per_seat" className="bg-white dark:bg-neutral-900">Prix</option>
                  <option value="available_seats" className="bg-white dark:bg-neutral-900">Places disponibles</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          </div>
        ) : trips.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-white/60 mb-4">
              {trips.length} trajet{trips.length > 1 ? 's' : ''} trouvé{trips.length > 1 ? 's' : ''}
            </p>
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-12 text-center">
            <Search className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun trajet trouvé
            </h3>
            <p className="text-gray-500 dark:text-white/60 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

