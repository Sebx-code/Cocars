<?php

namespace App\Console\Commands;

use App\Models\Trip;
use App\Models\User;
use App\Models\UserVehicle;
use App\Services\VoiceSearchService;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Commande pour tester la fonctionnalité de recherche vocale
 *
 * Utilisation:
 * php artisan voice:test-search
 */
class TestVoiceSearch extends Command
{
    protected $signature = 'voice:test-search';
    protected $description = 'Test la fonctionnalité de recherche vocale avec des exemples';

    protected VoiceSearchService $voiceService;

    public function __construct(VoiceSearchService $voiceService)
    {
        parent::__construct();
        $this->voiceService = $voiceService;
    }

    public function handle()
    {
        $this->info('🎙️  Test de Recherche Vocale - CoCar');
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Créer des données de test
        $this->createMockData();

        // Tests de parsing
        $this->testParsing();

        // Tests de recherche
        $this->testSearch();

        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->info('✅ Tous les tests sont terminés!');
    }

    private function createMockData()
    {
        $this->info('📝 Création de données de test...');

        // Créer 2 conducteurs
        $drivers = User::factory(2)->create();

        foreach ($drivers as $driver) {
            // Créer un véhicule pour chaque conducteur
            $vehicle = UserVehicle::factory()->create([
                'user_id' => $driver->id,
            ]);

            // Créer 3 trajets pour chaque vehicule
            $trips = [
                [
                    'departure_city' => 'Douala',
                    'arrival_city' => 'Yaoundé',
                    'departure_date' => Carbon::tomorrow(),
                    'departure_time' => '14:00',
                    'price_per_seat' => 3200,
                    'available_seats' => 3,
                ],
                [
                    'departure_city' => 'Douala',
                    'arrival_city' => 'Yaoundé',
                    'departure_date' => Carbon::tomorrow(),
                    'departure_time' => '16:00',
                    'price_per_seat' => 4000,
                    'available_seats' => 2,
                ],
                [
                    'departure_city' => 'Douala',
                    'arrival_city' => 'Yaoundé',
                    'departure_date' => Carbon::tomorrow(),
                    'departure_time' => '18:00',
                    'price_per_seat' => 4800,
                    'available_seats' => 1,
                ],
                [
                    'departure_city' => 'Yaoundé',
                    'arrival_city' => 'Bamenda',
                    'departure_date' => Carbon::tomorrow()->addDay(),
                    'departure_time' => '08:00',
                    'price_per_seat' => 5000,
                    'available_seats' => 4,
                ],
            ];

            foreach ($trips as $tripData) {
                Trip::factory()->create([
                    'driver_id' => $driver->id,
                    'vehicle_id' => $vehicle->id,
                    'status' => 'confirmed',
                    ...$tripData,
                ]);
            }
        }

        $this->info('✅ Données de test créées (2 conducteurs, 8 trajets)');
    }

    private function testParsing()
    {
        $this->line('');
        $this->info('🧪 Test 1: Parsing de phrases vocales');
        $this->line('─────────────────────────────────────');

        $testPhrases = [
            'je recherche un trajet douala yaounde demain a 16h j\'ai 4000',
            'ydé douala demain 14h30 budget 3000',
            'trajet douala yaounde apres demain',
            'peux tu m\'aider a trouver un trajet de douala a yaounde aujourd\'hui',
            'je veux aller de douala a yaounde le 15/04 a 18h, j\'ai 5000',
        ];

        foreach ($testPhrases as $phrase) {
            $this->line('');
            $this->line("📢 Phrase: <comment>\"$phrase\"</comment>");

            $parsed = $this->voiceService->parseSearchQuery($phrase);

            $this->line('   Résultat du parsing:');
            $this->line("   • Départ: <info>{$parsed['departure']}</info>");
            $this->line("   • Destination: <info>{$parsed['destination']}</info>");
            $this->line("   • Date: <info>{$parsed['date']}</info>");
            $this->line("   • Heure: <info>" . ($parsed['time'] ?? 'non spécifiée') . '</info>');
            $this->line("   • Budget: <info>" . ($parsed['budget'] ?? 'non spécifié') . '</info>');

            $errors = $this->validateParse($parsed);
            if (!empty($errors)) {
                foreach ($errors as $error) {
                    $this->line("   ⚠️  <error>$error</error>");
                }
            }
        }
    }

    private function validateParse(array $parsed): array
    {
        $errors = [];

        if (!$parsed['departure'] && !$parsed['destination']) {
            $errors[] = 'Villes de départ ou destination introuvables';
        }

        return $errors;
    }

    private function testSearch()
    {
        $this->line('');
        $this->info('🔍 Test 2: Recherche de trajets');
        $this->line('─────────────────────────────────────');

        $searchCases = [
            [
                'phrase' => 'je recherche un trajet douala yaounde demain a 16h j\'ai 4000',
                'description' => 'Recherche standard Douala→Yaoundé demain à 16h avec budget 4000',
            ],
            [
                'phrase' => 'douala yaounde demain j\'ai 3500',
                'description' => 'Budget plus bas (3500) - tolérance +20% = max 4200',
            ],
            [
                'phrase' => 'yaounde bamenda apres demain 08h',
                'description' => 'Autre trajet: Yaoundé→Bamenda après-demain',
            ],
            [
                'phrase' => 'paris london demain',
                'description' => 'Villes inexistantes (test d\'erreur)',
            ],
        ];

        foreach ($searchCases as $case) {
            $this->line('');
            $this->line("📢 Phrase: <comment>\"{$case['phrase']}\"</comment>");
            $this->line("ℹ️  {$case['description']}");

            $parsed = $this->voiceService->parseSearchQuery($case['phrase']);

            if (!$parsed['departure'] || !$parsed['destination']) {
                $this->line('❌ <error>Erreur: Villes non trouvées</error>');
                continue;
            }

            // Simuler une recherche
            $trips = Trip::where('departure_city', $parsed['departure'])
                         ->where('arrival_city', $parsed['destination'])
                         ->where('departure_date', $parsed['date'])
                         ->when($parsed['budget'], function ($q) use ($parsed) {
                             $maxPrice = $parsed['budget'] * 1.2;
                             return $q->where('price_per_seat', '<=', $maxPrice);
                         })
                         ->available()
                         ->get();

            if ($trips->isEmpty()) {
                $this->line('   ℹ️  <info>Aucun trajet trouvé</info>');
            } else {
                $this->line("   ✅ <info>{$trips->count()} trajet(s) trouve(s)</info>");

                foreach ($trips as $trip) {
                    $this->line('');
                    $this->line("   Trajet #{$trip->id}:");
                    $this->line("      • Conducteur: {$trip->driver->name}");
                    $this->line("      • Véhicule: {$trip->vehicle->brand} {$trip->vehicle->model}");
                    $this->line("      • Heure: {$trip->departure_time}");
                    $this->line("      • Prix: {$trip->price_per_seat} FCFA");
                    $this->line("      • Places: {$trip->available_seats}");

                    if ($parsed['budget']) {
                        $diff = abs($trip->price_per_seat - $parsed['budget']);
                        $this->line("      • Différence avec budget: <comment>+{$diff} FCFA</comment>");
                    }
                }
            }
        }
    }
}
