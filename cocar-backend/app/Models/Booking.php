<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'seats_booked' => 'integer',
        'total_price' => 'integer',
    ];

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

    // ============ MÉTHODES ============

    /**
     * Confirmer la réservation
     */
    public function confirm(string $response = null): void
    {
        $this->update([
            'status' => 'confirmed',
            'driver_response' => $response,
        ]);

        $this->trip->updateAvailableSeats();

        // Créer une notification pour le passager
        Notification::create([
            'user_id' => $this->passenger_id,
            'type' => 'booking_confirmed',
            'title' => 'Réservation confirmée',
            'message' => "Votre réservation pour le trajet {$this->trip->departure_city} → {$this->trip->arrival_city} a été confirmée.",
            'data' => ['booking_id' => $this->id, 'trip_id' => $this->trip_id],
        ]);
    }

    /**
     * Rejeter la réservation
     */
    public function reject(string $reason = null): void
    {
        $this->update([
            'status' => 'rejected',
            'driver_response' => $reason,
        ]);

        $this->trip->updateAvailableSeats();

        // Créer une notification pour le passager
        Notification::create([
            'user_id' => $this->passenger_id,
            'type' => 'booking_rejected',
            'title' => 'Réservation refusée',
            'message' => "Votre réservation pour le trajet {$this->trip->departure_city} → {$this->trip->arrival_city} a été refusée.",
            'data' => ['booking_id' => $this->id, 'trip_id' => $this->trip_id],
        ]);
    }

    /**
     * Annuler la réservation
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        $this->trip->updateAvailableSeats();

        // Notifier le conducteur
        Notification::create([
            'user_id' => $this->trip->driver_id,
            'type' => 'booking_cancelled',
            'title' => 'Réservation annulée',
            'message' => "{$this->passenger->name} a annulé sa réservation pour le trajet {$this->trip->departure_city} → {$this->trip->arrival_city}.",
            'data' => ['booking_id' => $this->id, 'trip_id' => $this->trip_id],
        ]);
    }

    /**
     * Marquer comme terminée
     */
    public function complete(): void
    {
        $this->update(['status' => 'completed']);

        // Mettre à jour les stats
        $this->passenger->increment('total_trips_as_passenger');
    }
}
