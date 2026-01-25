<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Wallet;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class PaymentService
{
    /**
     * Configuration des fournisseurs de paiement
     */
    protected array $providers = [
        'orange_money' => [
            'name' => 'Orange Money',
            'enabled' => true,
            'api_url' => '', // À configurer
            'merchant_id' => '', // À configurer
        ],
        'mtn_money' => [
            'name' => 'MTN Mobile Money',
            'enabled' => true,
            'api_url' => '', // À configurer
            'merchant_id' => '', // À configurer
        ],
    ];

    /**
     * Initier un paiement Mobile Money
     */
    public function initiateMobileMoneyPayment(
        Booking $booking,
        string $paymentMethod,
        string $phoneNumber
    ): Payment {
        // Vérifier que la réservation peut être payée
        $this->validateBookingForPayment($booking);

        // Vérifier le mode de paiement
        if (!in_array($paymentMethod, ['orange_money', 'mtn_money', 'mobile_money'])) {
            throw new Exception('Mode de paiement invalide');
        }

        return DB::transaction(function () use ($booking, $paymentMethod, $phoneNumber) {
            // Créer le paiement en statut processing
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'payer_id' => $booking->passenger_id,
                'amount' => $booking->total_price,
                'currency' => 'XAF',
                'payment_method' => $paymentMethod,
                'phone_number' => $phoneNumber,
                'transaction_id' => Payment::generateTransactionId(),
                'status' => Payment::STATUS_PROCESSING,
                'escrow_status' => Payment::ESCROW_NONE,
            ]);

            // Appeler l'API du fournisseur de paiement
            try {
                $response = $this->callPaymentProvider($payment, $paymentMethod, $phoneNumber);
                
                if ($response['success']) {
                    $payment->update([
                        'external_reference' => $response['reference'] ?? null,
                        'payment_response' => $response,
                    ]);

                    // Simuler le succès immédiat (en production, utiliser le webhook)
                    $this->handlePaymentSuccess($payment);
                } else {
                    $payment->markAsFailed();
                    throw new Exception($response['message'] ?? 'Erreur de paiement');
                }
            } catch (Exception $e) {
                Log::error('Payment error: ' . $e->getMessage(), [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                ]);
                
                $payment->markAsFailed();
                throw $e;
            }

            return $payment->fresh(['booking.trip']);
        });
    }

    /**
     * Initier un paiement en espèces
     */
    public function initiateCashPayment(Booking $booking): Payment
    {
        $this->validateBookingForPayment($booking);

        return Payment::create([
            'booking_id' => $booking->id,
            'payer_id' => $booking->passenger_id,
            'amount' => $booking->total_price,
            'currency' => 'XAF',
            'payment_method' => 'cash',
            'transaction_id' => Payment::generateTransactionId(),
            'status' => Payment::STATUS_PENDING,
            'escrow_status' => Payment::ESCROW_NONE,
        ]);
    }

    /**
     * Confirmer un paiement en espèces (par le conducteur)
     */
    public function confirmCashPayment(Payment $payment): Payment
    {
        if ($payment->payment_method !== 'cash' || $payment->status !== Payment::STATUS_PENDING) {
            throw new Exception('Ce paiement ne peut pas être confirmé');
        }

        $payment->markAsCompleted();
        return $payment->fresh();
    }

    /**
     * Valider que la réservation peut être payée
     */
    protected function validateBookingForPayment(Booking $booking): void
    {
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            throw new Exception('La réservation doit être confirmée avant le paiement');
        }

        $existingPayment = Payment::where('booking_id', $booking->id)
            ->whereIn('status', [Payment::STATUS_COMPLETED, Payment::STATUS_PROCESSING])
            ->first();

        if ($existingPayment) {
            throw new Exception('Un paiement existe déjà pour cette réservation');
        }
    }

    /**
     * Appeler l'API du fournisseur de paiement
     * (Simulation - à implémenter avec les vraies APIs)
     */
    protected function callPaymentProvider(Payment $payment, string $provider, string $phoneNumber): array
    {
        // En développement : simuler le succès
        if (config('app.env') !== 'production') {
            return [
                'success' => true,
                'reference' => 'SIM-' . uniqid(),
                'message' => 'Paiement simulé avec succès',
            ];
        }

        // En production : appeler la vraie API
        switch ($provider) {
            case 'orange_money':
                return $this->callOrangeMoneyApi($payment, $phoneNumber);
            case 'mtn_money':
                return $this->callMtnMomoApi($payment, $phoneNumber);
            default:
                return $this->callGenericMobileMoneyApi($payment, $phoneNumber);
        }
    }

    /**
     * Appeler l'API Orange Money
     */
    protected function callOrangeMoneyApi(Payment $payment, string $phoneNumber): array
    {
        // TODO: Implémenter l'intégration Orange Money
        // Documentation: https://developer.orange.com/apis/om-webpay/overview
        
        return [
            'success' => true,
            'reference' => 'OM-' . uniqid(),
            'message' => 'Demande de paiement envoyée',
        ];
    }

    /**
     * Appeler l'API MTN MoMo
     */
    protected function callMtnMomoApi(Payment $payment, string $phoneNumber): array
    {
        // TODO: Implémenter l'intégration MTN MoMo
        // Documentation: https://momodeveloper.mtn.com/
        
        return [
            'success' => true,
            'reference' => 'MTN-' . uniqid(),
            'message' => 'Demande de paiement envoyée',
        ];
    }

    /**
     * Appeler une API Mobile Money générique
     */
    protected function callGenericMobileMoneyApi(Payment $payment, string $phoneNumber): array
    {
        return [
            'success' => true,
            'reference' => 'MM-' . uniqid(),
            'message' => 'Demande de paiement envoyée',
        ];
    }

    /**
     * Gérer le succès d'un paiement (appelé par webhook ou simulation)
     */
    public function handlePaymentSuccess(Payment $payment): void
    {
        if ($payment->status === Payment::STATUS_COMPLETED) {
            return; // Déjà traité
        }

        // Marquer comme complété et mettre en escrow
        $payment->markAsCompletedAndHold();

        Log::info('Payment completed and held in escrow', [
            'payment_id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'amount' => $payment->amount,
        ]);
    }

    /**
     * Gérer l'échec d'un paiement (appelé par webhook)
     */
    public function handlePaymentFailure(Payment $payment, string $reason = null): void
    {
        $payment->update([
            'status' => Payment::STATUS_FAILED,
            'payment_response' => array_merge(
                $payment->payment_response ?? [],
                ['failure_reason' => $reason]
            ),
        ]);

        // Notifier le passager
        Notification::create([
            'user_id' => $payment->payer_id,
            'type' => 'payment_failed',
            'title' => 'Échec du paiement',
            'message' => "Votre paiement de {$payment->amount} FCFA a échoué. Veuillez réessayer.",
            'data' => ['payment_id' => $payment->id, 'reason' => $reason],
            'read' => false,
        ]);
    }

    /**
     * Traiter un remboursement
     */
    public function processRefund(Payment $payment, bool $applyPenalty = false): void
    {
        if (!$payment->canBeRefunded()) {
            throw new Exception('Ce paiement ne peut pas être remboursé');
        }

        DB::transaction(function () use ($payment, $applyPenalty) {
            $payment->refund($applyPenalty);

            // En production : appeler l'API pour le remboursement Mobile Money
            if ($payment->payment_method !== 'cash') {
                $this->initiateRefundWithProvider($payment);
            }
        });
    }

    /**
     * Initier un remboursement auprès du fournisseur
     */
    protected function initiateRefundWithProvider(Payment $payment): void
    {
        // TODO: Implémenter le remboursement via API
        // Pour l'instant, le montant est crédité sur le wallet
        Log::info('Refund initiated', [
            'payment_id' => $payment->id,
            'refund_amount' => $payment->refund_amount,
            'method' => $payment->payment_method,
        ]);
    }

    /**
     * Retirer de l'argent du wallet vers Mobile Money
     */
    public function withdrawToMobileMoney(
        Wallet $wallet,
        int $amount,
        string $provider,
        string $phoneNumber
    ): array {
        if (!$wallet->hasSufficientBalance($amount)) {
            throw new Exception('Solde insuffisant');
        }

        // Minimum de retrait
        $minimumWithdraw = 500;
        if ($amount < $minimumWithdraw) {
            throw new Exception("Le montant minimum de retrait est de {$minimumWithdraw} FCFA");
        }

        return DB::transaction(function () use ($wallet, $amount, $provider, $phoneNumber) {
            // Débiter le wallet
            $transaction = $wallet->debit(
                $amount,
                'withdrawal',
                "Retrait vers {$provider} ({$phoneNumber})",
                [
                    'provider' => $provider,
                    'phone_number' => $phoneNumber,
                ]
            );

            // En production : appeler l'API pour le transfert
            // TODO: Implémenter le transfert réel

            // Notifier l'utilisateur
            Notification::create([
                'user_id' => $wallet->user_id,
                'type' => 'withdrawal_completed',
                'title' => 'Retrait effectué',
                'message' => "Votre retrait de {$amount} FCFA vers {$phoneNumber} a été effectué.",
                'data' => [
                    'amount' => $amount,
                    'provider' => $provider,
                    'reference' => $transaction->reference,
                ],
                'read' => false,
            ]);

            return [
                'success' => true,
                'transaction' => $transaction,
                'message' => 'Retrait effectué avec succès',
            ];
        });
    }

    /**
     * Obtenir les statistiques de paiement pour un utilisateur
     */
    public function getUserPaymentStats(int $userId): array
    {
        $wallet = Wallet::getOrCreate($userId);

        return [
            'wallet' => [
                'balance' => $wallet->balance,
                'pending_balance' => $wallet->pending_balance,
                'total_balance' => $wallet->total_balance,
                'currency' => $wallet->currency,
            ],
            'totals' => [
                'earned' => Payment::whereHas('booking.trip', fn($q) => $q->where('driver_id', $userId))
                    ->where('escrow_status', Payment::ESCROW_RELEASED)
                    ->sum('driver_amount'),
                'spent' => Payment::where('payer_id', $userId)
                    ->where('status', Payment::STATUS_COMPLETED)
                    ->sum('amount'),
                'refunded' => Payment::where('payer_id', $userId)
                    ->whereIn('escrow_status', [Payment::ESCROW_REFUNDED, Payment::ESCROW_PARTIAL_REFUND])
                    ->sum('refund_amount'),
                'pending' => Payment::whereHas('booking.trip', fn($q) => $q->where('driver_id', $userId))
                    ->where('escrow_status', Payment::ESCROW_HELD)
                    ->sum('amount'),
            ],
        ];
    }
}
