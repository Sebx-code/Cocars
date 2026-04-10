<?php

namespace Database\Seeders;

use App\Models\Trip;
use App\Models\User;
use App\Models\UserVehicle;
use Illuminate\Database\Seeder;

/**
 * Seeder pour créer des trajets de test pour la recherche vocale
 * 
 * Utilisation : php artisan db:seed --class=VoiceSearchTestTripsSeeder
 */
class VoiceSearchTestTripsSeeder extends Seeder
{
    public function run(): void
    {
        // Vérifier si les utilisateurs et véhicules existent
        if (User::count() === 0) {
            echo "\n⚠️  Aucun utilisateur trouvé. Créez d'abord des utilisateurs.\n";
            return;
        }

        if (UserVehicle::count() === 0) {
            echo "\n⚠️  Aucun véhicule trouvé. Créez d'abord des véhicules.\n";
            return;
        }

        $drivers = User::limit(5)->get();
        $vehicles = UserVehicle::limit(5)->get();

        if ($drivers->isEmpty() || $vehicles->isEmpty()) {
            echo "\n⚠️  Pas assez de conducteurs ou de véhicules disponibles.\n";
            return;
        }

        // Trajets de test : Douala ↔ Yaoundé
        $trips = [
            [
                'driver_id' => $drivers->first()->id,
                'vehicle_id' => $vehicles->first()->id,
                'departure_city' => 'Douala',
                'departure_address' => 'Gare routière, Douala',
                'arrival_city' => 'Yaoundé',
                'arrival_address' => 'Gare routière Centrale, Yaoundé',
                'departure_date' => date('Y-m-d', strtotime('+1 day')),
                'departure_time' => '14:00',
                'estimated_arrival_time' => '17:30',
                'available_seats' => 2,
                'total_seats' => 4,
                'price_per_seat' => 3500,
                'description' => 'Trajet confortable avec climatisation',
                'luggage_allowed' => true,
                'pets_allowed' => false,
                'smoking_allowed' => false,
                'music_allowed' => true,
                'air_conditioning' => true,
                'status' => 'confirmed',
            ],
            [
                'driver_id' => $drivers->skip(1)->first()->id,
                'vehicle_id' => $vehicles->skip(1)->first()->id,
                'departure_city' => 'Douala',
                'departure_address' => 'Carrefour Bonavolo, Douala',
                'arrival_city' => 'Yaoundé',
                'arrival_address' => 'Centre Ville, Yaoundé',
                'departure_date' => date('Y-m-d', strtotime('+1 day')),
                'departure_time' => '16:00',
                'estimated_arrival_time' => '19:00',
                'available_seats' => 1,
                'total_seats' => 5,
                'price_per_seat' => 3800,
                'description' => 'Véhicule spacieux, excellent confort',
                'luggage_allowed' => true,
                'pets_allowed' => true,
                'smoking_allowed' => false,
                'music_allowed' => true,
                'air_conditioning' => true,
                'status' => 'confirmed',
            ],
            [
                'driver_id' => $drivers->skip(2)->first()->id,
                'vehicle_id' => $vehicles->skip(2)->first()->id,
                'departure_city' => 'Douala',
                'departure_address' => 'Akwa, Douala',
                'arrival_city' => 'Yaoundé',
                'arrival_address' => 'Bastos, Yaoundé',
                'departure_date' => date('Y-m-d', strtotime('+1 day')),
                'departure_time' => '15:00',
                'estimated_arrival_time' => '18:30',
                'available_seats' => 3,
                'total_seats' => 4,
                'price_per_seat' => 3600,
                'description' => 'Trajets réguliers, chauffeur expérimenté',
                'luggage_allowed' => true,
                'pets_allowed' => false,
                'smoking_allowed' => false,
                'music_allowed' => true,
                'air_conditioning' => true,
                'status' => 'pending',
            ],
            [
                'driver_id' => $drivers->skip(3)->first()->id,
                'vehicle_id' => $vehicles->skip(3)->first()->id,
                'departure_city' => 'Yaoundé',
                'departure_address' => 'Gare Inter-Etat, Yaoundé',
                'arrival_city' => 'Douala',
                'arrival_address' => 'Gare routière, Douala',
                'departure_date' => date('Y-m-d', strtotime('+2 days')),
                'departure_time' => '08:00',
                'estimated_arrival_time' => '11:30',
                'available_seats' => 2,
                'total_seats' => 6,
                'price_per_seat' => 4000,
                'description' => 'Départ très tôt, excellent pour les affaires',
                'luggage_allowed' => true,
                'pets_allowed' => false,
                'smoking_allowed' => false,
                'music_allowed' => true,
                'air_conditioning' => true,
                'status' => 'confirmed',
            ],
        ];

        // Trajets supplémentaires : Douala → Bamenda
        $trips[] = [
            'driver_id' => $drivers->skip(4)->first()->id,
            'vehicle_id' => $vehicles->skip(4)->first()->id,
            'departure_city' => 'Douala',
            'departure_address' => 'Gare routière, Douala',
            'arrival_city' => 'Bamenda',
            'arrival_address' => 'Gare routière, Bamenda',
            'departure_date' => date('Y-m-d', strtotime('+1 day')),
            'departure_time' => '06:00',
            'estimated_arrival_time' => '12:00',
            'available_seats' => 1,
            'total_seats' => 4,
            'price_per_seat' => 5500,
            'description' => 'Trajet de nuit pratique et rapide',
            'luggage_allowed' => true,
            'pets_allowed' => false,
            'smoking_allowed' => false,
            'music_allowed' => false,
            'air_conditioning' => true,
            'status' => 'confirmed',
        ];

        // Créer les trajets
        foreach ($trips as $tripData) {
            Trip::create($tripData);
        }

        $this->command->info('✅ ' . count($trips) . ' trajets de test créés avec succès !');
        $this->command->info('');
        $this->command->info('Trajets créés :');
        $this->command->info('  - 3 trajets Douala → Yaoundé (demain, différentes heures)');
        $this->command->info('  - 1 trajet Yaoundé → Douala (après-demain)');
        $this->command->info('  - 1 trajet Douala → Bamenda (demain)');
        $this->command->info('');
        $this->command->info('Vous pouvez maintenant tester la recherche vocale !');
    }
}
