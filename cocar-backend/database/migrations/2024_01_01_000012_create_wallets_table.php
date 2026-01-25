<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table des portefeuilles utilisateurs
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->bigInteger('balance')->default(0); // Solde disponible en FCFA
            $table->bigInteger('pending_balance')->default(0); // Solde en attente (escrow)
            $table->string('currency')->default('XAF');
            $table->timestamps();
            
            $table->unique('user_id');
        });

        // Table des transactions du portefeuille
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', [
                'deposit',          // Dépôt depuis Mobile Money
                'withdrawal',       // Retrait vers Mobile Money
                'escrow_in',        // Argent mis en séquestre (passager paye)
                'escrow_release',   // Argent libéré au conducteur
                'escrow_refund',    // Remboursement au passager
                'penalty',          // Pénalité déduite
                'commission',       // Commission plateforme
                'bonus',            // Bonus/promotion
            ]);
            $table->bigInteger('amount'); // Montant (positif ou négatif)
            $table->bigInteger('balance_after'); // Solde après transaction
            $table->string('description')->nullable();
            $table->json('metadata')->nullable(); // Données additionnelles
            $table->string('reference')->unique(); // Référence unique
            $table->timestamps();
            
            $table->index(['wallet_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
