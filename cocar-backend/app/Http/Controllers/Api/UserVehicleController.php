<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserVehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserVehicleController extends Controller
{
    /**
     * Obtenir tous les véhicules de l'utilisateur connecté
     */
    public function index()
    {
        $vehicles = Auth::user()->userVehicles()->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $vehicles
        ]);
    }

    /**
     * Créer un nouveau véhicule
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'registration_number' => ['required', 'string', 'max:20', 'unique:user_vehicles,registration_number'],
            'brand' => ['required', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:50'],
            'color' => ['required', 'string', 'max:30'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'seats' => ['nullable', 'integer', 'min:1', 'max:9'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $user = Auth::user();

        // Si c'est le véhicule par défaut, désactiver les autres
        if ($validated['is_default'] ?? false) {
            $user->userVehicles()->update(['is_default' => false]);
        }

        // Si c'est le premier véhicule, le mettre par défaut
        if ($user->userVehicles()->count() === 0) {
            $validated['is_default'] = true;
        }

        $vehicle = $user->userVehicles()->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Véhicule ajouté avec succès',
            'data' => $vehicle
        ], 201);
    }

    /**
     * Obtenir un véhicule spécifique
     */
    public function show($id)
    {
        $vehicle = Auth::user()->userVehicles()->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $vehicle
        ]);
    }

    /**
     * Mettre à jour un véhicule
     */
    public function update(Request $request, $id)
    {
        $vehicle = Auth::user()->userVehicles()->findOrFail($id);

        $validated = $request->validate([
            'registration_number' => ['sometimes', 'string', 'max:20', Rule::unique('user_vehicles')->ignore($vehicle->id)],
            'brand' => ['sometimes', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:50'],
            'color' => ['sometimes', 'string', 'max:30'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'seats' => ['nullable', 'integer', 'min:1', 'max:9'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        // Si on définit ce véhicule comme par défaut, désactiver les autres
        if (isset($validated['is_default']) && $validated['is_default']) {
            Auth::user()->userVehicles()->where('id', '!=', $vehicle->id)->update(['is_default' => false]);
        }

        $vehicle->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Véhicule mis à jour avec succès',
            'data' => $vehicle
        ]);
    }

    /**
     * Supprimer un véhicule
     */
    public function destroy($id)
    {
        $vehicle = Auth::user()->userVehicles()->findOrFail($id);

        $wasDefault = $vehicle->is_default;
        $vehicle->delete();

        // Si c'était le véhicule par défaut, en définir un autre
        if ($wasDefault) {
            $newDefault = Auth::user()->userVehicles()->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Véhicule supprimé avec succès'
        ]);
    }

    /**
     * Définir un véhicule comme par défaut
     */
    public function setDefault($id)
    {
        $vehicle = Auth::user()->userVehicles()->findOrFail($id);

        // Désactiver tous les autres
        Auth::user()->userVehicles()->update(['is_default' => false]);

        // Activer celui-ci
        $vehicle->update(['is_default' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Véhicule défini comme par défaut',
            'data' => $vehicle
        ]);
    }
}
