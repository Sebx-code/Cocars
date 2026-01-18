// cocar-frontend/cocars/src/components/TripBookingsModal.tsx
import { useState, useEffect } from 'react';
import { X, User, Check, XCircle, Clock, MapPin } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../types';

interface TripBookingsModalProps {
  tripId: number;
  onClose: () => void;
}

export default function TripBookingsModal({ tripId, onClose }: TripBookingsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadBookings();
  }, [tripId]);

  const loadBookings = async () => {
    try {
      const response = await bookingService.getBookingsForTrip(tripId);
      setBookings(response.data || []);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: number) => {
    setActionLoading(bookingId);
    try {
      await bookingService.confirmBooking(bookingId);
      await loadBookings(); // Recharger la liste
    } catch (error) {
      console.error('Erreur confirmation:', error);
      alert('Erreur lors de la confirmation de la réservation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: number) => {
    const reason = prompt('Raison du refus (optionnel):');
    setActionLoading(bookingId);
    try {
      await bookingService.rejectBooking(bookingId, reason || undefined);
      await loadBookings();
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('Erreur lors du refus de la réservation');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      rejected: 'Refusée',
      cancelled: 'Annulée',
      completed: 'Terminée',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-primary rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme">
          <h2 className="text-2xl font-bold text-theme-primary">Réservations du trajet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-secondary rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-theme-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-theme-tertiary">
              <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Aucune réservation</p>
              <p className="text-sm mt-2">Aucun passager n'a encore réservé ce trajet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border-2 border-theme rounded-2xl p-4 hover:bg-theme-secondary transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-theme-primary">{booking.passenger?.name || 'Passager'}</p>
                        <p className="text-sm text-theme-tertiary">{booking.passenger?.phone}</p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-theme-tertiary">Places réservées</p>
                      <p className="font-semibold text-theme-primary">{booking.seats_booked} place(s)</p>
                    </div>
                    <div>
                      <p className="text-theme-tertiary">Prix total</p>
                      <p className="font-semibold text-theme-primary">{booking.total_price} FCFA</p>
                    </div>
                  </div>

                  {booking.pickup_point && (
                    <div className="flex items-start gap-2 mb-2 text-sm">
                      <MapPin className="w-4 h-4 text-theme-tertiary mt-0.5" />
                      <div>
                        <p className="text-theme-tertiary">Point de prise en charge</p>
                        <p className="text-theme-primary">{booking.pickup_point}</p>
                      </div>
                    </div>
                  )}

                  {booking.message && (
                    <div className="bg-theme-secondary p-3 rounded-xl mb-3 text-sm">
                      <p className="text-theme-tertiary mb-1">Message du passager :</p>
                      <p className="text-theme-primary">{booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === booking.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Traitement...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Accepter</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Refuser</span>
                      </button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-3">
                      <Check className="w-4 h-4" />
                      <span>Réservation confirmée</span>
                    </div>
                  )}

                  {booking.status === 'rejected' && booking.driver_response && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mt-3 text-sm">
                      <p className="text-red-600 dark:text-red-400 font-semibold mb-1">Raison du refus :</p>
                      <p className="text-theme-primary">{booking.driver_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
