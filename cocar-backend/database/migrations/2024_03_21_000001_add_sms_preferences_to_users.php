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
        Schema::table('users', function (Blueprint $table) {
            // Ajouter ces colonnes si elles n'existent pas
            if (!Schema::hasColumn('users', 'sms_opt_in')) {
                $table->boolean('sms_opt_in')->default(true)->after('phone_verified')
                    ->comment('L\'utilisateur consent à recevoir des SMS');
            }

            if (!Schema::hasColumn('users', 'sms_opt_in_at')) {
                $table->timestamp('sms_opt_in_at')->nullable()->after('sms_opt_in')
                    ->comment('Date du dernier changement de préférence SMS');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'sms_opt_in')) {
                $table->dropColumn('sms_opt_in');
            }

            if (Schema::hasColumn('users', 'sms_opt_in_at')) {
                $table->dropColumn('sms_opt_in_at');
            }
        });
    }
};
