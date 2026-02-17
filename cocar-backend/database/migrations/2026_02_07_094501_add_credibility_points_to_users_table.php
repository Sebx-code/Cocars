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
            // Points de crédibilité - influencent le nombre d'étoiles et la position dans le fil
            $table->integer('credibility_points')->default(100)->after('rating')
                ->comment('Points de crédibilité (100 par défaut, influence les étoiles)');
            
            // Historique des changements de crédibilité
            $table->integer('total_positive_points')->default(0)->after('credibility_points')
                ->comment('Total des points positifs gagnés');
            
            $table->integer('total_negative_points')->default(0)->after('total_positive_points')
                ->comment('Total des points négatifs perdus');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['credibility_points', 'total_positive_points', 'total_negative_points']);
        });
    }
};
