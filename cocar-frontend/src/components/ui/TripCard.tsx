import { Link } from 'react-router-dom'
import { Trip } from '../../types'
import { Calendar, Clock, Users, Star, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CredibilityStars } from '../credibility/CredibilityStars'
import { CredibilityBadge } from '../credibility/CredibilityBadge'

interface TripCardProps {
  trip: Trip
}

export default function TripCard({ trip }: TripCardProps) {
  const formattedDate = format(new Date(trip.departure_date), 'EEEE d MMMM', { locale: fr })

  return (
    <Link to={`/trips/${trip.id}`} className="group bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] border border-gray-200 dark:border-white/[0.07] hover:border-gray-300 dark:hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 block no-underline">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Route info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Route line */}
            <div className="flex flex-col items-center pt-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="w-0.5 h-16 bg-gray-200 dark:bg-white/10 my-2" />
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>

            {/* Cities */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {trip.departure_city}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/50 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {trip.departure_time}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {trip.arrival_city}
                </p>
                {trip.arrival_time && (
                  <p className="text-sm text-gray-500 dark:text-white/50 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {trip.arrival_time}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date and seats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-white/60">
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
            <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
              {trip.price_per_seat.toLocaleString()} FCFA
            </p>
            <p className="text-sm text-gray-500 dark:text-white/50">par place</p>
          </div>

          {/* Driver */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {trip.driver?.name}
              </p>

              {/* Étoiles de crédibilité si disponibles */}
              {trip.driver?.credibility_stars ? (
                <div className="flex items-center gap-2 justify-end">
                  <CredibilityStars
                    stars={trip.driver.credibility_stars}
                    points={trip.driver.credibility_points}
                    size="sm"
                    showPoints={false}
                  />
                  {trip.driver.credibility_stars >= 4 && (
                    <CredibilityBadge
                      stars={trip.driver.credibility_stars}
                      size="sm"
                      showIcon
                      showText={false}
                    />
                  )}
                </div>
              ) : (
                // Ancienne note si crédibilité non disponible
                <div className="flex items-center gap-1 justify-end text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm">{trip.driver?.rating?.toFixed(1) || '4.8'}</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
              {trip.driver?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          {trip.preferences?.luggage && (
            <span className="bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 text-xs px-3 py-1.5 rounded-full">🧳 Bagages acceptés</span>
          )}
          {trip.preferences?.music && (
            <span className="bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/70 text-xs px-3 py-1.5 rounded-full">🎵 Musique</span>
          )}
        </div>
        <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
          Voir le trajet
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
