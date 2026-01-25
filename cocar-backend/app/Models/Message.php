<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'type',
        'attachment_url',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected $appends = ['image_url'];

    /**
     * Obtenir l'URL complète de l'image
     */
    public function getImageUrlAttribute()
    {
        if ($this->attachment_url && $this->type === 'image') {
            // Si c'est une URL complète, la retourner telle quelle
            if (filter_var($this->attachment_url, FILTER_VALIDATE_URL)) {
                return $this->attachment_url;
            }
            // Sinon, construire l'URL complète
            return asset('storage/' . $this->attachment_url);
        }
        return null;
    }

    /**
     * Conversation à laquelle appartient le message
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Expéditeur du message
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Marquer le message comme lu
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}
