<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserVehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'registration_number',
        'brand',
        'model',
        'color',
        'year',
        'seats',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'year' => 'integer',
        'seats' => 'integer',
    ];

    /**
     * Relation: Véhicule appartient à un utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Trajets effectués avec ce véhicule
     */
    public function trips()
    {
        return $this->hasMany(Trip::class, 'vehicle_id');
    }

    /**
     * Photos du véhicule (multi-photos)
     */
    public function photos(): HasMany
    {
        return $this->hasMany(UserVehiclePhoto::class, 'vehicle_id')
            ->orderByDesc('is_primary')
            ->orderBy('sort_order')
            ->orderBy('id');
    }

    /**
     * Photo principale (si existante)
     */
    public function primaryPhoto()
    {
        return $this->hasOne(UserVehiclePhoto::class, 'vehicle_id')->where('is_primary', true);
    }
}
