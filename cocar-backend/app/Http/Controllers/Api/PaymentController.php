<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Méthodes de paiement disponibles
     */
    public function methods()
    {
        $methods = [
            [
                'id' => 'cash',
                'name' => 'Espèces',
                'icon' => 'cash',
                'available' => true,
                'description' => 'Paiement en espèces au conducteur',
            ],
            [
                'id' => 'orange_money',
                'name' => 'Orange Money',
                'icon' => 'orange',
                'available' => true,
                'description' => 'Paiement via Orange Money',
            ],
            [
                'id' => 'mtn_money',
                'name' => 'MTN Mobile Money',
                'icon' => 'mtn',
                'available' => true,
                'description' => 'Paiement via MTN MoMo',
            ],
            [
                'id' => 'mobile_money',
                'name' => 'Mobile Money',
                'icon' => 'mobile',
                'available' => true,
                'description' => 'Autre opérateur Mobile Money',
            ],
            [
                'id' => 'card',
                'name' => 'Carte bancaire',
                'icon' => 'card',
                'available' => false,
                'description' => 'Paiement par carte (bientôt disponible)',
            ],
        ];

        return $this->success($methods);
    }

    /**
     * Traiter un paiement
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_method' => 'required|in:cash,mobile_money,card,orange_money,mtn_money',
            'phone_number' => 'required_if:payment_method,orange_money,mtn_money,mobile_money|nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);
        $user = $request->user();

        // Vérifications
        if ($booking->passenger_id !== $user->id) {
            return $this->error('Cette réservation ne vous appartient pas', 403);
        }

        if ($booking->status !== 'confirmed') {
            return $this->error('La réservation doit être confirmée avant le paiement', 400);
        }

        // Vérifier si un paiement existe déjà
        $existingPayment = Payment::where('booking_id', $booking->id)
            ->whereIn('status', ['completed', 'processing'])
            ->first();

        if ($existingPayment) {
            return $this->error('Un paiement existe déjà pour cette réservation', 400);
        }

        // Créer le paiement
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payer_id' => $user->id,
            'amount' => $booking->total_price,
            'currency' => 'XAF',
            'payment_method' => $validated['payment_method'],
            'phone_number' => $validated['phone_number'] ?? null,
            'transaction_id' => Payment::generateTransactionId(),
            'status' => 'processing',
        ]);

        // Simuler le traitement du paiement
        // En production, intégrer l'API du fournisseur de paiement
        if ($validated['payment_method'] === 'cash') {
            // Paiement en espèces = automatiquement en attente
            $payment->update(['status' => 'pending']);
        } else {
            // Simulation : paiement mobile money réussi
            // En production, appeler l'API Orange Money / MTN MoMo
            $payment->markAsCompleted();
        }

        $payment->load(['booking.trip']);

        return $this->success($payment, 'Paiement traité avec succès');
    }

    /**
     * Historique des paiements
     */
    public function history(Request $request)
    {
        $payments = Payment::where('payer_id', $request->user()->id)
            ->with(['booking.trip'])
            ->latest()
            ->get();

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

        return $this->success($payment->load(['booking.trip']));
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

        if ($payment->status !== 'pending' || $payment->payment_method !== 'cash') {
            return $this->error('Ce paiement ne peut pas être confirmé', 400);
        }

        $payment->markAsCompleted();

        return $this->success($payment->fresh(['booking']), 'Paiement confirmé');
    }
}
