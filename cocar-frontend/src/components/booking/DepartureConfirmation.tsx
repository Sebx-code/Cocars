import { useState } from 'react'
import { bookingsApi } from '../../services/api'
import { Booking } from '../../types'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Car, 
  User, 
  Shield,
  XCircle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DepartureConfirmationProps {
  booking: Booking
  userRole: 'driver' | 'passenger'
  onUpdate: (updatedBooking: Booking) => void
}

export default function DepartureConfirmation({ booking, userRole, onUpdate }: DepartureConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showNoShowModal, setShowNoShowModal] = useState(false)

  const isDriver = userRole === 'driver'

  const canConfirmDeparture = booking.status === 'confirmed' && booking.payment?.status === 'completed'
  const hasDriverConfirmed = booking.driver_confirmed_departure
  const hasPassengerConfirmed = booking.passenger_confirmed_departure
  const tripStarted = booking.trip_started

  const myConfirmation = isDriver ? hasDriverConfirmed : hasPassengerConfirmed
  const otherConfirmation = isDriver ? hasPassengerConfirmed : hasDriverConfirmed

  const handleConfirmDeparture = async () => {
    setIsLoading(true)
    try {
      const response = isDriver 
        ? await bookingsApi.confirmDepartureByDriver(booking.id)
        : await bookingsApi.confirmDepartureByPassenger(booking.id)
      
      onUpdate(response.data.data)
      toast.success(
        response.data.data.trip_started 
          ? 'Départ confirmé ! Bon voyage !' 
          : 'Départ confirmé ! En attente de l\'autre partie.'
      )
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors de la confirmation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkNoShow = async () => {
    setIsLoading(true)
    try {
      const response = await bookingsApi.markNoShow(booking.id)
      onUpdate(response.data.data)
      toast.success('Absence signalée')
      setShowNoShowModal(false)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors du signalement')
    } finally {
      setIsLoading(false)
    }
  }

  // Si le voyage a commencé
  if (tripStarted) {
    return (
      <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
            <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Voyage en cours !
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Les deux parties ont confirmé le départ. Bon voyage !
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si le passager est absent (no-show)
  if (booking.passenger_no_show) {
    return (
      <div className="card p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-800 dark:text-red-200">
              Passager absent
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Le passager a été marqué absent. Un remboursement avec pénalité a été effectué.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Si la réservation n'est pas dans un état permettant la confirmation
  if (!canConfirmDeparture) {
    return (
      <div className="card p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <Info className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Confirmation de départ non disponible
            </p>
            <p className="text-sm text-gray-500">
              {booking.status !== 'confirmed' 
                ? 'La réservation doit être confirmée'
                : 'Le paiement doit être effectué avant de confirmer le départ'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* En-tête */}
      <div className="p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Confirmation de départ</h3>
            <p className="text-sm opacity-90">
              Paiement sécurisé - Libéré une fois le voyage confirmé
            </p>
          </div>
        </div>
      </div>

      {/* Statut des confirmations */}
      <div className="p-4 space-y-4">
        {/* Explication */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Comment ça marche :</strong> L'argent du passager est sécurisé. 
            Lorsque les deux parties confirment le départ, le paiement est automatiquement 
            transféré au conducteur.
          </p>
        </div>

        {/* État des confirmations */}
        <div className="grid grid-cols-2 gap-4">
          {/* Conducteur */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            hasDriverConfirmed 
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
              : 'border-gray-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {hasDriverConfirmed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">Conducteur</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasDriverConfirmed ? 'A confirmé le départ' : 'En attente...'}
            </p>
          </div>

          {/* Passager */}
          <div className={`p-4 rounded-xl border-2 transition-all ${
            hasPassengerConfirmed 
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
              : 'border-gray-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {hasPassengerConfirmed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">Passager</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasPassengerConfirmed ? 'A confirmé le départ' : 'En attente...'}
            </p>
          </div>
        </div>

        {/* Bouton de confirmation */}
        {!myConfirmation && (
          <button
            onClick={handleConfirmDeparture}
            disabled={isLoading}
            className="w-full btn-primary py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirmation...
              </>
            ) : (
              <>
                {isDriver ? <Car className="w-5 h-5" /> : <User className="w-5 h-5" />}
                Confirmer le départ
              </>
            )}
          </button>
        )}

        {/* Message si déjà confirmé */}
        {myConfirmation && !otherConfirmation && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Vous avez confirmé. En attente de {isDriver ? 'passager' : 'conducteur'}...
            </p>
          </div>
        )}

        {/* Option no-show pour le conducteur */}
        {isDriver && !hasPassengerConfirmed && (
          <button
            onClick={() => setShowNoShowModal(true)}
            className="w-full text-center text-sm text-red-600 hover:text-red-700 dark:text-red-400 py-2"
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Signaler l'absence du passager
          </button>
        )}
      </div>

      {/* Modal No-Show */}
      {showNoShowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Signaler une absence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Êtes-vous sûr que le passager est absent ? Cette action ne peut pas être annulée.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Note :</strong> Le passager sera remboursé avec une pénalité de 500 FCFA pour son absence.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNoShowModal(false)}
                className="btn-outline flex-1"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleMarkNoShow}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmer l\'absence'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
