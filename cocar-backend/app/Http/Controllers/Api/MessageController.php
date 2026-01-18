<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * Lister toutes les conversations de l'utilisateur
     */
    public function conversations(Request $request)
    {
        try {
            $user = $request->user();
            
            $conversations = $user->conversations()
                ->with(['lastMessage.sender', 'participants', 'trip'])
                ->get()
                ->map(function ($conversation) use ($user) {
                    return [
                        'id' => $conversation->id,
                        'type' => $conversation->type,
                        'subject' => $conversation->subject,
                        'trip' => $conversation->trip,
                        'participants' => $conversation->participants->map(function ($participant) {
                            return [
                                'id' => $participant->id,
                                'name' => $participant->name,
                                'avatar' => $participant->avatar,
                            ];
                        }),
                        'last_message' => $conversation->lastMessage ? [
                            'content' => $conversation->lastMessage->content,
                            'sender_name' => $conversation->lastMessage->sender->name,
                            'created_at' => $conversation->lastMessage->created_at,
                        ] : null,
                        'unread_count' => $conversation->unreadCountForUser($user->id),
                        'last_message_at' => $conversation->last_message_at,
                    ];
                });

            return $this->success($conversations);
        } catch (\Exception $e) {
            Log::error('Erreur récupération conversations: ' . $e->getMessage());
            return $this->error('Erreur lors de la récupération des conversations', 500);
        }
    }

    /**
     * Créer ou récupérer une conversation pour un trajet
     */
    public function getOrCreateTripConversation(Request $request, $tripId)
    {
        try {
            $user = $request->user();
            
            // Vérifier que l'utilisateur est lié au trajet (conducteur ou passager)
            $trip = \App\Models\Trip::with(['driver', 'bookings.passenger'])->findOrFail($tripId);
            
            $isDriver = $trip->driver_id === $user->id;
            $isPassenger = $trip->bookings->contains('passenger_id', $user->id);
            
            if (!$isDriver && !$isPassenger) {
                return $this->error('Vous n\'êtes pas autorisé à accéder à cette conversation', 403);
            }
            
            // Chercher ou créer la conversation
            $conversation = Conversation::where('trip_id', $tripId)
                ->where('type', 'trip')
                ->first();
                
            if (!$conversation) {
                $conversation = Conversation::create([
                    'trip_id' => $tripId,
                    'type' => 'trip',
                ]);
                
                // Ajouter le conducteur
                $conversation->participants()->attach($trip->driver_id);
                
                // Ajouter tous les passagers ayant réservé
                $passengerIds = $trip->bookings()
                    ->where('status', 'confirmed')
                    ->pluck('passenger_id')
                    ->unique();
                    
                foreach ($passengerIds as $passengerId) {
                    $conversation->participants()->attach($passengerId);
                }
            } else {
                // S'assurer que l'utilisateur est participant
                if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
                    $conversation->participants()->attach($user->id);
                }
            }
            
            return $this->success([
                'conversation_id' => $conversation->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur création conversation trajet: ' . $e->getMessage());
            return $this->error('Erreur lors de la création de la conversation', 500);
        }
    }

    /**
     * Créer une conversation de support avec admin
     */
    public function createSupportConversation(Request $request)
    {
        try {
            $validated = $request->validate([
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:1000',
            ]);
            
            $user = $request->user();
            
            // Créer la conversation
            $conversation = Conversation::create([
                'type' => 'support',
                'subject' => $validated['subject'],
                'last_message_at' => now(),
            ]);
            
            // Ajouter l'utilisateur
            $conversation->participants()->attach($user->id);
            
            // Ajouter tous les admins
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $conversation->participants()->attach($admin->id);
            }
            
            // Créer le premier message
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'content' => $validated['message'],
                'type' => 'text',
            ]);
            
            return $this->success([
                'conversation' => $conversation,
                'message' => $message,
            ], 'Conversation créée avec succès', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Erreur de validation', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Erreur création conversation support: ' . $e->getMessage());
            return $this->error('Erreur lors de la création de la conversation', 500);
        }
    }

    /**
     * Récupérer les messages d'une conversation
     */
    public function messages(Request $request, $conversationId)
    {
        try {
            $user = $request->user();
            
            $conversation = Conversation::with(['messages.sender'])->findOrFail($conversationId);
            
            // Vérifier que l'utilisateur est participant
            if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
                return $this->error('Vous n\'êtes pas autorisé à accéder à cette conversation', 403);
            }
            
            // Marquer comme lu
            $conversation->markAsReadForUser($user->id);
            
            $messages = $conversation->messages->map(function ($message) use ($user) {
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'type' => $message->type,
                    'attachment_url' => $message->attachment_url,
                    'sender' => [
                        'id' => $message->sender->id,
                        'name' => $message->sender->name,
                        'avatar' => $message->sender->avatar,
                    ],
                    'is_own' => $message->sender_id === $user->id,
                    'is_read' => $message->is_read,
                    'read_at' => $message->read_at,
                    'created_at' => $message->created_at,
                ];
            });
            
            return $this->success($messages);
        } catch (\Exception $e) {
            Log::error('Erreur récupération messages: ' . $e->getMessage());
            return $this->error('Erreur lors de la récupération des messages', 500);
        }
    }

    /**
     * Envoyer un message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        try {
            $validated = $request->validate([
                'content' => 'required|string|max:1000',
                'type' => 'sometimes|string|in:text,image,file',
            ]);
            
            $user = $request->user();
            
            $conversation = Conversation::findOrFail($conversationId);
            
            // Vérifier que l'utilisateur est participant
            if (!$conversation->participants()->where('user_id', $user->id)->exists()) {
                return $this->error('Vous n\'êtes pas autorisé à envoyer des messages', 403);
            }
            
            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $user->id,
                'content' => $validated['content'],
                'type' => $validated['type'] ?? 'text',
            ]);
            
            // Mettre à jour last_message_at
            $conversation->update(['last_message_at' => now()]);
            
            $message->load('sender');
            
            // Broadcaster le message
            broadcast(new MessageSent($message))->toOthers();
            
            return $this->success([
                'id' => $message->id,
                'content' => $message->content,
                'type' => $message->type,
                'sender' => [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'avatar' => $message->sender->avatar,
                ],
                'is_own' => true,
                'is_read' => false,
                'read_at' => null,
                'created_at' => $message->created_at,
            ], 'Message envoyé avec succès', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Erreur de validation', 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Erreur envoi message: ' . $e->getMessage());
            return $this->error('Erreur lors de l\'envoi du message', 500);
        }
    }

    /**
     * Nombre de messages non lus
     */
    public function unreadCount(Request $request)
    {
        try {
            $user = $request->user();
            
            $count = $user->conversations->sum(function ($conversation) use ($user) {
                return $conversation->unreadCountForUser($user->id);
            });
            
            return $this->success(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Erreur comptage messages non lus: ' . $e->getMessage());
            return $this->error('Erreur lors du comptage des messages non lus', 500);
        }
    }
}
