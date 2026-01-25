<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Confirmation de départ par les deux parties
            $table->boolean('driver_confirmed_departure')->default(false)->after('dropoff_point');
            $table->boolean('passenger_confirmed_departure')->default(false)->after('driver_confirmed_departure');
            $table->timestamp('driver_departure_confirmed_at')->nullable()->after('passenger_confirmed_departure');
            $table->timestamp('passenger_departure_confirmed_at')->nullable()->after('driver_departure_confirmed_at');
            
            // Indicateur si le voyage est en cours
            $table->boolean('trip_started')->default(false)->after('passenger_departure_confirmed_at');
            $table->timestamp('trip_started_at')->nullable()->after('trip_started');
            
            // Pour le no-show (passager absent)
            $table->boolean('passenger_no_show')->default(false)->after('trip_started_at');
            $table->timestamp('marked_no_show_at')->nullable()->after('passenger_no_show');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'driver_confirmed_departure',
                'passenger_confirmed_departure',
                'driver_departure_confirmed_at',
                'passenger_departure_confirmed_at',
                'trip_started',
                'trip_started_at',
                'passenger_no_show',
                'marked_no_show_at',
            ]);
        });
    }
};
