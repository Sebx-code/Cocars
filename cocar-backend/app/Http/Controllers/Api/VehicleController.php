<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Mes véhicules
     */
    public function index(Request $request)
    {
        $vehicles = $request->user()->vehicles()->get();

        return $this->success($vehicles);
    }

    /**
     * Afficher un véhicule
     */
    public function show(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->error('Accès non autorisé', 403);
        }

        return $this->success($vehicle);
    }

    /**
     * Créer un véhicule
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'color' => 'required|string|max:30',
            'plate_number' => 'required|string|max:20|unique:vehicles',
            'seats' => 'required|integer|min:2|max:9',
            'year' => 'nullable|integer|min:1990|max:' . (date('Y') + 1),
            'photo' => 'nullable|string',
        ]);

        $vehicle = Vehicle::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return $this->success($vehicle, 'Véhicule ajouté', 201);
    }

    /**
     * Mettre à jour un véhicule
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            return $this->error('Ce véhicule ne vous appartient pas', 403);
        }

        $validated = $request->validate([
            'brand' => 'sometimes|string|max:50',
            'model' => 'sometimes|string|max:50',
            'color' => 'sometimes|string|max:30',
            'plate_number' => 'sometimes|string|max:20|unique:vehicles,plate_number,' . $vehicle->id,
            'seats' => 'sometimes|integer|min:2|max:9',
            'year' => 'nullable|integer|min:1990|max:' . (date('Y') + 1),
            'photo' => 'nullable|string',
        ]);

        $vehicle->update($validated);

        return $this->success($vehicle, 'Véhicule mis à jour');
    }

    /**
     * Supprimer un véhicule
     */
    public function destroy(Request $request, Vehicle $vehicle)
    {
        if ($vehicle->user_id !== $request->user()->id) {
            return $this->error('Ce véhicule ne vous appartient pas', 403);
        }

        // Vérifier si le véhicule est utilisé dans des trajets actifs
        $activeTrips = $vehicle->trips()
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->exists();

        if ($activeTrips) {
            return $this->error('Ce véhicule est utilisé dans des trajets actifs', 400);
        }

        $vehicle->delete();

        return $this->success(null, 'Véhicule supprimé');
    }
}
