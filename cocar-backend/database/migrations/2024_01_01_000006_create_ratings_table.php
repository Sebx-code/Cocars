<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->onDelete('cascade');
            $table->foreignId('rater_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('rated_user_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->enum('rating_type', ['driver', 'passenger']);
            $table->tinyInteger('punctuality')->nullable();
            $table->tinyInteger('communication')->nullable();
            $table->tinyInteger('comfort')->nullable();
            $table->timestamps();
            
            // Un utilisateur ne peut noter qu'une fois par trajet et par type
            $table->unique(['trip_id', 'rater_id', 'rated_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
