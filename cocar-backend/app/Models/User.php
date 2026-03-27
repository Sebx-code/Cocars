<?php

namespace App\Models;

use App\Models\Notification as UserNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'bio',
        'is_verified',
        'rating',
        'credibility_points',
        'total_positive_points',
        'total_negative_points',
        'total_rides',
        'total_trips_as_driver',
        'total_trips_as_passenger',
        'refresh_token',
        'refresh_token_expires_at',
        'id_card_path',
        'driver_license_path',
        'selfie_path',
        'verification_status',
        'verification_notes',
        'verified_at',
        'verified_by',
        'phone_verified',
        'phone_verification_code',
        'phone_verification_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'refresh_token',
        'phone_verification_code',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'rating' => 'decimal:2',
        'credibility_points' => 'integer',
        'total_positive_points' => 'integer',
        'total_negative_points' => 'integer',
        'refresh_token_expires_at' => 'datetime',
        'phone_verified' => 'boolean',
        'phone_verification_expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    // ============ RELATIONS ============

    /**
     * Véhicules de l'utilisateur (ancienne table)
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Véhicules personnels de l'utilisateur
     */
    public function userVehicles()
    {
        return $this->hasMany(UserVehicle::class);
    }

    /**
     * Conversations de l'utilisateur
     */
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_user')
            ->withPivot('last_read_at')
            ->withTimestamps()
            ->orderBy('last_message_at', 'desc');
    }

    /**
     * Messages envoyés par l'utilisateur
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Logs SMS de l'utilisateur
     */
    public function smsLogs()
    {
        return $this->hasMany(SmsLog::class);
    }

    /**
     * Nombre total de messages non lus
     */
    public function unreadMessagesCount()
    {
        return $this->conversations->sum(function ($conversation) {
            return $conversation->unreadCountForUser($this->id);
        });
    }

    /**
     * Trajets créés par l'utilisateur (en tant que conducteur)
     */
    public function tripsAsDriver()
    {
        return $this->hasMany(Trip::class, 'driver_id');
    }

    /**
     * Réservations de l'utilisateur (en tant que passager)
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'passenger_id');
    }

    /**
     * Paiements effectués par l'utilisateur
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'payer_id');
    }

    /**
     * Évaluations données par l'utilisateur
     */
    public function ratingsGiven()
    {
        return $this->hasMany(Rating::class, 'rater_id');
    }

    /**
     * Évaluations reçues par l'utilisateur
     */
    public function ratingsReceived()
    {
        return $this->hasMany(Rating::class, 'rated_user_id');
    }

    /**
     * Notifications de l'utilisateur
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Portefeuille de l'utilisateur
     */
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Obtenir ou créer le portefeuille
     */
    public function getOrCreateWallet(): Wallet
    {
        return Wallet::getOrCreate($this->id);
    }

    // ============ MÉTHODES ============

    /**
     * Vérifier si l'utilisateur est admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Calculer et mettre à jour la note moyenne
     */
    public function updateRating(): void
    {
        $average = $this->ratingsReceived()->avg('rating');
        $this->update(['rating' => $average]);
    }

    // ============ SYSTÈME DE CRÉDIBILITÉ ============

    /**
     * Points de crédibilité requis pour chaque niveau d'étoiles
     */
    public const CREDIBILITY_LEVELS = [
        1 => 0,      // 0-49 points = 1 étoile
        2 => 50,     // 50-99 points = 2 étoiles
        3 => 100,    // 100-199 points = 3 étoiles
        4 => 200,    // 200-399 points = 4 étoiles
        5 => 400,    // 400+ points = 5 étoiles
    ];

    /**
     * Raisons d'ajout/retrait de points
     */
    public const CREDIBILITY_REASONS = [
        'trip_completed' => 10,           // Trajet complété avec succès
        'excellent_rating' => 20,         // Note 5/5 reçue
        'good_rating' => 10,              // Note 4/5 reçue
        'on_time_departure' => 5,         // Départ à l'heure
        'driver_no_show' => -50,          // Chauffeur absent (pénalité -1 étoile)
        'passenger_no_show' => -10,       // Passager absent
        'trip_cancelled' => -5,           // Trajet annulé par le chauffeur
        'bad_rating' => -15,              // Note 1-2/5 reçue
        'multiple_complaints' => -30,     // Plusieurs plaintes
    ];

    /**
     * Calculer le nombre d'étoiles basé sur les points de crédibilité
     */
    public function getCredibilityStars(): int
    {
        $points = $this->credibility_points ?? 100;

        if ($points >= self::CREDIBILITY_LEVELS[5]) return 5;
        if ($points >= self::CREDIBILITY_LEVELS[4]) return 4;
        if ($points >= self::CREDIBILITY_LEVELS[3]) return 3;
        if ($points >= self::CREDIBILITY_LEVELS[2]) return 2;
        return 1;
    }

    /**
     * Ajouter des points de crédibilité
     */
    public function addCredibilityPoints(int $points, string $reason = null): void
    {
        $this->increment('credibility_points', $points);
        $this->increment('total_positive_points', $points);

        // Log de l'action
        \Log::info("Crédibilité ajoutée", [
            'user_id' => $this->id,
            'points' => $points,
            'reason' => $reason,
            'new_total' => $this->fresh()->credibility_points,
            'stars' => $this->getCredibilityStars(),
        ]);

        // Notification optionnelle
        if ($points >= 10) {
            UserNotification::create([
                'user_id' => $this->id,
                'type' => 'credibility_increased',
                'title' => 'Points de crédibilité gagnés !',
                'message' => "Vous avez gagné +{$points} points de crédibilité. " . ($reason ?? ''),
                'data' => ['points' => $points, 'reason' => $reason],
            ]);
        }
    }

    /**
     * Retirer des points de crédibilité
     */
    public function removeCredibilityPoints(int $points, string $reason = null): void
    {
        $oldStars = $this->getCredibilityStars();
        
        $this->decrement('credibility_points', $points);
        $this->increment('total_negative_points', $points);

        // Ne pas descendre en dessous de 0
        if ($this->credibility_points < 0) {
            $this->update(['credibility_points' => 0]);
        }

        $newStars = $this->fresh()->getCredibilityStars();

        // Log de l'action
        \Log::warning("Crédibilité retirée", [
            'user_id' => $this->id,
            'points' => -$points,
            'reason' => $reason,
            'new_total' => $this->fresh()->credibility_points,
            'old_stars' => $oldStars,
            'new_stars' => $newStars,
        ]);

        // Notification de perte de crédibilité
        UserNotification::create([
            'user_id' => $this->id,
            'type' => 'credibility_decreased',
            'title' => 'Perte de crédibilité',
            'message' => "Vous avez perdu -{$points} points de crédibilité. " . ($reason ?? ''),
            'data' => [
                'points' => -$points,
                'reason' => $reason,
                'old_stars' => $oldStars,
                'new_stars' => $newStars,
            ],
        ]);

        // Notification spéciale si perte d'étoile(s)
        if ($newStars < $oldStars) {
            UserNotification::create([
                'user_id' => $this->id,
                'type' => 'star_lost',
                'title' => '⭐ Étoile perdue',
                'message' => "Votre niveau de crédibilité est passé de {$oldStars} à {$newStars} étoile(s).",
                'data' => [
                    'old_stars' => $oldStars,
                    'new_stars' => $newStars,
                ],
            ]);
        }
    }

    /**
     * Obtenir le pourcentage de progression vers l'étoile suivante
     */
    public function getCredibilityProgress(): array
    {
        $currentStars = $this->getCredibilityStars();
        $currentPoints = $this->credibility_points ?? 100;

        if ($currentStars >= 5) {
            return [
                'current_stars' => 5,
                'next_stars' => 5,
                'current_points' => $currentPoints,
                'points_needed' => 0,
                'progress_percent' => 100,
                'max_level' => true,
            ];
        }

        $nextStars = $currentStars + 1;
        $currentLevelThreshold = self::CREDIBILITY_LEVELS[$currentStars];
        $nextLevelThreshold = self::CREDIBILITY_LEVELS[$nextStars];
        $pointsInCurrentLevel = $currentPoints - $currentLevelThreshold;
        $pointsNeededForNextLevel = $nextLevelThreshold - $currentLevelThreshold;
        $progressPercent = ($pointsInCurrentLevel / $pointsNeededForNextLevel) * 100;

        return [
            'current_stars' => $currentStars,
            'next_stars' => $nextStars,
            'current_points' => $currentPoints,
            'points_needed' => $nextLevelThreshold - $currentPoints,
            'progress_percent' => min(100, max(0, $progressPercent)),
            'max_level' => false,
        ];
    }

    /**
     * Obtenir les statistiques de l'utilisateur
     */
    public function getStats(): array
    {
        $credibilityProgress = $this->getCredibilityProgress();
        
        return [
            'total_trips_as_driver' => $this->total_trips_as_driver,
            'total_trips_as_passenger' => $this->total_trips_as_passenger,
            'total_earnings' => $this->tripsAsDriver()
                ->whereHas('bookings', fn($q) => $q->where('status', 'completed'))
                ->withSum('bookings', 'total_price')
                ->get()
                ->sum('bookings_sum_total_price') ?? 0,
            'total_spent' => $this->bookings()
                ->where('status', 'completed')
                ->sum('total_price'),
            'average_rating' => $this->rating ?? 0,
            'total_ratings' => $this->ratingsReceived()->count(),
            'upcoming_trips' => $this->bookings()
                ->whereIn('status', ['pending', 'confirmed'])
                ->whereHas('trip', fn($q) => $q->where('departure_date', '>=', now()))
                ->count(),
            'completed_trips' => $this->total_trips_as_driver + $this->total_trips_as_passenger,
            // Crédibilité
            'credibility_points' => $this->credibility_points ?? 100,
            'credibility_stars' => $this->getCredibilityStars(),
            'credibility_progress' => $credibilityProgress,
            'total_positive_points' => $this->total_positive_points ?? 0,
            'total_negative_points' => $this->total_negative_points ?? 0,
        ];
    }
}
