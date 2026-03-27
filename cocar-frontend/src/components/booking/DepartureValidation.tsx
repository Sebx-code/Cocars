import React, { useState } from 'react'
import { Booking, Trip } from '../../types'
import { bookingsApi } from '../../services/api'

interface DepartureValidationProps {
  trip: Trip
  bookings: Booking[]
  onValidated: () => void
  onClose: () => void
}

export const DepartureValidation: React.FC<DepartureValidationProps> = ({
  trip,
  bookings,
  onValidated,
  onClose
}) => {
  const [selectedCodes, setSelectedCodes] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtrer uniquement les réservations confirmées et payées avec un code passager
  const validBookings = bookings.filter(
    b => b.status === 'confirmed' && 
         b.payment?.status === 'completed' && 
         b.passenger_code !== null &&
         b.passenger_code !== undefined &&
         !b.driver_confirmed_departure // Pas déjà confirmées
  )

  const handleToggle = (code: number) => {
    setSelectedCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    )
  }

  const handleSelectAll = () => {
    setSelectedCodes(validBookings.map(b => b.passenger_code!))
  }

  const handleDeselectAll = () => {
    setSelectedCodes([])
  }

  const handleValidate = async () => {
    if (selectedCodes.length === 0) {
      setError('Veuillez sélectionner au moins un passager')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const result = await bookingsApi.validateDeparture(trip.id, {
        total_passengers: selectedCodes.length,
        passenger_codes: selectedCodes
      })

      const data = result.data.data

      // Afficher un résumé
      let message = `✓ Départ validé avec succès !\n\n`
      message += `Passagers présents : ${data.present_count}\n`
      
      if (data.absent_count > 0) {
        message += `Passagers absents : ${data.absent_count}\n\n`
        message += `Les passagers absents ont été remboursés avec une pénalité de 500 FCFA.`
      } else {
        message += `\nTous les passagers sont présents !`
      }

      alert(message)
      onValidated()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la validation')
    } finally {
      setLoading(false)
    }
  }

  if (validBookings.length === 0) {
    return (
      <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg dark:shadow-none dark:border dark:border-white/[0.07] p-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🚗 Validation du Départ</h3>
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-yellow-800 dark:text-yellow-300">
            Aucune réservation confirmée et payée à valider pour ce trajet.
          </p>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-white/10 dark:border dark:border-white/20 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-lg shadow-lg dark:shadow-none dark:border dark:border-white/[0.07] p-6 max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">🚗 Validation du Départ</h3>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
          📍 {trip.departure_city} → {trip.arrival_city}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Cochez les passagers présents dans le véhicule. Les passagers non cochés 
          seront automatiquement marqués absents et remboursés avec une pénalité de 500 FCFA.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {validBookings.map(booking => (
          <label
            key={booking.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedCodes.includes(booking.passenger_code!)
                ? 'border-green-500 bg-green-50 dark:bg-green-500/10 dark:border-green-500/50'
                : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedCodes.includes(booking.passenger_code!)}
              onChange={() => handleToggle(booking.passenger_code!)}
              className="w-5 h-5 mr-4 text-green-600 dark:text-green-500 rounded focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  #{booking.passenger_code}
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">{booking.passenger.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-white/60">
                <span>
                  {booking.seats} place{booking.seats > 1 ? 's' : ''}
                </span>
                <span>•</span>
                <span>{booking.total_price.toLocaleString()} FCFA</span>
                {booking.passenger_confirmed_departure && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">✓ A confirmé</span>
                  </>
                )}
              </div>
            </div>
            {selectedCodes.includes(booking.passenger_code!) && (
              <span className="text-green-600 dark:text-green-400 font-semibold flex items-center">
                <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Présent
              </span>
            )}
          </label>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-white/[0.02] dark:border dark:border-white/10 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-white/70 font-medium">Passagers sélectionnés :</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {selectedCodes.length} / {validBookings.length}
          </span>
        </div>
        {selectedCodes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
            <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Codes sélectionnés :</p>
            <div className="flex flex-wrap gap-2">
              {selectedCodes.sort((a, b) => a - b).map(code => (
                <span key={code} className="bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm font-semibold">
                  #{code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSelectAll}
          className="flex-1 px-4 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 font-semibold"
          disabled={loading}
        >
          Tout Sélectionner
        </button>
        <button
          onClick={handleDeselectAll}
          className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-white/70 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02]"
          disabled={loading}
        >
          Tout Désélectionner
        </button>
      </div>

      <button
        onClick={handleValidate}
        disabled={loading || selectedCodes.length === 0}
        className="w-full mt-3 px-6 py-4 bg-green-600 dark:bg-green-600/80 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Validation en cours...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ✓ Valider le Départ
          </span>
        )}
      </button>

      {selectedCodes.length < validBookings.length && (
        <p className="text-xs text-center mt-3 text-orange-600 dark:text-orange-400">
          ⚠️ {validBookings.length - selectedCodes.length} passager(s) non sélectionné(s) sera(ont) marqué(s) absent(s)
        </p>
      )}
    </div>
  )
}
