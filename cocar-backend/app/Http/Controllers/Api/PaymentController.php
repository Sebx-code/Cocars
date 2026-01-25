<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\Wallet;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Exception;

class PaymentController extends Controller
{
    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Méthodes de paiement disponibles
     */
    public function methods()
    {
        $methods = [
            [
                'id' => 'orange_money',
                'name' => 'Orange Money',
                'icon' => 'orange',
                'available' => true,
                'description' => 'Paiement sécurisé via Orange Money',
                'escrow' => true,
            ],
            [
                'id' => 'mtn_money',
                'name' => 'MTN Mobile Money',
                'icon' => 'mtn',
                'available' => true,
                'description' => 'Paiement sécurisé via MTN MoMo',
                'escrow' => true,
            ],
            [
                'id' => 'mobile_money',
                'name' => 'Mobile Money',
                'icon' => 'mobile',
                'available' => true,
                'description' => 'Autre opérateur Mobile Money',
                'escrow' => true,
            ],
            [
                'id' => 'cash',
                'name' => 'Espèces',
                'icon' => 'cash',
                'available' => true,
                'description' => 'Paiement en espèces au conducteur (non sécurisé)',
                'escrow' => false,
            ],
        ];

        // Informations sur le système d'escrow
        $escrowInfo = [
            'enabled' => true,
            'description' => 'Votre argent est sécurisé jusqu\'à ce que les deux parties confirment le départ.',
            'penalty_amount' => Payment::LATE_CANCELLATION_PENALTY,
            'penalty_description' => 'Une pénalité de ' . Payment::LATE_CANCELLATION_PENALTY . ' FCFA est appliquée pour les annulations le jour du voyage.',
            'commission_percent' => Payment::PLATFORM_COMMISSION_PERCENT,
        ];

        return $this->success([
            'methods' => $methods,
            'escrow_info' => $escrowInfo,
        ]);
    }

    /**
     * Traiter un paiement
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_method' => 'required|in:cash,mobile_money,orange_money,mtn_money',
            'phone_number' => 'required_if:payment_method,orange_money,mtn_money,mobile_money|nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        $user = $request->user();

        // Vérifications
        if ($booking->passenger_id !== $user->id) {
            return $this->error('Cette réservation ne vous appartient pas', 403);
        }

        try {
            if ($validated['payment_method'] === 'cash') {
                $payment = $this->paymentService->initiateCashPayment($booking);
                $message = 'Paiement en espèces enregistré. Le conducteur devra confirmer la réception.';
            } else {
                $payment = $this->paymentService->initiateMobileMoneyPayment(
                    $booking,
                    $validated['payment_method'],
                    $validated['phone_number']
                );
                $message = 'Paiement effectué avec succès. L\'argent est sécurisé jusqu\'à la confirmation du voyage.';
            }

            return $this->success($payment->load(['booking.trip']), $message);
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Historique des paiements
     */
    public function history(Request $request)
    {
        $payments = Payment::where('payer_id', $request->user()->id)
            ->with(['booking.trip'])
            ->latest()
            ->paginate(20);

        return $this->success($payments);
    }

    /**
     * Vérifier le statut d'un paiement
     */
    public function status(string $transactionId)
    {
        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            return $this->error('Transaction introuvable', 404);
        }

        return $this->success($payment->load(['booking.trip', 'booking.passenger']));
    }

    /**
     * Confirmer un paiement en espèces (conducteur)
     */
    public function confirmCash(Request $request, Payment $payment)
    {
        // Vérifier que l'utilisateur est le conducteur
        if ($payment->booking->trip->driver_id !== $request->user()->id) {
            return $this->error('Vous n\'êtes pas autorisé à confirmer ce paiement', 403);
        }

        try {
            $payment = $this->paymentService->confirmCashPayment($payment);
            return $this->success($payment->load(['booking']), 'Paiement en espèces confirmé');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Obtenir le portefeuille de l'utilisateur
     */
    public function wallet(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::getOrCreate($user->id);

        // Transactions récentes
        $transactions = $wallet->transactions()
            ->with(['booking.trip'])
            ->latest()
            ->take(20)
            ->get();

        // Statistiques
        $stats = $this->paymentService->getUserPaymentStats($user->id);

        return $this->success([
            'wallet' => $wallet,
            'transactions' => $transactions,
            'stats' => $stats['totals'],
        ]);
    }

    /**
     * Historique des transactions du wallet
     */
    public function walletTransactions(Request $request)
    {
        $user = $request->user();
        $wallet = Wallet::getOrCreate($user->id);

        $transactions = $wallet->transactions()
            ->with(['booking.trip', 'payment'])
            ->latest()
            ->paginate(20);

        return $this->success($transactions);
    }

    /**
     * Retirer de l'argent du wallet
     */
    public function withdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|integer|min:500',
            'provider' => 'required|in:orange_money,mtn_money,mobile_money',
            'phone_number' => 'required|string',
        ]);

        $user = $request->user();
        $wallet = Wallet::getOrCreate($user->id);

        try {
            $result = $this->paymentService->withdrawToMobileMoney(
                $wallet,
                $validated['amount'],
                $validated['provider'],
                $validated['phone_number']
            );

            return $this->success($result, 'Retrait effectué avec succès');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Webhook pour les callbacks des fournisseurs de paiement
     */
    public function webhook(Request $request, string $provider)
    {
        // TODO: Implémenter la vérification de signature selon le fournisseur
        
        $transactionId = $request->input('transaction_id') ?? $request->input('reference');
        $status = $request->input('status');

        $payment = Payment::where('transaction_id', $transactionId)
            ->orWhere('external_reference', $transactionId)
            ->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        if ($status === 'success' || $status === 'completed') {
            $this->paymentService->handlePaymentSuccess($payment);
        } else {
            $this->paymentService->handlePaymentFailure(
                $payment, 
                $request->input('message') ?? 'Paiement échoué'
            );
        }

        return response()->json(['status' => 'received']);
    }

    /**
     * Demander un remboursement
     */
    public function requestRefund(Request $request, Payment $payment)
    {
        $user = $request->user();

        // Vérifier que c'est le payeur
        if ($payment->payer_id !== $user->id) {
            return $this->error('Ce paiement ne vous appartient pas', 403);
        }

        if (!$payment->canBeRefunded()) {
            return $this->error('Ce paiement ne peut pas être remboursé', 400);
        }

        try {
            // Déterminer si c'est une annulation tardive
            $applyPenalty = $payment->isLateCancellation();

            $this->paymentService->processRefund($payment, $applyPenalty);

            $message = $applyPenalty
                ? 'Remboursement effectué avec une pénalité de ' . Payment::LATE_CANCELLATION_PENALTY . ' FCFA'
                : 'Remboursement complet effectué';

            return $this->success($payment->fresh(), $message);
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
