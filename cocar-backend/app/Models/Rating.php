<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'rater_id',
        'rated_user_id',
        'rating',
        'comment',
        'rating_type',
        'punctuality',
        'communication',
        'comfort',
    ];

    protected $casts = [
        'rating' => 'integer',
        'punctuality' => 'integer',
        'communication' => 'integer',
        'comfort' => 'integer',
    ];

    // ============ RELATIONS ============

    /**
     * Trajet concerné
     */
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Utilisateur qui a noté
     */
    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    /**
     * Utilisateur noté
     */
    public function ratedUser()
    {
        return $this->belongsTo(User::class, 'rated_user_id');
    }

    // ============ ÉVÉNEMENTS ============

    protected static function booted(): void
    {
        // Après création d'une évaluation, mettre à jour la note moyenne de l'utilisateur
        static::created(function (Rating $rating) {
            $rating->ratedUser->updateRating();

            // Notifier l'utilisateur noté
            Notification::create([
                'user_id' => $rating->rated_user_id,
                'type' => 'new_rating',
                'title' => 'Nouvelle évaluation',
                'message' => "{$rating->rater->name} vous a attribué {$rating->rating} étoile(s).",
                'data' => ['rating_id' => $rating->id, 'trip_id' => $rating->trip_id],
            ]);
        });

        static::updated(function (Rating $rating) {
            $rating->ratedUser->updateRating();
        });

        static::deleted(function (Rating $rating) {
            $rating->ratedUser->updateRating();
        });
    }
}
