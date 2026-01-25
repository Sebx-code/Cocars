<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privé pour les notifications utilisateur
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Canal privé pour les conversations
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Vérifier que l'utilisateur est participant de la conversation
    $conversation = \App\Models\Conversation::find($conversationId);
    
    if (!$conversation) {
        return false;
    }
    
    $isParticipant = $conversation->participants()->where('user_id', $user->id)->exists();
    
    if ($isParticipant) {
        // Retourner les infos de l'utilisateur pour la présence
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
        ];
    }
    
    return false;
});

// Canal privé pour les trajets (notifications en temps réel)
Broadcast::channel('trip.{tripId}', function ($user, $tripId) {
    $trip = \App\Models\Trip::find($tripId);
    
    if (!$trip) {
        return false;
    }
    
    // Le conducteur ou un passager avec réservation confirmée
    if ($trip->driver_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'driver'];
    }
    
    $hasBooking = $trip->bookings()
        ->where('user_id', $user->id)
        ->whereIn('status', ['confirmed', 'pending'])
        ->exists();
    
    if ($hasBooking) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => 'passenger'];
    }
    
    return false;
});
