<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'type',
        'subject',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Trajet associé à la conversation
     */
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    /**
     * Participants de la conversation
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_user')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    /**
     * Messages de la conversation
     */
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Dernier message de la conversation
     */
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /**
     * Nombre de messages non lus pour un utilisateur
     */
    public function unreadCountForUser($userId)
    {
        $lastReadAt = $this->participants()
            ->where('user_id', $userId)
            ->first()
            ->pivot
            ->last_read_at;

        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->when($lastReadAt, function ($query) use ($lastReadAt) {
                return $query->where('created_at', '>', $lastReadAt);
            })
            ->count();
    }

    /**
     * Marquer comme lu pour un utilisateur
     */
    public function markAsReadForUser($userId)
    {
        $this->participants()->updateExistingPivot($userId, [
            'last_read_at' => now(),
        ]);
    }
}
