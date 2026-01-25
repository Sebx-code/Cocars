import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tripsApi, bookingsApi } from '../../services/api'
import { Trip } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MapPin, Calendar, Clock, Users, Car, Star, MessageSquare, 
  Loader2, ArrowLeft, CheckCircle, XCircle, Music, Dog, Cigarette, Luggage 
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [seats, setSeats] = useState(1)

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await tripsApi.getById(Number(id))
      setTrip(response.data.data)
    } catch (error) {
      toast.error('Trajet non trouvé')
      navigate('/search')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/trips/${id}` } } })
      return
    }

    setIsBooking(true)
    try {
      await bookingsApi.create({ trip_id: Number(id), seats_booked: seats })
      toast.success('Réservation envoyée avec succès !')
      navigate('/my-bookings')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors de la réservation')
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
      </div>
    )
  }

  if (!trip) return null

  const isOwner = user?.id === trip.driver_id
  const formattedDate = format(new Date(trip.departure_date), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route card */}
          <div className="card p-8">
            <div className="flex items-start gap-6">
              {/* Route line */}
              <div className="flex flex-col items-center pt-2">
                <div className="w-4 h-4 rounded-full bg-primary-500" />
                <div className="w-0.5 h-24 bg-gray-200 dark:bg-slate-700 my-3" />
                <div className="w-4 h-4 rounded-full bg-secondary-500" />
              </div>

              {/* Cities */}
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    {trip.departure_time}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {trip.departure_city}
                  </h2>
                  {trip.departure_address && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{trip.departure_address}</p>
                  )}
                </div>
                <div>
                  {trip.arrival_time && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" />
                      {trip.arrival_time}
                    </p>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {trip.arrival_city}
                  </h2>
                  {trip.arrival_address && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{trip.arrival_address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5 text-primary-500" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5 text-primary-500" />
                {trip.available_seats} places disponibles
              </div>
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{trip.description}</p>
            </div>
          )}

          {/* Preferences */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Préférences du conducteur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Cigarette className={`w-5 h-5 ${trip.preferences?.smoking ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {trip.preferences?.smoking ? 'Fumeur accepté' : 'Non fumeur'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Music className={`w-5 h-5 ${trip.preferences?.music ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {trip.preferences?.music ? 'Musique OK' : 'Pas de musique'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Dog className={`w-5 h-5 ${trip.preferences?.pets ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {trip.preferences?.pets ? 'Animaux acceptés' : 'Pas d\'animaux'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Luggage className="w-5 h-5 text-primary-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Bagages: {trip.preferences?.luggage || 'Moyen'}
                </span>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          {trip.vehicle && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Véhicule</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <Car className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {trip.vehicle.brand} {trip.vehicle.model}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {trip.vehicle.color} • {trip.vehicle.seats} places
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & booking */}
          <div className="card p-6">
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-primary-600">
                {trip.price_per_seat.toLocaleString()} FCFA
              </p>
              <p className="text-gray-500 dark:text-gray-400">par passager</p>
            </div>

            {!isOwner && trip.status === 'active' && trip.available_seats > 0 && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de places
                  </label>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="input"
                  >
                    {Array.from({ length: trip.available_seats }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} place{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="py-4 border-t border-b border-gray-200 dark:border-slate-700 mb-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                    <span>{trip.price_per_seat.toLocaleString()} FCFA x {seats}</span>
                    <span>{(trip.price_per_seat * seats).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{(trip.price_per_seat * seats).toLocaleString()} FCFA</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="btn-primary w-full"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Réservation...
                    </>
                  ) : (
                    'Réserver maintenant'
                  )}
                </button>
              </>
            )}

            {isOwner && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                C'est votre trajet
              </p>
            )}
          </div>

          {/* Driver */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Conducteur</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {trip.driver?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{trip.driver?.name}</p>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.8</span>
                  <span className="text-gray-400 ml-1">(24 avis)</span>
                </div>
              </div>
            </div>
            <button className="btn-outline w-full">
              <MessageSquare className="w-5 h-5" />
              Contacter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
