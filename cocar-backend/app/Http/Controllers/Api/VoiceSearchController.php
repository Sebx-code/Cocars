<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Services\VoiceSearchService;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Contrôleur pour la recherche vocale de trajets
 * 
 * Endpoint : POST /api/voice-search
 * Payload : { "query": "je recherche un trajet douala yaounde demain a 16h j'ai 4000" }
 */
class VoiceSearchController extends Controller
{
    private VoiceSearchService $voiceSearchService;

    public function __construct(VoiceSearchService $voiceSearchService)
    {
        $this->voiceSearchService = $voiceSearchService;
    }

    /**
     * Recherche les trajets basée sur une requête vocale
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        // Valider que la requête contient 'query'
        $request->validate([
            'query' => 'required|string|min:5',
        ]);

        $voiceQuery = $request->input('query');

        // Parser la requête vocale
        $parsedQuery = $this->voiceSearchService->parseSearchQuery($voiceQuery);

        // Vérifier s'il y a une erreur de parsing
        if ($parsedQuery['error']) {
            return response()->json([
                'success' => false,
                'message' => $parsedQuery['error'],
                'parsed_query' => $parsedQuery,
            ], 400);
        }

        // Vérifier que les villes de départ et destination sont présentes
        if (!$parsedQuery['departure'] || !$parsedQuery['destination']) {
            return response()->json([
                'success' => false,
                'message' => 'Les villes de départ et destination n\'ont pas pu être extraites',
                'parsed_query' => $parsedQuery,
            ], 400);
        }

        // Rechercher les trajets correspondants
        $trips = $this->searchTrips($parsedQuery);

        return response()->json([
            'success' => true,
            'message' => count($trips) > 0 ? 'Trajets trouvés' : 'Aucun trajet ne correspond aux critères',
            'parsed_query' => $parsedQuery,
            'trips_count' => count($trips),
            'trips' => $trips,
        ]);
    }

    /**
     * Filtre les trajets selon les critères extraits de la requête vocale
     * 
     * Critères de recherche :
     * - Ville de départ : EXACTE
     * - Ville d'arrivée : EXACTE
     * - Date : exacte ou approximative
     * - Heure : non utilisée pour filtrer, à titre informatif
     * - Budget : tolérance de +20% sur le prix
     * 
     * @param array $params Tableaucontenant departure, destination, date, time, budget
     * @return array Trajets triés par pertinence (proximité du budget)
     */
    private function searchTrips(array $params): array
    {
        $query = Trip::with([
            'driver:id,name,avatar,rating,credibility_points',
            'vehicle:id,user_id,brand,model,color,registration_number',
            'vehicle.photos:id,vehicle_id,path,is_primary,sort_order,created_at',
        ])
        ->available();

        // Filtre 1 : Ville de départ EXACTE
        if ($params['departure']) {
            $query->where('departure_city', '=', $params['departure']);
        }

        // Filtre 2 : Ville d'arrivée EXACTE
        if ($params['destination']) {
            $query->where('arrival_city', '=', $params['destination']);
        }

        // Filtre 3 : Date (si fournie)
        if ($params['date']) {
            $query->whereDate('departure_date', '=', $params['date']);
        }

        // Filtre 4 : Budget avec tolérance de 20%
        if ($params['budget'] && $params['budget'] > 0) {
            $maxPrice = $params['budget'] * 1.2; // Tolérance de +20%
            $query->where('price_per_seat', '<=', $maxPrice);
        }

        // Récupérer les trajets
        $trips = $query->get()->toArray();

        // Tri 5 : Trier par pertinence (prix le plus proche du budget)
        if ($params['budget'] && $params['budget'] > 0 && !empty($trips)) {
            usort($trips, function ($a, $b) use ($params) {
                $diffA = abs($a['price_per_seat'] - $params['budget']);
                $diffB = abs($b['price_per_seat'] - $params['budget']);
                return $diffA <=> $diffB;
            });
        } else {
            // Sinon, tri par date de départ puis par crédibilité du chauffeur
            usort($trips, function ($a, $b) {
                $dateCompare = strcmp($a['departure_date'], $b['departure_date']);
                if ($dateCompare !== 0) {
                    return $dateCompare;
                }
                return $b['driver']['credibility_points'] <=> $a['driver']['credibility_points'];
            });
        }

        return array_values($trips);
    }

    /**
     * Retourne la liste des villes supportées pour la recherche vocale
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSupportedCities()
    {
        return response()->json([
            'success' => true,
            'cities' => $this->voiceSearchService->getSupportedCities(),
        ]);
    }
}
