<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // ============ RELATIONS ============

    /**
     * Utilisateur destinataire
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ============ SCOPES ============

    /**
     * Notifications non lues
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('read', false);
    }

    /**
     * Notifications lues
     */
    public function scopeRead(Builder $query): Builder
    {
        return $query->where('read', true);
    }

    // ============ MÉTHODES ============

    /**
     * Marquer comme lu
     */
    public function markAsRead(): void
    {
        if (!$this->read) {
            $this->update([
                'read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    public static function markAllAsReadForUser(int $userId): int
    {
        return static::where('user_id', $userId)
            ->unread()
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
    }
}
