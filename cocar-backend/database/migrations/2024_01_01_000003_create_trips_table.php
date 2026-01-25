<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained('user_vehicles')->onDelete('cascade');
            
            // Départ
            $table->string('departure_city');
            $table->string('departure_address');
            $table->decimal('departure_lat', 10, 8)->nullable();
            $table->decimal('departure_lng', 11, 8)->nullable();
            
            // Arrivée
            $table->string('arrival_city');
            $table->string('arrival_address');
            $table->decimal('arrival_lat', 10, 8)->nullable();
            $table->decimal('arrival_lng', 11, 8)->nullable();
            
            // Horaires
            $table->date('departure_date');
            $table->time('departure_time');
            $table->time('estimated_arrival_time')->nullable();
            
            // Places et prix
            $table->integer('available_seats');
            $table->integer('total_seats');
            $table->integer('price_per_seat');
            
            // Options
            $table->text('description')->nullable();
            $table->boolean('luggage_allowed')->default(true);
            $table->boolean('pets_allowed')->default(false);
            $table->boolean('smoking_allowed')->default(false);
            $table->boolean('music_allowed')->default(true);
            $table->boolean('air_conditioning')->default(true);
            
            // Statut
            $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('cancellation_reason')->nullable();
            
            $table->timestamps();
            
            // Index pour les recherches
            $table->index(['departure_city', 'arrival_city', 'departure_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
