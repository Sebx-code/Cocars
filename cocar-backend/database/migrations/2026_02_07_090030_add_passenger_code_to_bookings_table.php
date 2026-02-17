<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Code unique du passager pour ce trajet (auto-incrémenté par trajet: 1,2,3...)
            $table->integer('passenger_code')->nullable()->after('dropoff_point')->comment('Code passager par trajet (1,2,3...)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('passenger_code');
        });
    }
};
