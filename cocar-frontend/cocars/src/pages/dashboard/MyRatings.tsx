// src/pages/dashboard/MyRatings.tsx
import { useState, useEffect } from "react";
import { Star, User, Car, MessageCircle, Loader2 } from "lucide-react";
import { ratingService } from "../../services/ratingService";
import type { Rating } from "../../types";

// Données réelles uniquement

export default function MyRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "driver" | "passenger">("all");

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    setIsLoading(true);
    try {
      // On récupère les évaluations du profil public de l'utilisateur connecté.
      // Le backend n'expose pas un endpoint "me" public, donc on utilise l'id depuis le local storage.
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? (JSON.parse(storedUser) as { id?: number }).id : undefined;
      if (!userId) {
        setRatings([]);
        return;
      }
      const response = await ratingService.getUserRatings(userId);
      setRatings(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRatings = ratings.filter((r) => filter === "all" || r.rating_type === filter);
  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star, count: ratings.filter((r) => r.rating === star).length,
    percentage: ratings.length > 0 ? (ratings.filter((r) => r.rating === star).length / ratings.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-theme-primary">Mes évaluations</h1>
        <p className="text-theme-tertiary">Consultez les avis laissés par la communauté</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-theme rounded-3xl border-2 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-theme-primary">{averageRating}</p>
              <p className="text-theme-tertiary">Note moyenne</p>
            </div>
          </div>
        </div>

        <div className="card-theme rounded-3xl border-2 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-theme-primary">{ratings.length}</p>
              <p className="text-theme-tertiary">Avis reçus</p>
            </div>
          </div>
        </div>

        <div className="card-theme rounded-3xl border-2 p-6">
          <p className="font-semibold text-theme-primary mb-3">Distribution</p>
          <div className="space-y-2">
            {ratingDistribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-4">{d.star}</span>
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                </div>
                <span className="text-sm text-theme-tertiary w-6">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "Tous les avis", icon: Star },
          { key: "driver", label: "Conducteur", icon: Car },
          { key: "passenger", label: "Passager", icon: User },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                filter === f.key
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-emerald-500"
              }`}
            >
              <Icon className="w-4 h-4" /> {f.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      )}

      {!isLoading && filteredRatings.length === 0 && (
        <div className="card-theme rounded-3xl border-2 p-16 text-center">
          <Star className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-theme-primary mb-3">Aucune évaluation</h3>
          <p className="text-theme-tertiary">Vous n'avez pas encore reçu d'évaluation.</p>
        </div>
      )}

      {!isLoading && filteredRatings.length > 0 && (
        <div className="space-y-4">
          {filteredRatings.map((rating) => (
            <div key={rating.id} className="card-theme rounded-3xl border-2 p-6 hover:border-emerald-400 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="font-bold text-white">
                    {rating.rater.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-theme-primary">{rating.rater.name}</p>
                      <div className="flex items-center gap-2 text-sm text-theme-tertiary">
                        <span className="flex items-center gap-1">
                          {rating.rating_type === "driver" ? <Car className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          {rating.rating_type === "driver" ? "Conducteur" : "Passager"}
                        </span>
                        <span>•</span>
                        <span>{new Date(rating.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= rating.rating ? "fill-emerald-500 text-emerald-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-theme-secondary mb-3 bg-theme-secondary p-4 rounded-2xl">"{rating.comment}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
