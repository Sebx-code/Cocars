<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Pour le no-show chauffeur (chauffeur absent)
            $table->boolean('driver_no_show')->default(false)->after('passenger_no_show');
            $table->timestamp('marked_driver_no_show_at')->nullable()->after('driver_no_show');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'driver_no_show',
                'marked_driver_no_show_at',
            ]);
        });
    }
};
