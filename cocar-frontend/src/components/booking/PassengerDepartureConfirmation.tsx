import React, { useState } from 'react'
import { Booking } from '../../types'
import { bookingsApi } from '../../services/api'

interface PassengerDepartureConfirmationProps {
  booking: Booking
  onConfirmed: () => void
}

export const PassengerDepartureConfirmation: React.FC<PassengerDepartureConfirmationProps> = ({
  booking,
  onConfirmed
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si déjà confirmé par le passager
  if (booking.passenger_confirmed_departure) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
        <div className="flex items-center justify-center text-green-700">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="font-semibold">Vous avez confirmé votre présence</p>
        </div>
        {booking.trip_started && (
          <p className="text-sm text-green-600 mt-2 text-center">
            Le voyage est en cours. Bon trajet ! 🚗
          </p>
        )}
        {!booking.trip_started && booking.driver_confirmed_departure && (
          <p className="text-sm text-green-600 mt-2 text-center">
            Le chauffeur a également confirmé. Le voyage va bientôt démarrer !
          </p>
        )}
        {!booking.trip_started && !booking.driver_confirmed_departure && (
          <p className="text-sm text-green-600 mt-2 text-center">
            En attente de la confirmation du chauffeur...
          </p>
        )}
      </div>
    )
  }

  // Vérifier si c'est le jour du voyage
  const isDepartureDay = () => {
    const departureDate = new Date(booking.trip.departure_date)
    const today = new Date()
    return departureDate.toDateString() === today.toDateString()
  }

  // Vérifier si le voyage est dans le passé
  const isPastTrip = () => {
    const departureDate = new Date(booking.trip.departure_date)
    const today = new Date()
    return departureDate < today
  }

  if (isPastTrip()) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">Ce voyage est terminé</p>
      </div>
    )
  }

  if (!isDepartureDay()) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center text-blue-700 mb-2">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Confirmation disponible le jour du voyage</p>
        </div>
        <p className="text-sm text-blue-600">
          Date de départ : {new Date(booking.trip.departure_date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    )
  }

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError(null)
      await bookingsApi.confirmDepartureByPassenger(booking.id)
      onConfirmed()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la confirmation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-8 h-8 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold">Confirmation Requise</h3>
        </div>
        
        <p className="text-lg mb-4">
          Êtes-vous en route pour ce trajet ?
        </p>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4 text-sm">
          <p className="font-semibold mb-2">
            ⚠️ Important
          </p>
          <p>
            Si vous ne confirmez pas votre présence, vous serez considéré comme absent 
            et remboursé avec une pénalité de <strong>500 FCFA</strong>.
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-300 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-white text-orange-600 px-6 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirmation en cours...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ✓ Je suis en route
            </span>
          )}
        </button>
        
        <p className="text-xs mt-3 opacity-75">
          En confirmant, vous attestez être présent(e) dans le véhicule ou prêt(e) à partir
        </p>
      </div>
    </div>
  )
}
