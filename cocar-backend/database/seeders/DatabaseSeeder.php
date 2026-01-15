<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Trip;
use App\Models\Booking;
use App\Models\Rating;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un admin
        $admin = User::create([
            'name' => 'Admin Rideshare',
            'email' => 'admin@rideshare.cm',
            'password' => Hash::make('password'),
            'phone' => '699000000',
            'role' => 'admin',
            'is_verified' => true,
        ]);

        // Créer des utilisateurs de test
        $users = [
            [
                'name' => 'Jean Kamga',
                'email' => 'jean@example.com',
                'phone' => '699123456',
                'bio' => 'Conducteur expérimenté, je fais régulièrement le trajet Yaoundé-Douala.',
                'rating' => 4.8,
            ],
            [
                'name' => 'Marie Fotso',
                'email' => 'marie@example.com',
                'phone' => '677987654',
                'bio' => 'Conductrice depuis 5 ans, passionnée de voyage.',
                'rating' => 4.9,
            ],
            [
                'name' => 'Paul Nganou',
                'email' => 'paul@example.com',
                'phone' => '655456789',
                'bio' => 'Amateur de road trips, je propose des trajets confortables.',
                'rating' => 4.5,
            ],
            [
                'name' => 'Sophie Mbarga',
                'email' => 'sophie@example.com',
                'phone' => '690111222',
                'bio' => 'Étudiante, je covoiture pour mes trajets universitaires.',
                'rating' => 4.7,
            ],
        ];

        $createdUsers = [];
        foreach ($users as $userData) {
            $createdUsers[] = User::create([
                ...$userData,
                'password' => Hash::make('password'),
                'role' => 'user',
                'is_verified' => true,
                'total_rides' => rand(10, 200),
            ]);
        }

        // Créer des véhicules
        $vehicles = [
            ['user_id' => $createdUsers[0]->id, 'brand' => 'Toyota', 'model' => 'Corolla', 'color' => 'Blanc', 'plate_number' => 'CE 123 AB', 'seats' => 4, 'year' => 2020],
            ['user_id' => $createdUsers[1]->id, 'brand' => 'Honda', 'model' => 'Civic', 'color' => 'Gris', 'plate_number' => 'LT 456 CD', 'seats' => 4, 'year' => 2019],
            ['user_id' => $createdUsers[2]->id, 'brand' => 'Hyundai', 'model' => 'Tucson', 'color' => 'Noir', 'plate_number' => 'OU 789 EF', 'seats' => 5, 'year' => 2021],
        ];

        $createdVehicles = [];
        foreach ($vehicles as $vehicleData) {
            $createdVehicles[] = Vehicle::create([...$vehicleData, 'is_verified' => true]);
        }

        // Créer des trajets
        $trips = [
            [
                'driver_id' => $createdUsers[0]->id,
                'vehicle_id' => $createdVehicles[0]->id,
                'departure_city' => 'Yaoundé',
                'departure_address' => 'Carrefour Nlongkak',
                'arrival_city' => 'Douala',
                'arrival_address' => 'Akwa Palace',
                'departure_date' => now()->addDays(3)->toDateString(),
                'departure_time' => '06:00',
                'estimated_arrival_time' => '09:30',
                'available_seats' => 3,
                'total_seats' => 4,
                'price_per_seat' => 4000,
                'description' => 'Trajet direct, climatisation, bagages autorisés.',
                'status' => 'confirmed',
            ],
            [
                'driver_id' => $createdUsers[1]->id,
                'vehicle_id' => $createdVehicles[1]->id,
                'departure_city' => 'Yaoundé',
                'departure_address' => 'Mvan',
                'arrival_city' => 'Douala',
                'arrival_address' => 'Bonapriso',
                'departure_date' => now()->addDays(4)->toDateString(),
                'departure_time' => '08:00',
                'estimated_arrival_time' => '11:30',
                'available_seats' => 2,
                'total_seats' => 4,
                'price_per_seat' => 3500,
                'description' => 'Conductrice expérimentée, trajet confortable.',
                'status' => 'confirmed',
            ],
            [
                'driver_id' => $createdUsers[2]->id,
                'vehicle_id' => $createdVehicles[2]->id,
                'departure_city' => 'Douala',
                'departure_address' => 'Bonanjo',
                'arrival_city' => 'Bafoussam',
                'arrival_address' => 'Marché A',
                'departure_date' => now()->addDays(5)->toDateString(),
                'departure_time' => '07:00',
                'estimated_arrival_time' => '11:00',
                'available_seats' => 4,
                'total_seats' => 5,
                'price_per_seat' => 5000,
                'description' => 'SUV spacieux, idéal pour les longs trajets.',
                'status' => 'confirmed',
            ],
            [
                'driver_id' => $createdUsers[0]->id,
                'vehicle_id' => $createdVehicles[0]->id,
                'departure_city' => 'Douala',
                'departure_address' => 'Akwa',
                'arrival_city' => 'Kribi',
                'arrival_address' => 'Centre-ville',
                'departure_date' => now()->addDays(7)->toDateString(),
                'departure_time' => '09:00',
                'estimated_arrival_time' => '12:00',
                'available_seats' => 4,
                'total_seats' => 4,
                'price_per_seat' => 3000,
                'description' => 'Direction la plage ! Ambiance détendue.',
                'status' => 'confirmed',
            ],
        ];

        foreach ($trips as $tripData) {
            Trip::create([
                ...$tripData,
                'luggage_allowed' => true,
                'pets_allowed' => false,
                'smoking_allowed' => false,
                'music_allowed' => true,
                'air_conditioning' => true,
            ]);
        }

        $this->command->info('✅ Base de données peuplée avec succès !');
        $this->command->info('📧 Admin: admin@rideshare.cm / password');
        $this->command->info('📧 Users: jean@example.com, marie@example.com, paul@example.com / password');
    }
}
