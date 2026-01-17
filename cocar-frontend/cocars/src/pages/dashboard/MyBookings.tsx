// src/pages/dashboard/MyBookings.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, User, Star, CheckCircle, XCircle, AlertCircle, Loader2, MessageCircle, Phone } from "lucide-react";
import { bookingService } from "../../services/bookingService";
import type { Booking } from "../../types";

// Données réelles uniquement
// (les réservations sont chargées via l'API)

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short", day: "numeric", month: "short",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
      pending: { bg: "bg-emerald-100", text: "text-emerald-700", icon: AlertCircle, label: "En attente" },
      confirmed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Confirmée" },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Refusée" },
      cancelled: { bg: "bg-gray-100", text: "text-theme-secondary", icon: XCircle, label: "Annulée" },
      completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Terminée" },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5" /> {badge.label}
      </span>
    );
  };

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">Mes réservations</h1>
        <p className="text-theme-tertiary">Suivez vos demandes de réservation</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "all", label: "Toutes" },
          { key: "pending", label: "En attente" },
          { key: "confirmed", label: "Confirmées" },
          { key: "completed", label: "Terminées" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-emerald-600 text-white"
                : "card-theme text-theme-secondary border-2 border-theme-strong hover:border-emerald-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      )}

      {!isLoading && filteredBookings.length === 0 && (
        <div className="card-theme rounded-3xl border-2 p-16 text-center">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-theme-primary mb-3">Aucune réservation</h3>
          <p className="text-theme-tertiary mb-8">Vous n'avez pas encore de réservation.</p>
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold"
          >
            Rechercher un trajet
          </Link>
        </div>
      )}

      {!isLoading && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="card-theme rounded-3xl border-2 overflow-hidden hover:border-emerald-400 transition-all hover-lift"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(booking.status)}
                  <span className="text-sm text-theme-tertiary">
                    Réservé le {new Date(booking.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xl font-bold text-theme-primary mb-2">
                      <span>{booking.trip.departure_city}</span>
                      <span className="text-gray-400">→</span>
                      <span>{booking.trip.arrival_city}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-theme-tertiary">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {formatDate(booking.trip.departure_date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {booking.trip.departure_time.substring(0, 5)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" /> {booking.seats_booked} place(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-theme-primary">{booking.total_price.toLocaleString()} FCFA</p>
                      <div className="flex items-center justify-end gap-1 text-sm text-theme-tertiary">
                        <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                        <span className="font-semibold">{booking.trip.driver.rating}</span>
                        <span>• {booking.trip.driver.name}</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-bold text-white">
                        {booking.trip.driver.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {booking.status === "confirmed" && (
                <div className="px-6 py-4 bg-theme-secondary border-t-2 border-theme flex flex-wrap gap-3">
                  <a
                    href={`tel:${booking.trip.driver.phone}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 rounded-full font-semibold hover:bg-green-200"
                  >
                    <Phone className="w-4 h-4" /> Appeler
                  </a>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-full font-semibold hover:bg-blue-200">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                  <Link
                    to={`/trips/${booking.trip_id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-theme-secondary text-theme-secondary rounded-full font-semibold hover:bg-theme-strong"
                  >
                    Voir le trajet
                  </Link>
                </div>
              )}

              {booking.status === "pending" && (
                <div className="px-6 py-4 bg-emerald-50 border-t-2 border-emerald-200">
                  <p className="text-sm text-emerald-700 font-medium">
                    ⏳ En attente de confirmation du conducteur...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
