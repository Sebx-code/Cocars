<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'brand',
        'model',
        'color',
        'plate_number',
        'seats',
        'year',
        'photo',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'seats' => 'integer',
        'year' => 'integer',
    ];

    // ============ RELATIONS ============

    /**
     * Propriétaire du véhicule
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Trajets effectués avec ce véhicule
     * NOTE: Cette table n'est plus utilisée. Les trajets utilisent user_vehicles.
     * Voir UserVehicle::trips() à la place.
     */
    public function trips()
    {
        return $this->hasMany(Trip::class, 'vehicle_id');
    }

    // ============ ACCESSEURS ============

    /**
     * Obtenir le nom complet du véhicule
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->brand} {$this->model} ({$this->color})";
    }
}
