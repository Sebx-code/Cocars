<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    /**
     * Fil d'actualité (public) : liste des trajets publiés avec conducteur + photos véhicule.
     *
     * Query params:
     * - per_page (default 10)
     * - page
     * - departure_city, arrival_city, date (optionnels)
     */
    public function index(Request $request)
    {
        $query = Trip::query()
            ->with([
                'driver:id,name,avatar,rating',
                'vehicle:id,user_id,brand,model,color,registration_number,seats',
                'vehicle.photos:id,vehicle_id,path,is_primary,sort_order,created_at',
            ])
            ->available();

        // Filtres simples (pour conserver l'aspect "feed" + recherche)
        if ($request->filled('departure_city')) {
            $query->fromCity($request->departure_city);
        }
        if ($request->filled('arrival_city')) {
            $query->toCity($request->arrival_city);
        }
        if ($request->filled('date')) {
            $query->onDate($request->date);
        }

        // "Feed" : on trie par publication récente (created_at)
        $query->reorder('created_at', 'desc');

        $perPage = (int) $request->input('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $trips = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $trips->items(),
            'meta' => [
                'current_page' => $trips->currentPage(),
                'last_page' => $trips->lastPage(),
                'per_page' => $trips->perPage(),
                'total' => $trips->total(),
            ],
        ]);
    }
}
