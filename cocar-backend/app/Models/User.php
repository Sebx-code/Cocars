<?php

namespace App\Models;

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

    /**
     * Obtenir les statistiques de l'utilisateur
     */
    public function getStats(): array
    {
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
        ];
    }
}
