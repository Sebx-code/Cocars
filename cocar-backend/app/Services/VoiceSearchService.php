<?php

namespace App\Services;

use Carbon\Carbon;

/**
 * Service pour parser les requêtes de recherche vocale de trajets
 *
 * Exemple : "je recherche un trajet douala yaounde demain a 16h j'ai 4000"
 * Retourne :
 * {
 *   "departure": "Douala",
 *   "destination": "Yaoundé",
 *   "date": "2026-04-10",
 *   "time": "16:00",
 *   "budget": 4000
 * }
 */
class VoiceSearchService
{
    /**
     * Liste prédéfinie des villes supportées
     * Avec variantes (minuscules) pour la reconnaissance
     */
    private const CITIES_MAP = [
        'douala' => 'Douala',
        'yaounde' => 'Yaoundé',
        'ydé' => 'Yaoundé',
        'yaoundé' => 'Yaoundé',
        'bamenda' => 'Bamenda',
        'limbe' => 'Limbe',
        'kribi' => 'Kribi',
        'buea' => 'Buea',
        'garoua' => 'Garoua',
        'ngaoundere' => 'Ngaoundéré',
        'ngaoundéré' => 'Ngaoundéré',
        'bertoua' => 'Bertoua',
        'ebolowa' => 'Ebolowa',
        'dschang' => 'Dschang',
        'bafoussam' => 'Bafoussam',
    ];

    /**
     * Parse une phrase vocale et extrait les paramètres de recherche
     *
     * @param string $query La phrase vocale
     * @return array Tableau avec departure, destination, date, time, budget
     */
    public function parseSearchQuery(string $query): array
    {
        $query = trim($query);

        // Normaliser la casse
        $normalizedQuery = mb_strtolower($query, 'UTF-8');

        $result = [
            'departure' => null,
            'destination' => null,
            'date' => null,
            'time' => null,
            'budget' => null,
            'error' => null,
        ];

        try {
            // 1. Extraire les villes
            $cities = $this->extractCities($normalizedQuery);
            if (isset($cities['departure'])) {
                $result['departure'] = $cities['departure'];
            }
            if (isset($cities['destination'])) {
                $result['destination'] = $cities['destination'];
            }

            // 2. Extraire la date
            $result['date'] = $this->extractDate($normalizedQuery);

            // 3. Extraire l'heure
            $result['time'] = $this->extractTime($normalizedQuery);

            // 4. Extraire le budget
            $result['budget'] = $this->extractBudget($normalizedQuery);

            // Valider que nous avons au moins une ville de départ et destination
            if (!$result['departure'] || !$result['destination']) {
                $result['error'] = 'Villes de départ ou destination non trouvées';
            }

        } catch (\Exception $e) {
            $result['error'] = 'Erreur lors du parsing : ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * Extrait les villes de départ et destination
     *
     * @param string $query La phrase normalisée
     * @return array Contenant 'departure' et 'destination'
     */
    private function extractCities(string $query): array
    {
        $cities = [];
        $foundCities = [];

        // Chercher toutes les villes mentionnées dans la requête
        foreach (self::CITIES_MAP as $cityVariant => $cityName) {
            if (strpos($query, $cityVariant) !== false) {
                if (!in_array($cityName, $foundCities)) {
                    $foundCities[] = $cityName;
                }
            }
        }

        // Assigner les villes trouvées
        if (count($foundCities) >= 2) {
            $cities['departure'] = $foundCities[0];
            $cities['destination'] = $foundCities[1];
        } elseif (count($foundCities) === 1) {
            // Si une seule ville est trouvée, on ne peut pas continuer
            $cities['departure'] = $foundCities[0];
        }

        return $cities;
    }

    /**
     * Extrait la date de la requête
     * Supporte : "demain", "aujourd'hui", dates complètes
     *
     * @param string $query La phrase normalisée
     * @return string|null La date au format YYYY-MM-DD
     */
    private function extractDate(?string $query): ?string
    {
        if (!$query) {
            return null;
        }

        // Chercher des mots clés pour demain
        if (strpos($query, 'demain') !== false) {
            return Carbon::tomorrow()->toDateString();
        }

        // Chercher des mots clés pour aujourd'hui
        if (strpos($query, "aujourd'hui") !== false || strpos($query, 'aujourd hui') !== false) {
            return Carbon::today()->toDateString();
        }

        // Chercher une date au format JJ/MM ou JJ-MM (ex: "14/04" ou "14-04")
        if (preg_match('/(\d{1,2})[\/\-](\d{1,2})/', $query, $matches)) {
            $day = (int)$matches[1];
            $month = (int)$matches[2];

            try {
                // Assumer l'année actuelle
                $date = Carbon::createFromDate(date('Y'), $month, $day);

                // Si la date est dans le passé, prendre l'année suivante
                if ($date->isPast()) {
                    $date->addYear();
                }

                return $date->toDateString();
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }

    /**
     * Extrait l'heure de la requête
     * Supporte : "16h", "16:00", "seize heures"
     *
     * @param string $query La phrase normalisée
     * @return string|null L'heure au format HH:MM
     */
    private function extractTime(?string $query): ?string
    {
        if (!$query) {
            return null;
        }

        // Chercher format "14h" ou "14h30"
        if (preg_match('/(\d{1,2})h(\d{2})?/', $query, $matches)) {
            $hour = (int)$matches[1];
            $minutes = isset($matches[2]) ? (int)$matches[2] : 0;

            if ($hour >= 0 && $hour <= 23 && $minutes >= 0 && $minutes <= 59) {
                return sprintf('%02d:%02d', $hour, $minutes);
            }
        }

        // Chercher format "14:00"
        if (preg_match('/(\d{1,2}):(\d{2})/', $query, $matches)) {
            $hour = (int)$matches[1];
            $minutes = (int)$matches[2];

            if ($hour >= 0 && $hour <= 23 && $minutes >= 0 && $minutes <= 59) {
                return sprintf('%02d:%02d', $hour, $minutes);
            }
        }

        return null;
    }

    /**
     * Extrait le budget (montant disponible) de la requête
     * Supporte : "j'ai 4000", "budget 5000", "prix 3500"
     *
     * @param string $query La phrase normalisée
     * @return int|null Le budget en FCFA
     */
    private function extractBudget(?string $query): ?int
    {
        if (!$query) {
            return null;
        }

        // Chercher les patterns contenant des montants
        // Chercher "j'ai NNNN" ou "j ai NNNN"
        if (preg_match("/(j'ai|j ai|budget|prix|cout|coût|montant)\s+(\d{1,6})/", $query, $matches)) {
            return (int)$matches[2];
        }

        // Chercher simplement un nombre (le dernier nombre de la phrase)
        if (preg_match('/(\d{3,6})(?!h)/', $query, $matches)) {
            // Prendre le dernier nombre trouvé
            preg_match_all('/(\d{3,6})(?!h)/', $query, $allMatches);
            $budgets = $allMatches[1];

            if (!empty($budgets)) {
                return (int)end($budgets);
            }
        }

        return null;
    }

    /**
     * Validez les villes contre la liste supportée
     *
     * @param string $city Le nom de la ville
     * @return string|null Le nom canonique de la ville ou null
     */
    public function validateCity(string $city): ?string
    {
        $normalizedCity = mb_strtolower(trim($city), 'UTF-8');

        return self::CITIES_MAP[$normalizedCity] ?? null;
    }

    /**
     * Retourne la liste des villes supportées
     *
     * @return array
     */
    public function getSupportedCities(): array
    {
        return array_values(array_unique(self::CITIES_MAP));
    }
}
