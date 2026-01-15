// src/pages/searchTrips.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
  X,
  Car,
  Wind,
  Luggage,
  Dog,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { AnimatePresence, motion } from "framer-motion";
import { tripService } from "../services/tripService";
import { USE_MOCK_DATA } from "../config/api";
import type { Trip, TripSearchParams } from "../types";

// Données mockées pour le développement
const MOCK_TRIPS: Trip[] = [
  {
    id: 1,
    driver_id: 1,
    driver: {
      id: 1,
      name: "Jean Kamga",
      email: "jean@example.com",
      phone: "699123456",
      role: "user",
      is_verified: true,
      rating: 4.8,
      total_rides: 156,
    },
    departure_city: "Yaoundé",
    departure_address: "Carrefour Nlongkak",
    arrival_city: "Douala",
    arrival_address: "Akwa Palace",
    departure_date: "2026-01-20",
    departure_time: "06:00",
    estimated_arrival_time: "09:30",
    available_seats: 3,
    total_seats: 4,
    price_per_seat: 4000,
    description: "Trajet direct, climatisation, bagages autorisés.",
    luggage_allowed: true,
    pets_allowed: false,
    smoking_allowed: false,
    music_allowed: true,
    air_conditioning: true,
    status: "confirmed",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: 2,
    driver_id: 2,
    driver: {
      id: 2,
      name: "Marie Fotso",
      email: "marie@example.com",
      phone: "677987654",
      role: "user",
      is_verified: true,
      rating: 4.9,
      total_rides: 89,
    },
    departure_city: "Yaoundé",
    departure_address: "Mvan",
    arrival_city: "Douala",
    arrival_address: "Bonapriso",
    departure_date: "2026-01-20",
    departure_time: "08:00",
    estimated_arrival_time: "11:30",
    available_seats: 2,
    total_seats: 4,
    price_per_seat: 3500,
    description: "Conductrice expérimentée, trajet confortable.",
    luggage_allowed: true,
    pets_allowed: true,
    smoking_allowed: false,
    music_allowed: true,
    air_conditioning: true,
    status: "confirmed",
    created_at: "2026-01-11T14:00:00Z",
  },
  {
    id: 3,
    driver_id: 3,
    driver: {
      id: 3,
      name: "Paul Nganou",
      email: "paul@example.com",
      phone: "655456789",
      role: "user",
      is_verified: true,
      rating: 4.5,
      total_rides: 42,
    },
    departure_city: "Douala",
    departure_address: "Bonanjo",
    arrival_city: "Bafoussam",
    arrival_address: "Marché A",
    departure_date: "2026-01-21",
    departure_time: "07:00",
    estimated_arrival_time: "11:00",
    available_seats: 4,
    total_seats: 5,
    price_per_seat: 5000,
    description: "SUV spacieux, idéal pour les longs trajets.",
    luggage_allowed: true,
    pets_allowed: false,
    smoking_allowed: false,
    music_allowed: true,
    air_conditioning: true,
    status: "confirmed",
    created_at: "2026-01-12T09:00:00Z",
  },
];

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
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTrips();
  }, [currentPage]);

  useEffect(() => {
    if (searchParams.get("from") || searchParams.get("to")) {
      loadTrips();
    } else {
      setTrips(MOCK_TRIPS);
    }
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        let filteredTrips = [...MOCK_TRIPS];

        if (searchData.departure_city) {
          filteredTrips = filteredTrips.filter((t) =>
            t.departure_city.toLowerCase().includes(searchData.departure_city!.toLowerCase())
          );
        }
        if (searchData.arrival_city) {
          filteredTrips = filteredTrips.filter((t) =>
            t.arrival_city.toLowerCase().includes(searchData.arrival_city!.toLowerCase())
          );
        }
        if (searchData.date) {
          filteredTrips = filteredTrips.filter((t) => t.departure_date === searchData.date);
        }
        if (searchData.passengers && searchData.passengers > 1) {
          filteredTrips = filteredTrips.filter((t) => t.available_seats >= searchData.passengers!);
        }
        if (searchData.min_price) {
          filteredTrips = filteredTrips.filter((t) => t.price_per_seat >= searchData.min_price!);
        }
        if (searchData.max_price) {
          filteredTrips = filteredTrips.filter((t) => t.price_per_seat <= searchData.max_price!);
        }

        filteredTrips.sort((a, b) => {
          if (searchData.sort_by === "price") {
            return searchData.sort_order === "asc"
              ? a.price_per_seat - b.price_per_seat
              : b.price_per_seat - a.price_per_seat;
          }
          if (searchData.sort_by === "rating") {
            return searchData.sort_order === "asc"
              ? (a.driver.rating || 0) - (b.driver.rating || 0)
              : (b.driver.rating || 0) - (a.driver.rating || 0);
          }
          const dateA = new Date(`${a.departure_date}T${a.departure_time}`);
          const dateB = new Date(`${b.departure_date}T${b.departure_time}`);
          return searchData.sort_order === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        });

        setTrips(filteredTrips);
        setTotalPages(1);
      } else {
        const response = await tripService.searchTrips({
          ...searchData,
          page: currentPage,
          per_page: 10,
        });
        setTrips(response.data);
        setTotalPages(response.meta.last_page);
      }
    } catch (err) {
      setError("Erreur lors du chargement des trajets");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchData.departure_city) params.set("from", searchData.departure_city);
    if (searchData.arrival_city) params.set("to", searchData.arrival_city);
    if (searchData.date) params.set("date", searchData.date);
    if (searchData.passengers) params.set("passengers", searchData.passengers.toString());
    setSearchParams(params);
    setCurrentPage(1);
    loadTrips();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timeStr: string) => timeStr.substring(0, 5);

  return (
    <Layout showFooter={false}>
      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch}>
            <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* Départ */}
                <div className="lg:col-span-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Départ</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full"></div>
                    <input
                      type="text"
                      placeholder="Yaoundé"
                      value={searchData.departure_city}
                      onChange={(e) => setSearchData({ ...searchData, departure_city: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="lg:col-span-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                    <input
                      type="text"
                      placeholder="Douala"
                      value={searchData.arrival_city}
                      onChange={(e) => setSearchData({ ...searchData, arrival_city: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Passagers */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Passagers</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={searchData.passengers}
                      onChange={(e) => setSearchData({ ...searchData, passengers: parseInt(e.target.value) })}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white font-medium"
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
                className="w-full mt-6 bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {trips.length} trajet{trips.length > 1 ? "s" : ""} trouvé{trips.length > 1 ? "s" : ""}
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 bg-white rounded-full hover:border-black transition-all font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </button>

              <select
                value={`${searchData.sort_by}-${searchData.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split("-") as [string, string];
                  setSearchData({ ...searchData, sort_by: sort_by as any, sort_order: sort_order as any });
                  setTimeout(loadTrips, 0);
                }}
                className="px-4 py-2.5 border-2 border-gray-200 bg-white rounded-full font-medium focus:ring-2 focus:ring-yellow-400 outline-none"
              >
                <option value="date-asc">Date (proche)</option>
                <option value="date-desc">Date (lointaine)</option>
                <option value="price-asc">Prix (croissant)</option>
                <option value="price-desc">Prix (décroissant)</option>
                <option value="rating-desc">Note (meilleure)</option>
              </select>
            </div>
          </div>

          {/* Filters panel */}
          <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border-2 border-gray-200 p-6 mb-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Filtres avancés</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prix min (FCFA)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={searchData.min_price || ""}
                    onChange={(e) => setSearchData({ ...searchData, min_price: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prix max (FCFA)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={searchData.max_price || ""}
                    onChange={(e) => setSearchData({ ...searchData, max_price: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => { loadTrips(); setShowFilters(false); }}
                  className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-900 transition-all"
                >
                  Appliquer
                </button>
              </div>
            </motion.div>
          )}
         </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 font-semibold text-lg">{error}</p>
              <button onClick={loadTrips} className="mt-4 text-red-600 hover:text-red-700 font-semibold underline">
                Réessayer
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && trips.length === 0 && (
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-16 text-center">
              <Car className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun trajet trouvé</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Essayez de modifier vos critères de recherche ou proposez votre propre trajet.
              </p>
              <button
                onClick={() => navigate("/trips/create")}
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
              >
                Proposer un trajet
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Trips list */}
          {!isLoading && !error && trips.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06 },
                },
              }}
              className="space-y-4"
            >
              {trips.map((trip) => (
                <motion.div
                  key={trip.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="bg-white rounded-3xl border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Trip info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 bg-black rounded-full"></div>
                            <div className="w-0.5 h-16 bg-gray-300"></div>
                            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-6">
                              <span className="text-2xl font-bold text-gray-900">{formatTime(trip.departure_time)}</span>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{trip.departure_city}</p>
                                <p className="text-gray-500">{trip.departure_address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-gray-900">
                                {trip.estimated_arrival_time ? formatTime(trip.estimated_arrival_time) : "--:--"}
                              </span>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{trip.arrival_city}</p>
                                <p className="text-gray-500">{trip.arrival_address}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mt-4 ml-8">
                          {trip.air_conditioning && (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                              <Wind className="w-3 h-3" /> Climatisé
                            </span>
                          )}
                          {trip.luggage_allowed && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">
                              <Luggage className="w-3 h-3" /> Bagages
                            </span>
                          )}
                          {trip.pets_allowed && (
                            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium">
                              <Dog className="w-3 h-3" /> Animaux
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & driver */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">{trip.price_per_seat.toLocaleString()} <span className="text-lg">FCFA</span></p>
                          <p className="text-gray-500">par place</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{trip.driver.name}</p>
                            <div className="flex items-center justify-end gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{trip.driver.rating || "N/A"}</span>
                              <span className="text-gray-400 text-sm">({trip.driver.total_rides || 0})</span>
                            </div>
                          </div>
                          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="font-bold text-black text-lg">
                              {trip.driver.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2 font-medium">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.departure_date)}
                        </span>
                        <span className="flex items-center gap-2 font-medium">
                          <Users className="w-4 h-4" />
                          {trip.available_seats} place{trip.available_seats > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-yellow-600 hover:text-yellow-700 font-bold flex items-center gap-1">
                        Voir détails
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-full font-bold transition-all ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-black"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
