// src/pages/dashboard/MyTrips.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Car, Users, MapPin, MoreVertical, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { tripService } from "../../services/tripService";
import type { Trip } from "../../types";

// Données réelles uniquement

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const response = await tripService.getMyTrips();
      setTrips(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
      setTrips([]);
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
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-emerald-100", text: "text-emerald-700", label: "En attente" },
      confirmed: { bg: "bg-green-100", text: "text-green-700", label: "Confirmé" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "En cours" },
      completed: { bg: "bg-gray-100", text: "text-theme-secondary", label: "Terminé" },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Annulé" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredTrips = trips.filter((trip) => {
    if (filter === "all") return true;
    if (filter === "upcoming") return ["pending", "confirmed"].includes(trip.status);
    if (filter === "completed") return trip.status === "completed";
    if (filter === "cancelled") return trip.status === "cancelled";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Mes trajets</h1>
          <p className="text-theme-tertiary">Gérez les trajets que vous proposez</p>
        </div>
        <Link
          to="/trips/create"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouveau trajet
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "all", label: "Tous" },
          { key: "upcoming", label: "À venir" },
          { key: "completed", label: "Terminés" },
          { key: "cancelled", label: "Annulés" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-emerald-600 text-white"
                : "bg-theme-primary text-theme-secondary border-2 border-theme-strong hover:border-emerald-400"
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

      {!isLoading && filteredTrips.length === 0 && (
        <div className="card-theme rounded-3xl border-2 p-16 text-center">
          <Car className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-theme-primary mb-3">Aucun trajet</h3>
          <p className="text-theme-tertiary mb-8">Vous n'avez pas encore proposé de trajet.</p>
          <Link
            to="/trips/create"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold"
          >
            <Plus className="w-5 h-5" />
            Proposer un trajet
          </Link>
        </div>
      )}

      {!isLoading && filteredTrips.length > 0 && (
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="card-theme rounded-3xl border-2 p-6 hover:border-emerald-400 transition-all hover-lift"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusBadge(trip.status)}
                    <span className="text-sm text-theme-tertiary font-medium">
                      {formatDate(trip.departure_date)} à {trip.departure_time.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xl font-bold text-theme-primary">
                    <span>{trip.departure_city}</span>
                    <span className="text-gray-400">→</span>
                    <span>{trip.arrival_city}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-theme-tertiary">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {trip.available_seats}/{trip.total_seats} places
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {trip.departure_address}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-theme-primary">{trip.price_per_seat.toLocaleString()} F</p>
                    <p className="text-sm text-theme-tertiary">par place</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === trip.id ? null : trip.id)}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-theme-tertiary" />
                    </button>
                    {menuOpen === trip.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-theme-primary rounded-2xl shadow-xl border-2 border-theme py-2 z-10">
                        <Link
                          to={`/trips/${trip.id}`}
                          className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-secondary font-medium"
                        >
                          <Eye className="w-4 h-4" /> Voir détails
                        </Link>
                        <Link
                          to={`/trips/${trip.id}/edit`}
                          className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-secondary font-medium"
                        >
                          <Edit className="w-4 h-4" /> Modifier
                        </Link>
                        <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full font-medium">
                          <Trash2 className="w-4 h-4" /> Annuler
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {trip.total_seats - trip.available_seats > 0 && (
                <div className="mt-4 pt-4 border-t border-theme">
                  <Link
                    to={`/user/my-trips/${trip.id}/bookings`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-theme-secondary">{trip.total_seats - trip.available_seats} réservation(s)</span>
                    <span className="text-emerald-700 font-bold">Voir les réservations →</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
