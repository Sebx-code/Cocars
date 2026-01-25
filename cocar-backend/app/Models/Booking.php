<?php

namespace App\Models;

use App\Events\BookingStatusChanged;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    // Statuts de réservation
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_REJECTED = 'rejected';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_IN_PROGRESS = 'in_progress';

    protected $fillable = [
        'trip_id',
        'passenger_id',
        'seats_booked',
        'total_price',
        'status',
        'message',
        'driver_response',
        'pickup_point',
        'dropoff_point',
        'cancellation_reason',
        // Confirmation de départ
        'driver_confirmed_departure',
        'passenger_confirmed_departure',
        'driver_departure_confirmed_at',
        'passenger_departure_confirmed_at',
        'trip_started',
        'trip_started_at',
        'passenger_no_show',
        'marked_no_show_at',
    ];

    protected $casts = [
        'seats_booked' => 'integer',
        'total_price' => 'integer',
        'driver_confirmed_departure' => 'boolean',
        'passenger_confirmed_departure' => 'boolean',
        'driver_departure_confirmed_at' => 'datetime',
        'passenger_departure_confirmed_at' => 'datetime',
        'trip_started' => 'boolean',
        'trip_started_at' => 'datetime',
        'passenger_no_show' => 'boolean',
        'marked_no_show_at' => 'datetime',
    ];

    /**
     * Get the NotificationService instance
     */
    protected function getNotificationService(): NotificationService
    {
        return app(NotificationService::class);
    }

    // ============ RELATIONS ============

    /**
     * Trajet concerné
     */
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Passager qui a réservé
     */
    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    /**
     * Paiement associé
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Paiements associés (peut avoir plusieurs tentatives)
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ============ MÉTHODES ============

    /**
     * Vérifier si la réservation est payée
     */
    public function isPaid(): bool
    {
        return $this->payment && $this->payment->status === Payment::STATUS_COMPLETED;
    }

    /**
     * Vérifier si le paiement est en escrow
     */
    public function hasEscrowPayment(): bool
    {
        return $this->payment && $this->payment->isInEscrow();
    }

    /**
     * Vérifier si les deux parties ont confirmé le départ
     */
    public function bothPartiesConfirmedDeparture(): bool
    {
        return $this->driver_confirmed_departure && $this->passenger_confirmed_departure;
    }

    /**
     * Confirmer la réservation
     */
    public function confirm(string $response = null): void
    {
        $oldStatus = $this->status;
        
        $this->update([
            'status' => 'confirmed',
            'driver_response' => $response,
        ]);

        $this->trip->updateAvailableSeats();

        // Envoyer notification en temps réel
        $this->getNotificationService()->notifyBookingConfirmed($this);
    }

    /**
     * Rejeter la réservation
     */
    public function reject(string $reason = null): void
    {
        $oldStatus = $this->status;
        
        $this->update([
            'status' => 'rejected',
            'driver_response' => $reason,
        ]);

        $this->trip->updateAvailableSeats();

        // Envoyer notification en temps réel
        $this->getNotificationService()->notifyBookingCancelled($this, 'driver');
    }

    /**
     * Annuler la réservation
     */
    public function cancel(string $reason = null): void
    {
        $oldStatus = $this->status;
        
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        $this->trip->updateAvailableSeats();

        // Envoyer notification en temps réel
        $this->getNotificationService()->notifyBookingCancelled($this, 'passenger');
    }

    /**
     * Marquer comme terminée
     */
    public function complete(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);

        // Mettre à jour les stats
        $this->passenger->increment('total_trips_as_passenger');
    }

    /**
     * Conducteur confirme le départ
     */
    public function driverConfirmsDeparture(): void
    {
        $this->update([
            'driver_confirmed_departure' => true,
            'driver_departure_confirmed_at' => now(),
        ]);

        // Notifier le passager
        $this->getNotificationService()->send(
            $this->passenger_id,
            'departure_confirmed',
            'Départ confirmé par le conducteur',
            "Le conducteur a confirmé votre présence pour le trajet {$this->trip->departure_city} → {$this->trip->arrival_city}.",
            ['booking_id' => $this->id, 'confirmed_by' => 'driver']
        );

        // Vérifier si les deux ont confirmé
        $this->checkAndStartTrip();
    }

    /**
     * Passager confirme le départ
     */
    public function passengerConfirmsDeparture(): void
    {
        $this->update([
            'passenger_confirmed_departure' => true,
            'passenger_departure_confirmed_at' => now(),
        ]);

        // Notifier le conducteur
        $this->getNotificationService()->send(
            $this->trip->driver_id,
            'departure_confirmed',
            'Départ confirmé par le passager',
            "{$this->passenger->name} a confirmé être en route pour le trajet {$this->trip->departure_city} → {$this->trip->arrival_city}.",
            ['booking_id' => $this->id, 'confirmed_by' => 'passenger']
        );

        // Vérifier si les deux ont confirmé
        $this->checkAndStartTrip();
    }

    /**
     * Vérifier et démarrer le trajet si les deux parties ont confirmé
     */
    protected function checkAndStartTrip(): void
    {
        $this->refresh();

        if ($this->bothPartiesConfirmedDeparture() && !$this->trip_started) {
            $this->update([
                'trip_started' => true,
                'trip_started_at' => now(),
                'status' => self::STATUS_IN_PROGRESS,
            ]);

            // Libérer le paiement au conducteur
            if ($this->hasEscrowPayment()) {
                $this->payment->releaseToDriver();
            }

            // Notifier les deux parties
            $this->getNotificationService()->send(
                $this->passenger_id,
                'trip_started',
                'Bon voyage !',
                "Votre trajet {$this->trip->departure_city} → {$this->trip->arrival_city} a commencé. Le paiement a été transféré au conducteur.",
                ['booking_id' => $this->id]
            );

            $this->getNotificationService()->send(
                $this->trip->driver_id,
                'trip_started',
                'Trajet en cours',
                "Le trajet vers {$this->trip->arrival_city} a officiellement commencé.",
                ['booking_id' => $this->id]
            );
        }
    }

    /**
     * Marquer le passager comme absent (no-show)
     */
    public function markAsNoShow(): void
    {
        $this->update([
            'passenger_no_show' => true,
            'marked_no_show_at' => now(),
            'status' => self::STATUS_CANCELLED,
            'cancellation_reason' => 'Passager absent (no-show)',
        ]);

        // Rembourser avec pénalité
        if ($this->hasEscrowPayment()) {
            $this->payment->refundNoShow();
        }

        // Libérer les places
        $this->trip->updateAvailableSeats();

        // Notifier le passager
        $this->getNotificationService()->send(
            $this->passenger_id,
            'booking_no_show',
            'Absence signalée',
            "Vous avez été marqué absent pour le trajet {$this->trip->departure_city} → {$this->trip->arrival_city}. Une pénalité de " . Payment::LATE_CANCELLATION_PENALTY . " FCFA a été appliquée.",
            ['booking_id' => $this->id]
        );
    }

    /**
     * Annuler avec gestion du remboursement
     */
    public function cancelWithRefund(string $reason = null, string $cancelledBy = 'passenger'): void
    {
        $oldStatus = $this->status;

        // Déterminer si c'est une annulation tardive
        $isLate = $this->payment ? $this->payment->isLateCancellation() : false;

        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancellation_reason' => $reason,
        ]);

        // Rembourser si paiement en escrow
        if ($this->hasEscrowPayment()) {
            $this->payment->refund($isLate);
        }

        $this->trip->updateAvailableSeats();

        // Envoyer notification
        $this->getNotificationService()->notifyBookingCancelled($this, $cancelledBy);
    }
}
