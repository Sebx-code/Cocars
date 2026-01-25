<?php

namespace App\Services;

use App\Events\NewNotification;
use App\Events\BookingStatusChanged;
use App\Events\TripReminder;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Trip;
use App\Models\User;

class NotificationService
{
    /**
     * Types de notifications
     */
    const TYPE_BOOKING_NEW = 'booking_new';
    const TYPE_BOOKING_CONFIRMED = 'booking_confirmed';
    const TYPE_BOOKING_CANCELLED = 'booking_cancelled';
    const TYPE_BOOKING_COMPLETED = 'booking_completed';
    const TYPE_TRIP_REMINDER = 'trip_reminder';
    const TYPE_TRIP_CANCELLED = 'trip_cancelled';
    const TYPE_TRIP_UPDATED = 'trip_updated';
    const TYPE_MESSAGE_NEW = 'message_new';
    const TYPE_RATING_RECEIVED = 'rating_received';
    const TYPE_PAYMENT_RECEIVED = 'payment_received';
    const TYPE_PAYMENT_REFUND = 'payment_refund';
    const TYPE_VERIFICATION_APPROVED = 'verification_approved';
    const TYPE_VERIFICATION_REJECTED = 'verification_rejected';
    const TYPE_SYSTEM = 'system';

    /**
     * Créer et envoyer une notification
     */
    public function send(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $data = [],
        bool $broadcast = true
    ): Notification {
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'read' => false,
        ]);

        if ($broadcast) {
            event(new NewNotification($notification));
        }

        return $notification;
    }

    /**
     * Notifier une nouvelle réservation (au conducteur)
     */
    public function notifyNewBooking(Booking $booking): void
    {
        $booking->load(['trip.driver', 'passenger']);
        
        $trip = $booking->trip;
        $passenger = $booking->passenger;
        $driver = $trip->driver;

        // Notification au conducteur
        $this->send(
            $driver->id,
            self::TYPE_BOOKING_NEW,
            'Nouvelle réservation',
            "{$passenger->name} a réservé {$booking->seats_booked} place(s) pour votre trajet {$trip->departure_city} → {$trip->arrival_city}",
            [
                'booking_id' => $booking->id,
                'trip_id' => $trip->id,
                'passenger_id' => $passenger->id,
                'passenger_name' => $passenger->name,
                'seats_booked' => $booking->seats_booked,
                'total_price' => $booking->total_price,
            ]
        );
    }

    /**
     * Notifier la confirmation d'une réservation (au passager)
     */
    public function notifyBookingConfirmed(Booking $booking): void
    {
        $booking->load(['trip.driver', 'passenger']);
        
        $trip = $booking->trip;
        $driver = $trip->driver;

        // Notification au passager
        $this->send(
            $booking->passenger_id,
            self::TYPE_BOOKING_CONFIRMED,
            'Réservation confirmée',
            "Votre réservation pour {$trip->departure_city} → {$trip->arrival_city} le {$trip->departure_date} a été confirmée par {$driver->name}",
            [
                'booking_id' => $booking->id,
                'trip_id' => $trip->id,
                'driver_id' => $driver->id,
                'driver_name' => $driver->name,
                'driver_phone' => $driver->phone,
                'departure_date' => $trip->departure_date,
                'departure_time' => $trip->departure_time,
            ]
        );

        // Broadcast le changement de statut
        event(new BookingStatusChanged($booking, 'pending', 'confirmed'));
    }

    /**
     * Notifier l'annulation d'une réservation
     */
    public function notifyBookingCancelled(Booking $booking, string $cancelledBy = 'passenger'): void
    {
        $booking->load(['trip.driver', 'passenger']);
        
        $trip = $booking->trip;
        $passenger = $booking->passenger;
        $driver = $trip->driver;

        if ($cancelledBy === 'passenger') {
            // Notifier le conducteur
            $this->send(
                $driver->id,
                self::TYPE_BOOKING_CANCELLED,
                'Réservation annulée',
                "{$passenger->name} a annulé sa réservation pour {$trip->departure_city} → {$trip->arrival_city}",
                [
                    'booking_id' => $booking->id,
                    'trip_id' => $trip->id,
                    'passenger_name' => $passenger->name,
                    'seats_freed' => $booking->seats_booked,
                ]
            );
        } else {
            // Notifier le passager
            $this->send(
                $passenger->id,
                self::TYPE_BOOKING_CANCELLED,
                'Réservation annulée',
                "Votre réservation pour {$trip->departure_city} → {$trip->arrival_city} a été annulée par le conducteur",
                [
                    'booking_id' => $booking->id,
                    'trip_id' => $trip->id,
                    'refund_amount' => $booking->total_price,
                ]
            );
        }

        // Broadcast le changement de statut
        $oldStatus = $booking->getOriginal('status') ?? 'pending';
        event(new BookingStatusChanged($booking, $oldStatus, 'cancelled'));
    }

    /**
     * Notifier l'annulation d'un trajet (à tous les passagers)
     */
    public function notifyTripCancelled(Trip $trip): void
    {
        $trip->load(['driver', 'bookings.passenger']);

        foreach ($trip->bookings as $booking) {
            if (in_array($booking->status, ['pending', 'confirmed'])) {
                $this->send(
                    $booking->passenger_id,
                    self::TYPE_TRIP_CANCELLED,
                    'Trajet annulé',
                    "Le trajet {$trip->departure_city} → {$trip->arrival_city} du {$trip->departure_date} a été annulé par le conducteur",
                    [
                        'trip_id' => $trip->id,
                        'booking_id' => $booking->id,
                        'refund_amount' => $booking->total_price,
                    ]
                );
            }
        }
    }

    /**
     * Envoyer un rappel de trajet
     */
    public function sendTripReminder(Trip $trip, string $reminderType = 'h24'): void
    {
        $trip->load(['driver', 'bookings.passenger']);

        $reminderMessages = [
            'h24' => 'dans 24 heures',
            'h2' => 'dans 2 heures',
            'departure' => 'commence maintenant',
        ];

        $timeMessage = $reminderMessages[$reminderType] ?? 'bientôt';

        // Rappel au conducteur
        $this->send(
            $trip->driver_id,
            self::TYPE_TRIP_REMINDER,
            'Rappel de trajet',
            "Votre trajet {$trip->departure_city} → {$trip->arrival_city} {$timeMessage}",
            [
                'trip_id' => $trip->id,
                'reminder_type' => $reminderType,
                'passengers_count' => $trip->bookings->where('status', 'confirmed')->count(),
            ]
        );

        event(new TripReminder($trip, $trip->driver_id, $reminderType));

        // Rappel aux passagers confirmés
        foreach ($trip->bookings->where('status', 'confirmed') as $booking) {
            $this->send(
                $booking->passenger_id,
                self::TYPE_TRIP_REMINDER,
                'Rappel de trajet',
                "Votre trajet {$trip->departure_city} → {$trip->arrival_city} {$timeMessage}. Conducteur: {$trip->driver->name}",
                [
                    'trip_id' => $trip->id,
                    'reminder_type' => $reminderType,
                    'driver_name' => $trip->driver->name,
                    'driver_phone' => $trip->driver->phone,
                ]
            );

            event(new TripReminder($trip, $booking->user_id, $reminderType));
        }
    }

    /**
     * Notifier la réception d'un paiement (au conducteur)
     */
    public function notifyPaymentReceived(Booking $booking, float $amount): void
    {
        $booking->load(['trip', 'passenger']);
        
        $this->send(
            $booking->trip->driver_id,
            self::TYPE_PAYMENT_RECEIVED,
            'Paiement reçu',
            "Vous avez reçu {$amount} FCFA de {$booking->passenger->name} pour le trajet {$booking->trip->departure_city} → {$booking->trip->arrival_city}",
            [
                'booking_id' => $booking->id,
                'amount' => $amount,
                'passenger_name' => $booking->passenger->name,
            ]
        );
    }

    /**
     * Notifier un remboursement
     */
    public function notifyPaymentRefund(Booking $booking, float $amount): void
    {
        $booking->load(['trip']);
        
        $this->send(
            $booking->passenger_id,
            self::TYPE_PAYMENT_REFUND,
            'Remboursement effectué',
            "Vous avez été remboursé de {$amount} FCFA pour le trajet {$booking->trip->departure_city} → {$booking->trip->arrival_city}",
            [
                'booking_id' => $booking->id,
                'amount' => $amount,
            ]
        );
    }

    /**
     * Notifier une nouvelle évaluation reçue
     */
    public function notifyRatingReceived(int $userId, string $raterName, int $rating, ?string $comment = null): void
    {
        $stars = str_repeat('⭐', $rating);
        
        $this->send(
            $userId,
            self::TYPE_RATING_RECEIVED,
            'Nouvelle évaluation',
            "{$raterName} vous a donné {$rating}/5 {$stars}" . ($comment ? ": \"{$comment}\"" : ''),
            [
                'rating' => $rating,
                'rater_name' => $raterName,
                'comment' => $comment,
            ]
        );
    }

    /**
     * Notifier l'approbation de la vérification
     */
    public function notifyVerificationApproved(User $user): void
    {
        $this->send(
            $user->id,
            self::TYPE_VERIFICATION_APPROVED,
            'Profil vérifié ✓',
            "Félicitations ! Votre profil a été vérifié. Vous pouvez maintenant profiter de toutes les fonctionnalités de CoCar.",
            ['verified_at' => now()->toISOString()]
        );
    }

    /**
     * Notifier le rejet de la vérification
     */
    public function notifyVerificationRejected(User $user, string $reason): void
    {
        $this->send(
            $user->id,
            self::TYPE_VERIFICATION_REJECTED,
            'Vérification refusée',
            "Votre demande de vérification a été refusée. Raison: {$reason}",
            ['reason' => $reason]
        );
    }

    /**
     * Envoyer une notification système
     */
    public function sendSystemNotification(int $userId, string $title, string $message, array $data = []): void
    {
        $this->send($userId, self::TYPE_SYSTEM, $title, $message, $data);
    }

    /**
     * Envoyer une notification à plusieurs utilisateurs
     */
    public function sendBulkNotification(array $userIds, string $type, string $title, string $message, array $data = []): void
    {
        foreach ($userIds as $userId) {
            $this->send($userId, $type, $title, $message, $data);
        }
    }
}
