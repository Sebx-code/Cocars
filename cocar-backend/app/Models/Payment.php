<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    // Statuts du paiement
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    // Statuts escrow
    const ESCROW_NONE = 'none';
    const ESCROW_HELD = 'held';
    const ESCROW_RELEASED = 'released';
    const ESCROW_REFUNDED = 'refunded';
    const ESCROW_PARTIAL_REFUND = 'partial_refund';

    // Pénalité pour annulation tardive (en FCFA)
    const LATE_CANCELLATION_PENALTY = 500;

    // Commission plateforme (en pourcentage)
    const PLATFORM_COMMISSION_PERCENT = 10;

    protected $fillable = [
        'booking_id',
        'payer_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'escrow_status',
        'escrow_amount',
        'penalty_amount',
        'refund_amount',
        'driver_amount',
        'commission_amount',
        'transaction_id',
        'external_reference',
        'phone_number',
        'payment_response',
        'paid_at',
        'escrow_held_at',
        'escrow_released_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'escrow_amount' => 'integer',
        'penalty_amount' => 'integer',
        'refund_amount' => 'integer',
        'driver_amount' => 'integer',
        'commission_amount' => 'integer',
        'payment_response' => 'array',
        'paid_at' => 'datetime',
        'escrow_held_at' => 'datetime',
        'escrow_released_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    // ============ RELATIONS ============

    /**
     * Réservation associée
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Utilisateur qui a payé
     */
    public function payer()
    {
        return $this->belongsTo(User::class, 'payer_id');
    }

    /**
     * Transactions wallet associées
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    // ============ MÉTHODES ============

    /**
     * Vérifier si le paiement est en escrow
     */
    public function isInEscrow(): bool
    {
        return $this->escrow_status === self::ESCROW_HELD;
    }

    /**
     * Vérifier si le paiement peut être remboursé
     */
    public function canBeRefunded(): bool
    {
        return in_array($this->escrow_status, [self::ESCROW_HELD]);
    }

    /**
     * Vérifier si c'est une annulation tardive (le jour du voyage ou après)
     */
    public function isLateCancellation(): bool
    {
        $departureDate = $this->booking->trip->departure_date;
        return now()->format('Y-m-d') >= $departureDate;
    }

    /**
     * Calculer la pénalité applicable
     */
    public function calculatePenalty(): int
    {
        if ($this->isLateCancellation()) {
            return self::LATE_CANCELLATION_PENALTY;
        }
        return 0;
    }

    /**
     * Calculer la commission plateforme
     */
    public function calculateCommission(): int
    {
        return (int) round($this->amount * self::PLATFORM_COMMISSION_PERCENT / 100);
    }

    /**
     * Calculer le montant net pour le conducteur
     */
    public function calculateDriverAmount(): int
    {
        return $this->amount - $this->calculateCommission();
    }

    /**
     * Générer un ID de transaction unique
     */
    public static function generateTransactionId(): string
    {
        return 'RS-' . strtoupper(Str::random(12));
    }

    /**
     * Marquer le paiement comme complété et mettre en escrow
     */
    public function markAsCompletedAndHold(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'escrow_status' => self::ESCROW_HELD,
            'escrow_amount' => $this->amount,
            'paid_at' => now(),
            'escrow_held_at' => now(),
        ]);

        // Notifier le passager que le paiement est sécurisé
        $trip = $this->booking->trip;
        Notification::create([
            'user_id' => $this->payer_id,
            'type' => 'payment_secured',
            'title' => 'Paiement sécurisé',
            'message' => "Votre paiement de {$this->amount} {$this->currency} est sécurisé. Il sera transféré au conducteur une fois le voyage confirmé par les deux parties.",
            'data' => ['payment_id' => $this->id, 'booking_id' => $this->booking_id],
            'read' => false,
        ]);

        // Notifier le conducteur qu'un paiement a été reçu (en attente)
        Notification::create([
            'user_id' => $trip->driver_id,
            'type' => 'payment_pending',
            'title' => 'Paiement en attente',
            'message' => "Un paiement de {$this->amount} {$this->currency} est en attente pour le trajet {$trip->departure_city} → {$trip->arrival_city}. Il vous sera versé une fois le voyage confirmé.",
            'data' => ['payment_id' => $this->id, 'booking_id' => $this->booking_id],
            'read' => false,
        ]);
    }

    /**
     * Marquer le paiement comme complété (ancien comportement pour cash)
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'paid_at' => now(),
        ]);

        // Notifier le conducteur
        $trip = $this->booking->trip;
        Notification::create([
            'user_id' => $trip->driver_id,
            'type' => 'payment_received',
            'title' => 'Paiement reçu',
            'message' => "Vous avez reçu un paiement de {$this->amount} {$this->currency} pour le trajet {$trip->departure_city} → {$trip->arrival_city}.",
            'data' => ['payment_id' => $this->id, 'booking_id' => $this->booking_id],
            'read' => false,
        ]);
    }

    /**
     * Marquer le paiement comme échoué
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => self::STATUS_FAILED]);
    }

    /**
     * Libérer l'escrow vers le conducteur
     */
    public function releaseToDriver(): void
    {
        if (!$this->isInEscrow()) {
            throw new \Exception('Ce paiement n\'est pas en séquestre');
        }

        $commission = $this->calculateCommission();
        $driverAmount = $this->amount - $commission;

        // Mettre à jour le paiement
        $this->update([
            'escrow_status' => self::ESCROW_RELEASED,
            'driver_amount' => $driverAmount,
            'commission_amount' => $commission,
            'escrow_released_at' => now(),
        ]);

        // Créditer le wallet du conducteur
        $driverWallet = Wallet::getOrCreate($this->booking->trip->driver_id);
        $driverWallet->credit(
            $driverAmount,
            'escrow_release',
            "Paiement pour trajet #{$this->booking->trip->id}",
            [
                'payment_id' => $this->id,
                'booking_id' => $this->booking_id,
                'commission' => $commission,
            ]
        );

        // Notifier le conducteur
        $trip = $this->booking->trip;
        Notification::create([
            'user_id' => $trip->driver_id,
            'type' => 'payment_received',
            'title' => 'Paiement reçu !',
            'message' => "Vous avez reçu {$driverAmount} {$this->currency} pour le trajet {$trip->departure_city} → {$trip->arrival_city}.",
            'data' => [
                'payment_id' => $this->id,
                'booking_id' => $this->booking_id,
                'amount' => $driverAmount,
                'commission' => $commission,
            ],
            'read' => false,
        ]);
    }

    /**
     * Rembourser le paiement (avec ou sans pénalité)
     */
    public function refund(bool $applyPenalty = false): void
    {
        if (!$this->canBeRefunded()) {
            throw new \Exception('Ce paiement ne peut pas être remboursé');
        }

        $penalty = $applyPenalty ? $this->calculatePenalty() : 0;
        $refundAmount = max(0, $this->escrow_amount - $penalty);
        $escrowStatus = $penalty > 0 ? self::ESCROW_PARTIAL_REFUND : self::ESCROW_REFUNDED;

        // Mettre à jour le paiement
        $this->update([
            'status' => self::STATUS_REFUNDED,
            'escrow_status' => $escrowStatus,
            'penalty_amount' => $penalty,
            'refund_amount' => $refundAmount,
            'refunded_at' => now(),
        ]);

        // Créditer le wallet du passager (remboursement)
        if ($refundAmount > 0) {
            $passengerWallet = Wallet::getOrCreate($this->payer_id);
            $passengerWallet->credit(
                $refundAmount,
                'escrow_refund',
                $penalty > 0 
                    ? "Remboursement (pénalité de {$penalty} FCFA déduite)" 
                    : "Remboursement complet",
                [
                    'payment_id' => $this->id,
                    'booking_id' => $this->booking_id,
                    'original_amount' => $this->escrow_amount,
                    'penalty' => $penalty,
                ]
            );
        }

        // Notifier le passager
        $trip = $this->booking->trip;
        $message = $penalty > 0
            ? "Vous avez été remboursé de {$refundAmount} {$this->currency} (pénalité de {$penalty} FCFA pour annulation tardive)."
            : "Vous avez été remboursé de {$refundAmount} {$this->currency}.";

        Notification::create([
            'user_id' => $this->payer_id,
            'type' => 'payment_refund',
            'title' => 'Remboursement effectué',
            'message' => $message,
            'data' => [
                'payment_id' => $this->id,
                'booking_id' => $this->booking_id,
                'refund_amount' => $refundAmount,
                'penalty' => $penalty,
            ],
            'read' => false,
        ]);
    }

    /**
     * Rembourser pour no-show (passager absent)
     */
    public function refundNoShow(): void
    {
        // Le passager est absent, pénalité maximale
        $this->refund(true);
    }
}
