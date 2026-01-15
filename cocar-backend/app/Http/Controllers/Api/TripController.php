<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TripController extends Controller
{
    /**
     * Liste des trajets disponibles avec recherche
     */
    public function index(Request $request)
    {
        $query = Trip::with(['driver', 'vehicle'])
            ->available()
            ->orderBy('departure_date')
            ->orderBy('departure_time');

        // Filtres de recherche
        if ($request->filled('departure_city')) {
            $query->fromCity($request->departure_city);
        }

        if ($request->filled('arrival_city')) {
            $query->toCity($request->arrival_city);
        }

        if ($request->filled('date')) {
            $query->onDate($request->date);
        }

        if ($request->filled('passengers')) {
            $query->withMinSeats((int) $request->passengers);
        }

        if ($request->filled('min_price') || $request->filled('max_price')) {
            $query->priceBetween(
                $request->filled('min_price') ? (int) $request->min_price : null,
                $request->filled('max_price') ? (int) $request->max_price : null
            );
        }

        // Tri
        if ($request->filled('sort_by')) {
            $sortOrder = $request->input('sort_order', 'asc');
            
            switch ($request->sort_by) {
                case 'price':
                    $query->reorder('price_per_seat', $sortOrder);
                    break;
                case 'rating':
                    $query->join('users', 'trips.driver_id', '=', 'users.id')
                          ->reorder('users.rating', $sortOrder)
                          ->select('trips.*');
                    break;
                case 'date':
                default:
                    $query->reorder('departure_date', $sortOrder)
                          ->orderBy('departure_time', $sortOrder);
            }
        }

        $trips = $query->paginate($request->input('per_page', 10));

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

    /**
     * Recherche de trajets (alias pour index avec params)
     */
    public function search(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Afficher un trajet
     */
    public function show(Trip $trip)
    {
        $trip->load(['driver', 'vehicle', 'bookings' => function ($query) {
            $query->whereIn('status', ['confirmed', 'completed'])
                  ->with('passenger:id,name,avatar,rating');
        }]);

        return $this->success($trip);
    }

    /**
     * Créer un nouveau trajet
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'departure_city' => 'required|string|max:100',
                'departure_address' => 'required|string|max:255',
                'departure_lat' => 'nullable|numeric',
                'departure_lng' => 'nullable|numeric',
                'arrival_city' => 'required|string|max:100',
                'arrival_address' => 'required|string|max:255',
                'arrival_lat' => 'nullable|numeric',
                'arrival_lng' => 'nullable|numeric',
                'departure_date' => 'required|date|after_or_equal:today',
                'departure_time' => ['required', 'string', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
                'estimated_arrival_time' => ['nullable', 'string', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
                'available_seats' => 'required|integer|min:1|max:8',
                'price_per_seat' => 'required|integer|min:100',
                'description' => 'nullable|string|max:1000',
                'vehicle_id' => 'nullable|exists:vehicles,id',
                'luggage_allowed' => 'sometimes|boolean',
                'pets_allowed' => 'sometimes|boolean',
                'smoking_allowed' => 'sometimes|boolean',
                'music_allowed' => 'sometimes|boolean',
                'air_conditioning' => 'sometimes|boolean',
            ]);

            // Normaliser le format de l'heure (enlever les secondes si présentes)
            if (isset($validated['departure_time'])) {
                $validated['departure_time'] = substr($validated['departure_time'], 0, 5);
            }
            if (isset($validated['estimated_arrival_time'])) {
                $validated['estimated_arrival_time'] = substr($validated['estimated_arrival_time'], 0, 5);
            }

            // Vérifier que le véhicule appartient à l'utilisateur
            if (isset($validated['vehicle_id'])) {
                $vehicle = $request->user()->vehicles()->find($validated['vehicle_id']);
                if (!$vehicle) {
                    return $this->error('Ce véhicule ne vous appartient pas', 403);
                }
            }

            $trip = Trip::create([
                ...$validated,
                'driver_id' => $request->user()->id,
                'total_seats' => $validated['available_seats'],
                'status' => 'confirmed',
            ]);

            $trip->load(['driver', 'vehicle']);

            return $this->success($trip, 'Trajet créé avec succès', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Erreur de validation', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Erreur création trajet: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);
            return $this->error('Erreur lors de la création du trajet: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mettre à jour un trajet
     */
    public function update(Request $request, Trip $trip)
    {
        // Vérifier que l'utilisateur est le conducteur
        if ($trip->driver_id !== $request->user()->id) {
            return $this->error('Vous n\'êtes pas autorisé à modifier ce trajet', 403);
        }

        // Vérifier que le trajet peut être modifié
        if (in_array($trip->status, ['completed', 'cancelled', 'in_progress'])) {
            return $this->error('Ce trajet ne peut plus être modifié', 400);
        }

        $validated = $request->validate([
            'departure_city' => 'sometimes|string|max:100',
            'departure_address' => 'sometimes|string|max:255',
            'arrival_city' => 'sometimes|string|max:100',
            'arrival_address' => 'sometimes|string|max:255',
            'departure_date' => 'sometimes|date|after_or_equal:today',
            'departure_time' => 'sometimes|date_format:H:i',
            'estimated_arrival_time' => 'nullable|date_format:H:i',
            'available_seats' => 'sometimes|integer|min:1|max:8',
            'price_per_seat' => 'sometimes|integer|min:100',
            'description' => 'nullable|string|max:1000',
            'luggage_allowed' => 'boolean',
            'pets_allowed' => 'boolean',
            'smoking_allowed' => 'boolean',
            'music_allowed' => 'boolean',
            'air_conditioning' => 'boolean',
            'status' => 'sometimes|in:pending,confirmed,cancelled',
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        // Si annulation
        if (isset($validated['status']) && $validated['status'] === 'cancelled') {
            $trip->cancel($validated['cancellation_reason'] ?? null);
            return $this->success($trip->fresh(), 'Trajet annulé');
        }

        $trip->update($validated);

        return $this->success($trip->fresh(['driver', 'vehicle']), 'Trajet mis à jour');
    }

    /**
     * Supprimer un trajet
     */
    public function destroy(Request $request, Trip $trip)
    {
        if ($trip->driver_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->error('Vous n\'êtes pas autorisé à supprimer ce trajet', 403);
        }

        // Annuler d'abord si nécessaire
        if (in_array($trip->status, ['pending', 'confirmed'])) {
            $trip->cancel('Trajet supprimé par le conducteur');
        }

        $trip->delete();

        return $this->success(null, 'Trajet supprimé');
    }

    /**
     * Mes trajets (en tant que conducteur)
     */
    public function myTrips(Request $request)
    {
        $trips = $request->user()
            ->tripsAsDriver()
            ->with(['vehicle', 'bookings.passenger'])
            ->latest()
            ->paginate($request->input('per_page', 10));

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
