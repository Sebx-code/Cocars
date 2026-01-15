<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'payer_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'transaction_id',
        'phone_number',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'paid_at' => 'datetime',
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

    // ============ MÉTHODES ============

    /**
     * Générer un ID de transaction unique
     */
    public static function generateTransactionId(): string
    {
        return 'RS-' . strtoupper(Str::random(12));
    }

    /**
     * Marquer le paiement comme complété
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
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
        ]);
    }

    /**
     * Marquer le paiement comme échoué
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    /**
     * Rembourser le paiement
     */
    public function refund(): void
    {
        $this->update(['status' => 'refunded']);

        // Logique de remboursement selon la méthode de paiement
        // À implémenter selon l'API de paiement utilisée
    }
}
