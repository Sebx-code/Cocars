<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Profil public d'un utilisateur
     */
    public function profile(User $user)
    {
        $user->loadCount([
            'ratingsReceived',
            'tripsAsDriver' => fn($q) => $q->where('status', 'completed'),
        ]);

        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'is_verified' => $user->is_verified,
            'rating' => $user->rating,
            'ratings_received_count' => $user->ratings_received_count,
            'trips_as_driver_count' => $user->trips_as_driver_count,
            'member_since' => $user->created_at->format('F Y'),
        ]);
    }

    /**
     * Statistiques de l'utilisateur connecté
     */
    public function stats(Request $request)
    {
        $stats = $request->user()->getStats();

        return $this->success($stats);
    }

    /**
     * Mettre à jour le profil de l'utilisateur connecté
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update($validated);

        return $this->success($user, 'Profil mis à jour avec succès');
    }

    /**
     * Upload photo de profil
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // Max 2MB
        ]);

        $user = $request->user();

        // Supprimer l'ancienne photo si elle existe
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Sauvegarder la nouvelle photo
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return $this->success([
            'avatar' => $path,
            'avatar_url' => Storage::disk('public')->url($path),
        ], 'Photo de profil mise à jour avec succès');
    }

    /**
     * Supprimer la photo de profil
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return $this->success(null, 'Photo de profil supprimée avec succès');
    }
}
