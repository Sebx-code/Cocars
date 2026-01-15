<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

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
}
