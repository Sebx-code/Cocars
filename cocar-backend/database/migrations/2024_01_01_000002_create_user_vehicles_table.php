<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('registration_number')->unique(); // Immatriculation
            $table->string('brand'); // Marque
            $table->string('model')->nullable(); // Modèle
            $table->string('color'); // Couleur
            $table->integer('year')->nullable(); // Année
            $table->integer('seats')->default(4); // Nombre de places
            $table->boolean('is_default')->default(false); // Véhicule par défaut
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_vehicles');
    }
};
