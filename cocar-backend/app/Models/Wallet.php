<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'pending_balance',
        'currency',
    ];

    protected $casts = [
        'balance' => 'integer',
        'pending_balance' => 'integer',
    ];

    // ============ RELATIONS ============

    /**
     * Propriétaire du portefeuille
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Transactions du portefeuille
     */
    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class)->latest();
    }

    // ============ MÉTHODES ============

    /**
     * Générer une référence unique pour les transactions
     */
    public static function generateReference(): string
    {
        return 'WT-' . strtoupper(Str::random(12));
    }

    /**
     * Obtenir ou créer le portefeuille d'un utilisateur
     */
    public static function getOrCreate(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'XAF']
        );
    }

    /**
     * Créditer le portefeuille (argent disponible)
     */
    public function credit(int $amount, string $type, string $description = null, array $metadata = []): WalletTransaction
    {
        $this->increment('balance', $amount);
        $this->refresh();

        return $this->recordTransaction($type, $amount, $description, $metadata);
    }

    /**
     * Débiter le portefeuille (argent disponible)
     */
    public function debit(int $amount, string $type, string $description = null, array $metadata = []): WalletTransaction
    {
        if ($this->balance < $amount) {
            throw new \Exception('Solde insuffisant');
        }

        $this->decrement('balance', $amount);
        $this->refresh();

        return $this->recordTransaction($type, -$amount, $description, $metadata);
    }

    /**
     * Mettre de l'argent en séquestre (escrow)
     */
    public function holdInEscrow(int $amount, string $description = null, array $metadata = []): WalletTransaction
    {
        $this->increment('pending_balance', $amount);
        $this->refresh();

        return $this->recordTransaction('escrow_in', $amount, $description, $metadata);
    }

    /**
     * Libérer l'argent du séquestre vers le solde disponible
     */
    public function releaseFromEscrow(int $amount, string $description = null, array $metadata = []): WalletTransaction
    {
        if ($this->pending_balance < $amount) {
            throw new \Exception('Montant en séquestre insuffisant');
        }

        $this->decrement('pending_balance', $amount);
        $this->increment('balance', $amount);
        $this->refresh();

        return $this->recordTransaction('escrow_release', $amount, $description, $metadata);
    }

    /**
     * Rembourser depuis le séquestre
     */
    public function refundFromEscrow(int $amount, string $description = null, array $metadata = []): WalletTransaction
    {
        if ($this->pending_balance < $amount) {
            throw new \Exception('Montant en séquestre insuffisant');
        }

        $this->decrement('pending_balance', $amount);
        $this->refresh();

        return $this->recordTransaction('escrow_refund', -$amount, $description, $metadata);
    }

    /**
     * Enregistrer une transaction
     */
    protected function recordTransaction(string $type, int $amount, string $description = null, array $metadata = []): WalletTransaction
    {
        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'type' => $type,
            'amount' => $amount,
            'balance_after' => $this->balance,
            'description' => $description,
            'metadata' => $metadata,
            'reference' => self::generateReference(),
            'payment_id' => $metadata['payment_id'] ?? null,
            'booking_id' => $metadata['booking_id'] ?? null,
        ]);
    }

    /**
     * Solde total (disponible + en attente)
     */
    public function getTotalBalanceAttribute(): int
    {
        return $this->balance + $this->pending_balance;
    }

    /**
     * Vérifier si le solde est suffisant
     */
    public function hasSufficientBalance(int $amount): bool
    {
        return $this->balance >= $amount;
    }
}
