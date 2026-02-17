import React from 'react'
import { Booking } from '../../types'

interface PassengerCodeCardProps {
  booking: Booking
}

export const PassengerCodeCard: React.FC<PassengerCodeCardProps> = ({ booking }) => {
  // N'afficher que si le passager a un code et que la réservation est confirmée
  if (!booking.passenger_code || booking.status !== 'confirmed') {
    return null
  }

  // Ne pas afficher si le voyage est déjà terminé
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-xl">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-sm font-semibold opacity-90">Votre Code Passager</p>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg py-6 px-8 mb-4">
          <div className="text-7xl font-bold tracking-wider">
            {booking.passenger_code}
          </div>
        </div>
        
        <p className="text-sm opacity-90 mb-3">
          Présentez ce code au chauffeur lors du départ
        </p>
        
        {!booking.passenger_confirmed_departure && (
          <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-4">
            <p className="text-xs font-medium">
              ⚠️ N'oubliez pas de confirmer votre présence dans l'application le jour du voyage
            </p>
          </div>
        )}
        
        {booking.passenger_confirmed_departure && !booking.trip_started && (
          <div className="bg-green-500 bg-opacity-30 rounded-lg p-3 mt-4 border border-green-300">
            <p className="text-xs font-medium">
              ✓ Vous avez confirmé votre présence. En attente de la confirmation du chauffeur.
            </p>
          </div>
        )}
        
        {booking.trip_started && (
          <div className="bg-green-500 bg-opacity-30 rounded-lg p-3 mt-4 border border-green-300">
            <p className="text-xs font-medium">
              ✓ Voyage en cours. Bon trajet !
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
