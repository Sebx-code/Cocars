<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Statut escrow
            $table->enum('escrow_status', [
                'none',           // Pas d'escrow (paiement cash)
                'held',           // Argent en séquestre
                'released',       // Libéré au conducteur
                'refunded',       // Remboursé au passager
                'partial_refund', // Remboursement partiel (avec pénalité)
            ])->default('none')->after('status');
            
            // Montants pour le suivi
            $table->bigInteger('escrow_amount')->default(0)->after('escrow_status'); // Montant en séquestre
            $table->bigInteger('penalty_amount')->default(0)->after('escrow_amount'); // Pénalité appliquée
            $table->bigInteger('refund_amount')->default(0)->after('penalty_amount'); // Montant remboursé
            $table->bigInteger('driver_amount')->default(0)->after('refund_amount'); // Montant versé au conducteur
            $table->bigInteger('commission_amount')->default(0)->after('driver_amount'); // Commission plateforme
            
            // Dates importantes
            $table->timestamp('escrow_held_at')->nullable()->after('paid_at');
            $table->timestamp('escrow_released_at')->nullable()->after('escrow_held_at');
            $table->timestamp('refunded_at')->nullable()->after('escrow_released_at');
            
            // Référence externe (API Mobile Money)
            $table->string('external_reference')->nullable()->after('transaction_id');
            $table->json('payment_response')->nullable(); // Réponse de l'API de paiement
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'escrow_status',
                'escrow_amount',
                'penalty_amount',
                'refund_amount',
                'driver_amount',
                'commission_amount',
                'escrow_held_at',
                'escrow_released_at',
                'refunded_at',
                'external_reference',
                'payment_response',
            ]);
        });
    }
};
