// src/pages/searchTrips.tsx - Données réelles uniquement
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Car,
  Dog,
  Luggage,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Wind,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { tripService } from "../services/tripService";
import type { Trip, TripSearchParams } from "../types";

export default function SearchTripsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [searchData, setSearchData] = useState<TripSearchParams>({
    departure_city: searchParams.get("from") || "",
    arrival_city: searchParams.get("to") || "",
    date: searchParams.get("date") || "",
    passengers: parseInt(searchParams.get("passengers") || "1"),
    min_price: undefined,
    max_price: undefined,
    sort_by: "date",
    sort_order: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [, setTotalPages] = useState(1);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const hasSearch = !!(
        searchData.departure_city ||
        searchData.arrival_city ||
        searchData.date ||
        searchData.passengers
      );

      if (hasSearch) {
        const response = await tripService.searchTrips({
          ...searchData,
          page: currentPage,
          per_page: 10,
        });
        setTrips(response.data);
        setTotalPages(response.meta.last_page);
      } else {
        const response = await tripService.getAllTrips(currentPage, 10);
        setTrips(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur lors du chargement des trajets";
      setError(message);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchData]);

  // Sync state with URL params (when user comes from Landing)
  useEffect(() => {
    setSearchData((prev) => ({
      ...prev,
      departure_city: searchParams.get("from") || "",
      arrival_city: searchParams.get("to") || "",
      date: searchParams.get("date") || "",
      passengers: parseInt(searchParams.get("passengers") || "1"),
    }));
  }, [searchParams]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchData.departure_city) params.set("from", searchData.departure_city);
    if (searchData.arrival_city) params.set("to", searchData.arrival_city);
    if (searchData.date) params.set("date", searchData.date);
    if (searchData.passengers) params.set("passengers", searchData.passengers.toString());

    setSearchParams(params);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  const formatTime = (timeStr: string) => timeStr.substring(0, 5);

  return (
    <Layout showFooter={false}>
      {/* Search */}
      <section className="bg-theme-secondary border-b border-theme py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <form onSubmit={handleSearch}>
            <div className="glass-effect dark:glass-effect-dark rounded-3xl shadow-xl border-2 border-white/50 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-2 uppercase tracking-wide">
                    Départ
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                    <input
                      type="text"
                      placeholder="Yaoundé"
                      value={searchData.departure_city}
                      onChange={(e) =>
                        setSearchData({ ...searchData, departure_city: e.target.value })
                      }
                      className="input-theme w-full pl-9 pr-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-2 uppercase tracking-wide">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                    <input
                      type="text"
                      placeholder="Douala"
                      value={searchData.arrival_city}
                      onChange={(e) => setSearchData({ ...searchData, arrival_city: e.target.value })}
                      className="input-theme w-full pl-11 pr-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-2 uppercase tracking-wide">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      className="input-theme w-full pl-11 pr-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-theme-secondary mb-2 uppercase tracking-wide">
                    Places
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                    <select
                      value={searchData.passengers}
                      onChange={(e) =>
                        setSearchData({ ...searchData, passengers: parseInt(e.target.value) })
                      }
                      className="input-theme w-full pl-11 pr-4 py-3.5 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all appearance-none font-medium"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white dark:text-slate-950 py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 bg-theme-primary min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-theme-primary tracking-tight">
              {trips.length} trajet{trips.length > 1 ? "s" : ""} trouvé{trips.length > 1 ? "s" : ""}
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-theme bg-theme-primary rounded-full hover:border-emerald-400 transition-all font-medium text-theme-primary"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>

              <select
                value={`${searchData.sort_by}-${searchData.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split("-") as [
                    NonNullable<TripSearchParams["sort_by"]> | string,
                    NonNullable<TripSearchParams["sort_order"]> | string,
                  ];
                  setSearchData({
                    ...searchData,
                    sort_by: sort_by as TripSearchParams["sort_by"],
                    sort_order: sort_order as TripSearchParams["sort_order"],
                  });
                }}
                className="input-theme px-4 py-2.5 border-2 rounded-full font-medium focus:ring-2 focus:ring-emerald-400 outline-none"
              >
                <option value="date-asc">Date (proche)</option>
                <option value="price-asc">Prix (bas)</option>
                <option value="price-desc">Prix (haut)</option>
                <option value="rating-desc">Note</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 mb-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Prix min
                  </label>
                  <input
                    type="number"
                    value={searchData.min_price ?? ""}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        min_price: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Prix max
                  </label>
                  <input
                    type="number"
                    value={searchData.max_price ?? ""}
                    onChange={(e) =>
                      setSearchData({
                        ...searchData,
                        max_price: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFilters(false);
                      loadTrips();
                    }}
                    className="w-full bg-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
          )}

          {error && (
            <div className="card-theme rounded-3xl p-8 text-center border-2">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-theme-primary font-semibold text-lg">{error}</p>
            </div>
          )}

          {!isLoading && !error && trips.length === 0 && (
            <div className="card-theme rounded-3xl p-16 text-center border-2">
              <Car className="w-20 h-20 text-theme-tertiary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-theme-primary mb-3">Aucun trajet trouvé</h3>
              <p className="text-theme-secondary mb-8 text-lg">Modifiez vos critères ou proposez votre trajet</p>
              <button
                onClick={() => navigate("/trips/create")}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
              >
                Proposer un trajet
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {!isLoading && !error && trips.length > 0 && (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="card-theme rounded-3xl border-2 hover:border-emerald-400 transition-all cursor-pointer overflow-hidden hover-lift group"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center pt-1">
                            <div className="w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                            <div className="w-0.5 h-20 bg-theme-tertiary" />
                            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                          </div>

                          <div className="flex-1">
                            <div className="mb-6">
                              <span className="text-2xl font-bold text-theme-primary">
                                {formatTime(trip.departure_time)}
                              </span>
                              <p className="font-bold text-theme-primary text-lg mt-1">
                                {trip.departure_city}
                              </p>
                              <p className="text-theme-tertiary text-sm">{trip.departure_address}</p>
                            </div>

                            <div>
                              <span className="text-2xl font-bold text-theme-primary">
                                {trip.estimated_arrival_time ? formatTime(trip.estimated_arrival_time) : "--:--"}
                              </span>
                              <p className="font-bold text-theme-primary text-lg mt-1">
                                {trip.arrival_city}
                              </p>
                              <p className="text-theme-tertiary text-sm">{trip.arrival_address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 ml-7">
                          {trip.air_conditioning && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full font-medium">
                              <Wind className="w-3 h-3" /> Clim
                            </span>
                          )}
                          {trip.luggage_allowed && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-medium">
                              <Luggage className="w-3 h-3" /> Bagages
                            </span>
                          )}
                          {trip.pets_allowed && (
                            <span className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full font-medium">
                              <Dog className="w-3 h-3" /> Animaux
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-theme-primary">
                            {trip.price_per_seat.toLocaleString()}
                            <span className="text-lg text-theme-tertiary ml-1">F</span>
                          </p>
                          <p className="text-theme-tertiary text-sm">par place</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-theme-primary">{trip.driver.name}</p>
                            <div className="flex items-center justify-end gap-1">
                              <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                              <span className="font-medium text-theme-secondary">
                                {trip.driver.rating || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <span className="font-bold text-black text-sm">
                              {trip.driver.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-theme">
                      <div className="flex items-center gap-6 text-sm text-theme-tertiary">
                        <span className="flex items-center gap-2 font-medium">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.departure_date)}
                        </span>
                        <span className="flex items-center gap-2 font-medium">
                          <Users className="w-4 h-4" />
                          {trip.available_seats} place{trip.available_seats > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Voir détails
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination (simple) */}
          {!isLoading && !error && trips.length > 0 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-full border-2 border-theme hover:border-emerald-400 font-semibold"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 rounded-full border-2 border-theme hover:border-emerald-400 font-semibold"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
