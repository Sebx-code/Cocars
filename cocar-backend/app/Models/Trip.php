<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'vehicle_id',
        'departure_city',
        'departure_address',
        'departure_lat',
        'departure_lng',
        'arrival_city',
        'arrival_address',
        'arrival_lat',
        'arrival_lng',
        'departure_date',
        'departure_time',
        'estimated_arrival_time',
        'available_seats',
        'total_seats',
        'price_per_seat',
        'description',
        'luggage_allowed',
        'pets_allowed',
        'smoking_allowed',
        'music_allowed',
        'air_conditioning',
        'status',
        'cancellation_reason',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'departure_lat' => 'decimal:8',
        'departure_lng' => 'decimal:8',
        'arrival_lat' => 'decimal:8',
        'arrival_lng' => 'decimal:8',
        'luggage_allowed' => 'boolean',
        'pets_allowed' => 'boolean',
        'smoking_allowed' => 'boolean',
        'music_allowed' => 'boolean',
        'air_conditioning' => 'boolean',
        'available_seats' => 'integer',
        'total_seats' => 'integer',
        'price_per_seat' => 'integer',
    ];

    // ============ RELATIONS ============

    /**
     * Conducteur du trajet
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    /**
     * Véhicule utilisé pour le trajet
     */
    public function vehicle()
    {
        return $this->belongsTo(UserVehicle::class, 'vehicle_id');
    }

    /**
     * Réservations pour ce trajet
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Évaluations pour ce trajet
     */
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // ============ SCOPES ============

    /**
     * Trajets disponibles (avec places et non annulés)
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('available_seats', '>', 0)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->where('departure_date', '>=', now()->toDateString());
    }

    /**
     * Recherche par ville de départ
     */
    public function scopeFromCity(Builder $query, string $city): Builder
    {
        return $query->where('departure_city', 'LIKE', "%{$city}%");
    }

    /**
     * Recherche par ville d'arrivée
     */
    public function scopeToCity(Builder $query, string $city): Builder
    {
        return $query->where('arrival_city', 'LIKE', "%{$city}%");
    }

    /**
     * Recherche par date
     */
    public function scopeOnDate(Builder $query, string $date): Builder
    {
        return $query->whereDate('departure_date', $date);
    }

    /**
     * Recherche par nombre de places minimum
     */
    public function scopeWithMinSeats(Builder $query, int $seats): Builder
    {
        return $query->where('available_seats', '>=', $seats);
    }

    /**
     * Recherche par prix
     */
    public function scopePriceBetween(Builder $query, ?int $min, ?int $max): Builder
    {
        if ($min !== null) {
            $query->where('price_per_seat', '>=', $min);
        }
        if ($max !== null) {
            $query->where('price_per_seat', '<=', $max);
        }
        return $query;
    }

    // ============ MÉTHODES ============

    /**
     * Mettre à jour le nombre de places disponibles
     */
    public function updateAvailableSeats(): void
    {
        $bookedSeats = $this->bookings()
            ->whereIn('status', ['confirmed'])
            ->sum('seats_booked');
        
        $this->update([
            'available_seats' => max(0, $this->total_seats - $bookedSeats)
        ]);
    }

    /**
     * Vérifier si le trajet peut être réservé
     */
    public function canBeBooked(int $seats = 1): bool
    {
        return $this->available_seats >= $seats 
            && in_array($this->status, ['pending', 'confirmed'])
            && $this->departure_date >= now()->toDateString();
    }

    /**
     * Annuler le trajet
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);

        // Annuler toutes les réservations
        $this->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->update(['status' => 'cancelled']);
    }
}
