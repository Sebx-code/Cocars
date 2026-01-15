<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    /**
     * Créer une évaluation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'rated_user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
            'rating_type' => 'required|in:driver,passenger',
            'punctuality' => 'nullable|integer|min:1|max:5',
            'communication' => 'nullable|integer|min:1|max:5',
            'comfort' => 'nullable|integer|min:1|max:5',
        ]);

        $user = $request->user();
        $trip = Trip::findOrFail($validated['trip_id']);

        // Vérifier que le trajet est terminé
        if ($trip->status !== 'completed') {
            return $this->error('Vous ne pouvez évaluer que les trajets terminés', 400);
        }

        // Vérifier que l'utilisateur a participé au trajet
        $isDriver = $trip->driver_id === $user->id;
        $isPassenger = $trip->bookings()
            ->where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->exists();

        if (!$isDriver && !$isPassenger) {
            return $this->error('Vous n\'avez pas participé à ce trajet', 403);
        }

        // Vérifier qu'il n'a pas déjà noté cet utilisateur pour ce trajet
        $existingRating = Rating::where('trip_id', $trip->id)
            ->where('rater_id', $user->id)
            ->where('rated_user_id', $validated['rated_user_id'])
            ->first();

        if ($existingRating) {
            return $this->error('Vous avez déjà évalué cet utilisateur pour ce trajet', 400);
        }

        $rating = Rating::create([
            'trip_id' => $validated['trip_id'],
            'rater_id' => $user->id,
            'rated_user_id' => $validated['rated_user_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'rating_type' => $validated['rating_type'],
            'punctuality' => $validated['punctuality'] ?? null,
            'communication' => $validated['communication'] ?? null,
            'comfort' => $validated['comfort'] ?? null,
        ]);

        $rating->load(['rater', 'ratedUser']);

        return $this->success($rating, 'Évaluation enregistrée', 201);
    }

    /**
     * Évaluations d'un utilisateur
     */
    public function userRatings(Request $request, User $user)
    {
        $query = $user->ratingsReceived()->with(['rater', 'trip']);

        if ($request->filled('type')) {
            $query->where('rating_type', $request->type);
        }

        $ratings = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $ratings->items(),
            'meta' => [
                'current_page' => $ratings->currentPage(),
                'last_page' => $ratings->lastPage(),
                'per_page' => $ratings->perPage(),
                'total' => $ratings->total(),
            ],
        ]);
    }

    /**
     * Moyenne des notes d'un utilisateur
     */
    public function userAverage(User $user)
    {
        $ratings = $user->ratingsReceived();

        return $this->success([
            'average' => round($ratings->avg('rating') ?? 0, 1),
            'total' => $ratings->count(),
            'as_driver' => round($ratings->clone()->where('rating_type', 'driver')->avg('rating') ?? 0, 1),
            'as_passenger' => round($ratings->clone()->where('rating_type', 'passenger')->avg('rating') ?? 0, 1),
        ]);
    }

    /**
     * Évaluations d'un trajet
     */
    public function tripRatings(Trip $trip)
    {
        $ratings = $trip->ratings()->with(['rater', 'ratedUser'])->get();

        return $this->success($ratings);
    }

    /**
     * Vérifier si l'utilisateur peut évaluer
     */
    public function canRate(Request $request, Trip $trip)
    {
        $user = $request->user();

        if ($trip->status !== 'completed') {
            return $this->success([
                'can_rate' => false,
                'reason' => 'Le trajet n\'est pas encore terminé',
            ]);
        }

        $isDriver = $trip->driver_id === $user->id;
        $isPassenger = $trip->bookings()
            ->where('passenger_id', $user->id)
            ->where('status', 'completed')
            ->exists();

        if (!$isDriver && !$isPassenger) {
            return $this->success([
                'can_rate' => false,
                'reason' => 'Vous n\'avez pas participé à ce trajet',
            ]);
        }

        return $this->success([
            'can_rate' => true,
            'as_driver' => $isDriver,
            'as_passenger' => $isPassenger,
        ]);
    }
}
