<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('passenger_id')->constrained('users')->onDelete('cascade');
            $table->integer('seats_booked');
            $table->integer('total_price');
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->text('message')->nullable();
            $table->text('driver_response')->nullable();
            $table->string('pickup_point')->nullable();
            $table->string('dropoff_point')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            
            // Un passager ne peut pas réserver plusieurs fois le même trajet
            $table->unique(['trip_id', 'passenger_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
