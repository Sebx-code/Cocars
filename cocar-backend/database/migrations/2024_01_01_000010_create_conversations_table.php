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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->nullable()->constrained('trips')->onDelete('cascade');
            $table->string('type')->default('trip'); // 'trip' ou 'support' (admin)
            $table->string('subject')->nullable(); // Sujet pour conversations support
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            $table->index(['trip_id']);
            $table->index(['type']);
        });
        
        // Table pivot pour les participants d'une conversation
        Schema::create('conversation_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();
            
            $table->unique(['conversation_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_user');
        Schema::dropIfExists('conversations');
    }
};
