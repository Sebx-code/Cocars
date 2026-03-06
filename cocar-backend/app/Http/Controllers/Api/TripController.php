<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TripController extends Controller
{
    /**
     * Liste des trajets disponibles avec recherche
     */
    public function index(Request $request)
    {
        // Clé de cache basée sur les paramètres de recherche
        $cacheKey = 'trips_list_' . md5(json_encode($request->all()));
        
        // Cache de 5 minutes pour les listes de trajets
        return cache()->remember($cacheKey, 300, function () use ($request) {
            $query = Trip::with([
                    'driver:id,name,avatar,rating,credibility_points',
                    'vehicle:id,user_id,brand,model,color,registration_number',
                    'vehicle.photos:id,vehicle_id,path,is_primary,sort_order,created_at',
                ])
                ->available();
            
            return $this->applyFiltersAndPaginate($query, $request);
        });
    }
    
    /**
     * Appliquer les filtres et paginer
     */
    private function applyFiltersAndPaginate($query, Request $request)
    {

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
                case 'credibility':
                    // Tri par points de crédibilité (étoiles)
                    $query->join('users', 'trips.driver_id', '=', 'users.id')
                          ->reorder('users.credibility_points', $sortOrder)
                          ->select('trips.*');
                    break;
                case 'date':
                default:
                    $query->reorder('departure_date', $sortOrder)
                          ->orderBy('departure_time', $sortOrder);
            }
        } else {
            // Par défaut, trier par crédibilité (descendant) puis par date
            // Les chauffeurs avec plus de crédibilité apparaissent en haut
            $query->join('users', 'trips.driver_id', '=', 'users.id')
                  ->orderBy('users.credibility_points', 'desc')
                  ->orderBy('trips.departure_date', 'asc')
                  ->orderBy('trips.departure_time', 'asc')
                  ->select('trips.*');
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
        // Cache le détail du trajet pendant 2 minutes
        $cacheKey = 'trip_detail_' . $trip->id;
        
        $tripData = cache()->remember($cacheKey, 120, function () use ($trip) {
            $tripData = $trip->load([
                'driver:id,name,avatar,rating,total_trips_as_driver,credibility_points',
                'vehicle:id,user_id,brand,model,color,registration_number,seats',
                'vehicle.photos:id,vehicle_id,path,is_primary,sort_order,created_at',
                'bookings' => function ($query) {
                    $query->whereIn('status', ['confirmed', 'completed'])
                          ->with('passenger:id,name,avatar,rating');
                }
            ]);
            
            // Ajouter les étoiles de crédibilité
            $tripData->driver->credibility_stars = $tripData->driver->getCredibilityStars();
            
            return $tripData;
        });

        return $this->success($tripData);
    }

    /**
     * Créer un nouveau trajet
     */
    public function store(Request $request)
    {
        Log::info('donnees avant validation',['data'=> $request->all()]);
        try {
             Log::info('donnees avant validation-try',['data'=> $request->all()]);
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
                'luggage_allowed' => 'sometimes|boolean',
                'pets_allowed' => 'sometimes|boolean',
                'smoking_allowed' => 'sometimes|boolean',
                'music_allowed' => 'sometimes|boolean',
                'air_conditioning' => 'sometimes|boolean',
                //Informations du véhicule (obligatoires)
                'vehicle_registration' => 'required|string|max:20',
                'vehicle_brand' => 'required|string|max:50',
                'vehicle_color' => 'required|string|max:30',

                // Photos du véhicule (optionnel)
                'vehicle_photos' => 'nullable|array|max:6',
                'vehicle_photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:4096'
            ]);
            Log::info('donnees apres validation',['data'=> $request]);

            // Normaliser le format de l'heure (enlever les secondes si présentes)
            if (isset($validated['departure_time'])) {
                $validated['departure_time'] = substr($validated['departure_time'], 0, 5);
            }
            if (isset($validated['estimated_arrival_time'])) {
                $validated['estimated_arrival_time'] = substr($validated['estimated_arrival_time'], 0, 5);
            }

            $user = $request->user();
            $userVehicleId = null;

            // Vérifier si un véhicule avec cette immatriculation existe déjà pour cet utilisateur
            $existingVehicle = $user->userVehicles()
                ->where('registration_number', $validated['vehicle_registration'])
                ->first();

            if ($existingVehicle) {
                // Mettre à jour les infos du véhicule existant si nécessaire
                $existingVehicle->update([
                    'brand' => $validated['vehicle_brand'],
                    'color' => $validated['vehicle_color'],
                ]);
                $userVehicleId = $existingVehicle->id;
            } else {
                // Créer un nouveau véhicule pour l'utilisateur
                $newVehicle = $user->userVehicles()->create([
                    'registration_number' => $validated['vehicle_registration'],
                    'brand' => $validated['vehicle_brand'],
                    'color' => $validated['vehicle_color'],
                    'seats' => $validated['available_seats'],
                    'is_default' => $user->userVehicles()->count() === 0,
                ]);
                $userVehicleId = $newVehicle->id;
            }

            // Vérifier que le véhicule appartient à l'utilisateur (si vehicle_id fourni)
            if (isset($validated['vehicle_id'])) {
                $vehicle = $user->userVehicles()->find($validated['vehicle_id']);
                if (!$vehicle) {
                    return $this->error('Ce véhicule ne vous appartient pas', 403);
                }
                $userVehicleId = $validated['vehicle_id'];
            }

            // Charger le véhicule final
            $vehicle = $user->userVehicles()->with('photos')->findOrFail($userVehicleId);

            // Upload photos véhicule (optionnel)
            if ($request->hasFile('vehicle_photos')) {
                $files = $request->file('vehicle_photos');

                // Si aucune photo principale n'existe, la première uploadée devient principale
                $hasPrimary = $vehicle->photos()->where('is_primary', true)->exists();

                $baseSort = (int) $vehicle->photos()->max('sort_order');
                $baseSort = $baseSort < 0 ? 0 : $baseSort;

                foreach ($files as $idx => $file) {
                    $path = $file->store("vehicles/{$vehicle->id}", 'public');

                    $isPrimary = (!$hasPrimary && $idx === 0);

                    $vehicle->photos()->create([
                        'path' => $path,
                        'is_primary' => $isPrimary,
                        'sort_order' => $baseSort + 1 + $idx,
                    ]);
                }
            }

            // Créer le trajet
            $trip = Trip::create([
                'driver_id' => $user->id,
                'vehicle_id' => $userVehicleId,
                'departure_city' => $validated['departure_city'],
                'departure_address' => $validated['departure_address'],
                'departure_lat' => $validated['departure_lat'] ?? null,
                'departure_lng' => $validated['departure_lng'] ?? null,
                'arrival_city' => $validated['arrival_city'],
                'arrival_address' => $validated['arrival_address'],
                'arrival_lat' => $validated['arrival_lat'] ?? null,
                'arrival_lng' => $validated['arrival_lng'] ?? null,
                'departure_date' => $validated['departure_date'],
                'departure_time' => $validated['departure_time'],
                'estimated_arrival_time' => $validated['estimated_arrival_time'] ?? null,
                'available_seats' => $validated['available_seats'],
                'total_seats' => $validated['available_seats'],
                'price_per_seat' => $validated['price_per_seat'],
                'description' => $validated['description'] ?? null,
                'luggage_allowed' => $validated['luggage_allowed'] ?? true,
                'pets_allowed' => $validated['pets_allowed'] ?? false,
                'smoking_allowed' => $validated['smoking_allowed'] ?? false,
                'music_allowed' => $validated['music_allowed'] ?? true,
                'air_conditioning' => $validated['air_conditioning'] ?? true,
                'status' => 'confirmed',
            ]);
 Log::info('donnees avant validation-apresvalidation',['data'=> $request->all()]);
            $trip->load(['driver', 'vehicle.photos']);

            return $this->success($trip, 'Trajet créé avec succès', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Trip creation validation failed', [
                'errors' => $e->errors(),
                'payload_keys' => array_keys($request->all()),
            ]);

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
            DB::transaction(function () use ($trip, $validated) {
                // Rembourser les réservations avec paiement escrow
                $activeBookings = $trip->bookings()
                    ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_PENDING])
                    ->with('payment')
                    ->get();

                foreach ($activeBookings as $booking) {
                    if ($booking->hasEscrowPayment()) {
                        $booking->payment->refund(false);
                    }
                    $booking->update([
                        'status' => Booking::STATUS_CANCELLED,
                        'cancellation_reason' => $validated['cancellation_reason'] ?? 'Trajet annulé par le conducteur',
                    ]);
                }

                $trip->update([
                    'status' => 'cancelled',
                    'cancellation_reason' => $validated['cancellation_reason'] ?? null,
                ]);
            });
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

        DB::transaction(function () use ($trip) {
            // Annuler d'abord si nécessaire et rembourser les réservations confirmées
            if (in_array($trip->status, ['pending', 'confirmed'])) {
                // Rembourser les réservations confirmées avec paiement escrow
                $confirmedBookings = $trip->bookings()
                    ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_PENDING])
                    ->with('payment')
                    ->get();

                foreach ($confirmedBookings as $booking) {
                    if ($booking->hasEscrowPayment()) {
                        // Remboursement complet (conducteur responsable de l'annulation)
                        $booking->payment->refund(false);
                    }
                    $booking->update([
                        'status' => Booking::STATUS_CANCELLED,
                        'cancellation_reason' => 'Trajet supprimé par le conducteur',
                    ]);
                }

                $trip->update([
                    'status' => 'cancelled',
                    'cancellation_reason' => 'Trajet supprimé par le conducteur',
                ]);
            }

            $trip->delete();
        });

        return $this->success(null, 'Trajet supprimé');
    }

    /**
     * Mes trajets (en tant que conducteur)
     */
    public function myTrips(Request $request)
    {
        // Eager loading optimisé pour éviter N+1 queries
        $trips = $request->user()
            ->tripsAsDriver()
            ->with([
                'vehicle:id,user_id,brand,model,color,registration_number',
                'vehicle.photos:id,vehicle_id,path,is_primary,sort_order,created_at',
                'bookings' => function ($query) {
                    $query->select('id', 'trip_id', 'passenger_id', 'status', 'seats_booked', 'total_price')
                          ->with('passenger:id,name,avatar,rating');
                }
            ])
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
