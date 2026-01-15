// src/pages/dashboard/Notifications.tsx
import { useState, useEffect } from "react";
import { Bell, Calendar, Star, Car, CreditCard, CheckCircle, XCircle, Loader2, Trash2, Check } from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { USE_MOCK_DATA } from "../../config/api";
import type { Notification } from "../../types";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1, user_id: 1, type: "booking_confirmed", title: "Réservation confirmée",
    message: "Marie Fotso a confirmé votre réservation pour le trajet Yaoundé → Douala du 22 janvier.",
    read: false, created_at: "2026-01-15T14:30:00Z",
  },
  {
    id: 2, user_id: 1, type: "new_rating", title: "Nouvelle évaluation",
    message: "Paul Nganou vous a attribué 5 étoiles. Consultez son commentaire !",
    read: false, created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: 3, user_id: 1, type: "booking_request", title: "Nouvelle demande",
    message: "Sophie Mbarga souhaite réserver 2 places pour votre trajet Douala → Bafoussam.",
    read: true, created_at: "2026-01-14T16:00:00Z",
  },
  {
    id: 4, user_id: 1, type: "trip_reminder", title: "Rappel de trajet",
    message: "Votre trajet Yaoundé → Douala est prévu demain à 06h00.",
    read: true, created_at: "2026-01-14T09:00:00Z",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500));
        setNotifications(MOCK_NOTIFICATIONS);
      } else {
        const response = await notificationService.getNotifications();
        setNotifications(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_confirmed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "booking_rejected":
      case "booking_cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      case "booking_request": return <Calendar className="w-5 h-5 text-blue-500" />;
      case "new_rating": return <Star className="w-5 h-5 text-yellow-500" />;
      case "trip_reminder": return <Car className="w-5 h-5 text-purple-500" />;
      case "payment_received": return <CreditCard className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "À l'instant";
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return "Hier";
    return date.toLocaleDateString("fr-FR");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">{unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes lues"}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-5 py-2.5 text-yellow-600 hover:bg-yellow-50 rounded-full font-semibold transition-colors"
          >
            <Check className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-16 text-center">
          <Bell className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune notification</h3>
          <p className="text-gray-500">Vous n'avez pas de notification pour le moment.</p>
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`flex items-start gap-4 p-5 hover:bg-gray-50 cursor-pointer transition-colors ${
                index !== notifications.length - 1 ? "border-b-2 border-gray-100" : ""
              } ${!notification.read ? "bg-yellow-50/50" : ""}`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                    {notification.title}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(notification.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                className="p-2 hover:bg-gray-200 rounded-xl opacity-50 hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
