// src/pages/dashboard/MyRatings.tsx
import { useState, useEffect } from "react";
import { Star, User, Car, MessageCircle, Loader2 } from "lucide-react";
import { ratingService } from "../../services/ratingService";
import { USE_MOCK_DATA } from "../../config/api";
import type { Rating } from "../../types";

const MOCK_RATINGS: Rating[] = [
  {
    id: 1, trip_id: 1, rater_id: 2,
    rater: { id: 2, name: "Marie Fotso", email: "", phone: "", role: "user", is_verified: true, rating: 4.9 },
    rated_user_id: 1,
    rated_user: { id: 1, name: "Moi", email: "", phone: "", role: "user", is_verified: true },
    rating: 5, comment: "Excellent passager, très ponctuel et agréable. Je recommande !",
    rating_type: "passenger", punctuality: 5, communication: 5,
    created_at: "2026-01-10T14:00:00Z",
  },
  {
    id: 2, trip_id: 2, rater_id: 3,
    rater: { id: 3, name: "Paul Nganou", email: "", phone: "", role: "user", is_verified: true, rating: 4.5 },
    rated_user_id: 1,
    rated_user: { id: 1, name: "Moi", email: "", phone: "", role: "user", is_verified: true },
    rating: 4, comment: "Bon conducteur, trajet agréable. Petit retard au départ mais rien de grave.",
    rating_type: "driver", punctuality: 3, communication: 5, comfort: 4,
    created_at: "2026-01-08T10:00:00Z",
  },
];

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
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500));
        setRatings(MOCK_RATINGS);
      } else {
        const response = await ratingService.getUserRatings("me");
        setRatings(response.data);
      }
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
        <h1 className="text-2xl font-bold text-gray-900">Mes évaluations</h1>
        <p className="text-gray-500">Consultez les avis laissés par la communauté</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
              <p className="text-gray-500">Note moyenne</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{ratings.length}</p>
              <p className="text-gray-500">Avis reçus</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6">
          <p className="font-semibold text-gray-900 mb-3">Distribution</p>
          <div className="space-y-2">
            {ratingDistribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-4">{d.star}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${d.percentage}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-6">{d.count}</span>
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
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200 hover:border-black"
              }`}
            >
              <Icon className="w-4 h-4" /> {f.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        </div>
      )}

      {!isLoading && filteredRatings.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-16 text-center">
          <Star className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune évaluation</h3>
          <p className="text-gray-500">Vous n'avez pas encore reçu d'évaluation.</p>
        </div>
      )}

      {!isLoading && filteredRatings.length > 0 && (
        <div className="space-y-4">
          {filteredRatings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-3xl border-2 border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="font-bold text-black">
                    {rating.rater.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{rating.rater.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
                          className={`w-5 h-5 ${star <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-700 mb-3 bg-gray-50 p-4 rounded-2xl">"{rating.comment}"</p>
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
