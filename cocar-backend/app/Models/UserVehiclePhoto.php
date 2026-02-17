<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class UserVehiclePhoto extends Model
{
    use HasFactory;

    protected $table = 'user_vehicle_photos';

    protected $fillable = [
        'vehicle_id',
        'path',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['url'];

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(UserVehicle::class, 'vehicle_id');
    }

    public function getUrlAttribute(): string
    {
        $relative = Storage::disk('public')->url($this->path);

        // Storage::url() renvoie souvent une URL relative (/storage/..).
        // Pour le frontend (host différent), on renvoie une URL absolue basée sur APP_URL.
        if (str_starts_with($relative, 'http://') || str_starts_with($relative, 'https://')) {
            return $relative;
        }

        $appUrl = rtrim(config('app.url'), '/');
        if (!$appUrl) {
            return $relative;
        }

        return $appUrl . (str_starts_with($relative, '/') ? $relative : '/' . $relative);
    }
}
