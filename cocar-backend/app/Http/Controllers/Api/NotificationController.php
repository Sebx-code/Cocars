<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Liste des notifications
     */
    public function index(Request $request)
    {
        $query = $request->user()->notifications()->latest();

        if ($request->boolean('unread')) {
            $query->unread();
        }

        $notifications = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    /**
     * Nombre de notifications non lues
     */
    public function unreadCount(Request $request)
    {
        $count = $request->user()->notifications()->unread()->count();

        return $this->success(['count' => $count]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->error('Accès non autorisé', 403);
        }

        $notification->markAsRead();

        return $this->success($notification, 'Notification marquée comme lue');
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $count = Notification::markAllAsReadForUser($request->user()->id);

        return $this->success(['count' => $count], "{$count} notification(s) marquée(s) comme lue(s)");
    }

    /**
     * Supprimer une notification
     */
    public function destroy(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return $this->error('Accès non autorisé', 403);
        }

        $notification->delete();

        return $this->success(null, 'Notification supprimée');
    }
}
