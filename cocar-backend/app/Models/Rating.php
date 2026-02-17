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

            // Ajuster les points de crédibilité selon la note
            $rating->adjustCredibilityPoints();

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
            // Recalculer la crédibilité si la note change
            $rating->adjustCredibilityPoints();
        });

        static::deleted(function (Rating $rating) {
            $rating->ratedUser->updateRating();
        });
    }

    // ============ MÉTHODES DE CRÉDIBILITÉ ============

    /**
     * Ajuster les points de crédibilité selon la note reçue
     */
    public function adjustCredibilityPoints(): void
    {
        $user = $this->ratedUser;

        if ($this->rating >= 5) {
            // Excellente note : +20 points
            $user->addCredibilityPoints(
                User::CREDIBILITY_REASONS['excellent_rating'],
                "Note excellente (5/5) de {$this->rater->name}"
            );
        } elseif ($this->rating >= 4) {
            // Bonne note : +10 points
            $user->addCredibilityPoints(
                User::CREDIBILITY_REASONS['good_rating'],
                "Bonne note (4/5) de {$this->rater->name}"
            );
        } elseif ($this->rating <= 2) {
            // Mauvaise note : -15 points
            $user->removeCredibilityPoints(
                abs(User::CREDIBILITY_REASONS['bad_rating']),
                "Mauvaise note ({$this->rating}/5) de {$this->rater->name}"
            );
        }
        // Note 3/5 : neutre, pas de changement de crédibilité
    }
}
