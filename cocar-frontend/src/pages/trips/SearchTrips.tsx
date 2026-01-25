import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { tripsApi } from '../../services/api'
import { Trip } from '../../types'
import TripCard from '../../components/ui/TripCard'
import { Search, MapPin, Calendar, Users, SlidersHorizontal, Loader2, Car } from 'lucide-react'

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

        <form onSubmit={handleSearch} className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Départ
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.departure}
                  onChange={(e) => setFilters({ ...filters, departure: e.target.value })}
                  placeholder="Ville de départ"
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arrivée
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.arrival}
                  onChange={(e) => setFilters({ ...filters, arrival: e.target.value })}
                  placeholder="Ville d'arrivée"
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1">
                <Search className="w-5 h-5" />
                Rechercher
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline p-3"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passagers
                </label>
                <select
                  value={filters.seats}
                  onChange={(e) => setFilters({ ...filters, seats: e.target.value })}
                  className="input"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'passager' : 'passagers'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix max (FCFA)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="10000"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="input"
                >
                  <option value="departure_date">Date de départ</option>
                  <option value="price_per_seat">Prix</option>
                  <option value="available_seats">Places disponibles</option>
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
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          </div>
        ) : trips.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {trips.length} trajet{trips.length > 1 ? 's' : ''} trouvé{trips.length > 1 ? 's' : ''}
            </p>
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Car className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aucun trajet trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
