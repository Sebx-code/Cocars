import { Link } from 'react-router-dom'
import { Trip } from '../../types'
import { MapPin, Calendar, Clock, Users, Star, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TripCardProps {
  trip: Trip
}

export default function TripCard({ trip }: TripCardProps) {
  const formattedDate = format(new Date(trip.departure_date), 'EEEE d MMMM', { locale: fr })
  
  return (
    <Link to={`/trips/${trip.id}`} className="card p-6 block group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Route info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Route line */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <div className="w-0.5 h-16 bg-gray-200 dark:bg-slate-700 my-2" />
              <div className="w-3 h-3 rounded-full bg-secondary-500" />
            </div>

            {/* Cities */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {trip.departure_city}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {trip.departure_time}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {trip.arrival_city}
                </p>
                {trip.arrival_time && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {trip.arrival_time}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date and seats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {trip.available_seats} places
            </span>
          </div>
        </div>

        {/* Price and driver */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {trip.price_per_seat.toLocaleString()} FCFA
            </p>
            <p className="text-sm text-gray-500">par place</p>
          </div>

          {/* Driver */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {trip.driver?.name}
              </p>
              <div className="flex items-center gap-1 justify-end text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {trip.driver?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          {trip.preferences?.luggage && (
            <span className="badge-primary">🧳 Bagages acceptés</span>
          )}
          {trip.preferences?.music && (
            <span className="badge-primary">🎵 Musique</span>
          )}
        </div>
        <span className="text-primary-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
          Voir le trajet
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
