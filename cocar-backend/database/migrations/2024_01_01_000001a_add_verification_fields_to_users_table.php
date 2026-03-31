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
            if (!Schema::hasColumn('users', 'phone_verified')) {
                $table->boolean('phone_verified')->default(false)->after('phone');
            }
            if (!Schema::hasColumn('users', 'phone_verification_code')) {
                $table->string('phone_verification_code')->nullable()->after('phone_verified');
            }
            if (!Schema::hasColumn('users', 'phone_verification_expires_at')) {
                $table->timestamp('phone_verification_expires_at')->nullable()->after('phone_verification_code');
            }
            if (!Schema::hasColumn('users', 'id_card_path')) {
                $table->string('id_card_path')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'driver_license_path')) {
                $table->string('driver_license_path')->nullable()->after('id_card_path');
            }
            if (!Schema::hasColumn('users', 'selfie_path')) {
                $table->string('selfie_path')->nullable()->after('driver_license_path');
            }
            if (!Schema::hasColumn('users', 'verification_status')) {
                $table->enum('verification_status', ['unverified', 'pending', 'verified', 'rejected'])->default('unverified')->after('selfie_path');
            }
            if (!Schema::hasColumn('users', 'verification_notes')) {
                $table->text('verification_notes')->nullable()->after('verification_status');
            }
            if (!Schema::hasColumn('users', 'verified_at')) {
                $table->timestamp('verified_at')->nullable()->after('verification_notes');
            }
            if (!Schema::hasColumn('users', 'verified_by')) {
                $table->foreignId('verified_by')->nullable()->constrained('users')->after('verified_at');
            }
            if (!Schema::hasColumn('users', 'refresh_token')) {
                $table->string('refresh_token', 64)->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'refresh_token_expires_at')) {
                $table->timestamp('refresh_token_expires_at')->nullable()->after('refresh_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn([
                'phone_verified',
                'phone_verification_code',
                'phone_verification_expires_at',
                'id_card_path',
                'driver_license_path',
                'selfie_path',
                'verification_status',
                'verification_notes',
                'verified_at',
                'verified_by',
                'refresh_token',
                'refresh_token_expires_at',
            ]);
        });
    }
};
