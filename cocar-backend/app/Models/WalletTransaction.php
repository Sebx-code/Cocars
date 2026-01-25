<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'payment_id',
        'booking_id',
        'type',
        'amount',
        'balance_after',
        'description',
        'metadata',
        'reference',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
        'metadata' => 'array',
    ];

    // Types de transactions
    const TYPE_DEPOSIT = 'deposit';
    const TYPE_WITHDRAWAL = 'withdrawal';
    const TYPE_ESCROW_IN = 'escrow_in';
    const TYPE_ESCROW_RELEASE = 'escrow_release';
    const TYPE_ESCROW_REFUND = 'escrow_refund';
    const TYPE_PENALTY = 'penalty';
    const TYPE_COMMISSION = 'commission';
    const TYPE_BONUS = 'bonus';

    // ============ RELATIONS ============

    /**
     * Portefeuille associé
     */
    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Paiement associé
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Réservation associée
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    // ============ ACCESSEURS ============

    /**
     * Libellé du type de transaction
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_DEPOSIT => 'Dépôt',
            self::TYPE_WITHDRAWAL => 'Retrait',
            self::TYPE_ESCROW_IN => 'Paiement réservation',
            self::TYPE_ESCROW_RELEASE => 'Paiement reçu',
            self::TYPE_ESCROW_REFUND => 'Remboursement',
            self::TYPE_PENALTY => 'Pénalité',
            self::TYPE_COMMISSION => 'Commission',
            self::TYPE_BONUS => 'Bonus',
            default => $this->type,
        };
    }

    /**
     * Icône selon le type
     */
    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_DEPOSIT => 'arrow-down-circle',
            self::TYPE_WITHDRAWAL => 'arrow-up-circle',
            self::TYPE_ESCROW_IN => 'lock',
            self::TYPE_ESCROW_RELEASE => 'unlock',
            self::TYPE_ESCROW_REFUND => 'refresh-cw',
            self::TYPE_PENALTY => 'alert-circle',
            self::TYPE_COMMISSION => 'percent',
            self::TYPE_BONUS => 'gift',
            default => 'circle',
        };
    }

    /**
     * Vérifier si c'est un crédit
     */
    public function getIsCreditAttribute(): bool
    {
        return $this->amount > 0;
    }

    /**
     * Vérifier si c'est un débit
     */
    public function getIsDebitAttribute(): bool
    {
        return $this->amount < 0;
    }
}
