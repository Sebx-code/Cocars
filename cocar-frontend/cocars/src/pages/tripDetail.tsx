// src/pages/tripDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Star,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  MessageCircle,
  Shield,
  Luggage,
  Music,
  Wind,
  Dog,
  Cigarette,
  Share2,
  Heart,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import { tripService } from "../services/tripService";
import { bookingService } from "../services/bookingService";
import { USE_MOCK_DATA } from "../config/api";
import type { Trip } from "../types";

// Données mockées
const MOCK_TRIP: Trip = {
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
    bio: "Conducteur expérimenté, j'effectue régulièrement le trajet Yaoundé-Douala. Ponctuel et professionnel.",
  },
  departure_city: "Yaoundé",
  departure_address: "Carrefour Nlongkak, devant la station Total",
  arrival_city: "Douala",
  arrival_address: "Akwa Palace, près du rond-point Deido",
  departure_date: "2026-01-20",
  departure_time: "06:00",
  estimated_arrival_time: "09:30",
  available_seats: 3,
  total_seats: 4,
  price_per_seat: 4000,
  description: "Trajet direct sans escale. Départ ponctuel, merci d'être à l'heure. Possibilité de déposer à Bonabéri sur demande. Véhicule climatisé et confortable.",
  luggage_allowed: true,
  pets_allowed: false,
  smoking_allowed: false,
  music_allowed: true,
  air_conditioning: true,
  status: "confirmed",
  created_at: "2026-01-10T10:00:00Z",
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTrip(MOCK_TRIP);
      } else {
        const response = await tripService.getTripById(id!);
        setTrip(response.data);
      }
    } catch (err) {
      setError("Erreur lors du chargement du trajet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/trips/${id}` } });
      return;
    }

    setIsBooking(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        await bookingService.createBooking({
          trip_id: parseInt(id!),
          seats_booked: seatsToBook,
          message: bookingMessage || undefined,
        });
      }
      setBookingSuccess(true);
      setShowBookingModal(false);
    } catch (err) {
      setError("Erreur lors de la réservation");
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        </div>
      </Layout>
    );
  }

  if (error || !trip) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Trajet introuvable</h2>
            <p className="text-gray-600 mb-8">{error || "Ce trajet n'existe pas ou a été supprimé."}</p>
            <Link
              to="/trips"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-900 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux trajets
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (bookingSuccess) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border-2 border-gray-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Réservation envoyée !</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Votre demande a été envoyée à {trip.driver.name}. Vous serez notifié dès qu'il l'aura confirmée.
            </p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Trajet</span>
                <span className="font-semibold">{trip.departure_city} → {trip.arrival_city}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{formatDate(trip.departure_date)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-600">Places</span>
                <span className="font-semibold">{seatsToBook}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                <span>Total</span>
                <span className="text-yellow-600">{(trip.price_per_seat * seatsToBook).toLocaleString()} FCFA</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/user/bookings")}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold hover:bg-gray-900 transition-all"
              >
                Mes réservations
              </button>
              <button
                onClick={() => navigate("/trips")}
                className="flex-1 border-2 border-gray-200 py-4 rounded-full font-bold hover:bg-gray-50 transition-all"
              >
                Autres trajets
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      {/* Back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Itinerary card */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                <div className="flex items-center gap-2 text-gray-500 mb-6">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{formatDate(trip.departure_date)}</span>
                </div>

                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-24 bg-gray-300"></div>
                    <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-gray-900">{trip.departure_time.substring(0, 5)}</span>
                      </div>
                      <p className="font-bold text-xl text-gray-900">{trip.departure_city}</p>
                      <p className="text-gray-500">{trip.departure_address}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {trip.estimated_arrival_time?.substring(0, 5) || "--:--"}
                        </span>
                        <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">~3h30</span>
                      </div>
                      <p className="font-bold text-xl text-gray-900">{trip.arrival_city}</p>
                      <p className="text-gray-500">{trip.arrival_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver card */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                <h3 className="font-bold text-xl text-gray-900 mb-6">Conducteur</h3>
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-black">
                      {trip.driver.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-xl text-gray-900">{trip.driver.name}</h4>
                      {trip.driver.is_verified && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          <Shield className="w-3 h-3" />
                          Vérifié
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{trip.driver.rating || "N/A"}</span>
                      </span>
                      <span>{trip.driver.total_rides || 0} trajets</span>
                    </div>
                    {trip.driver.bio && (
                      <p className="text-gray-600">{trip.driver.bio}</p>
                    )}
                  </div>
                  <button className="p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <MessageCircle className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {trip.description && (
                <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                  <h3 className="font-bold text-xl text-gray-900 mb-4">À propos de ce trajet</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{trip.description}</p>
                </div>
              )}

              {/* Options */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                <h3 className="font-bold text-xl text-gray-900 mb-6">Ce qui est proposé</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { allowed: trip.luggage_allowed, label: "Bagages", icon: Luggage, color: "green" },
                    { allowed: trip.air_conditioning, label: "Climatisation", icon: Wind, color: "blue" },
                    { allowed: trip.music_allowed, label: "Musique", icon: Music, color: "purple" },
                    { allowed: trip.pets_allowed, label: "Animaux", icon: Dog, color: "orange" },
                    { allowed: !trip.smoking_allowed, label: "Non-fumeur", icon: Cigarette, color: "gray" },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.label}
                        className={`flex items-center gap-3 p-4 rounded-2xl ${
                          opt.allowed ? "bg-gray-50" : "bg-gray-50 opacity-50"
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${opt.allowed ? "text-gray-700" : "text-gray-400"}`} />
                        <span className={`font-medium ${opt.allowed ? "text-gray-900" : "text-gray-400 line-through"}`}>
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar - Booking */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 p-8 sticky top-24">
                <div className="text-center mb-8">
                  <p className="text-4xl font-bold text-gray-900">
                    {trip.price_per_seat.toLocaleString()} <span className="text-xl">FCFA</span>
                  </p>
                  <p className="text-gray-500">par place</p>
                </div>

                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
                  <span className="text-gray-600 font-medium">Places disponibles</span>
                  <span className="font-bold text-xl">
                    {trip.available_seats} / {trip.total_seats}
                  </span>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de places</label>
                  <select
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none font-medium"
                  >
                    {Array.from({ length: trip.available_seats }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} place{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center mb-8 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {(trip.price_per_seat * seatsToBook).toLocaleString()} FCFA
                  </span>
                </div>

                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate("/login", { state: { from: `/trips/${id}` } })}
                      className="w-full bg-black hover:bg-neutral-900 text-white py-5 rounded-full font-bold text-lg transition-all hover:scale-[1.02] shadow-lg"
                    >
                      Se connecter pour réserver
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      Connectez-vous pour envoyer une demande de réservation.
                    </p>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      disabled={trip.available_seats === 0}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-5 rounded-full font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Réserver
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      Paiement après confirmation du conducteur
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Confirmer la réservation</h3>

            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">{trip.departure_city} → {trip.arrival_city}</span>
                <span className="font-semibold">{formatDate(trip.departure_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{seatsToBook} place{seatsToBook > 1 ? "s" : ""}</span>
                <span className="font-bold text-lg">{(trip.price_per_seat * seatsToBook).toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message au conducteur (optionnel)
              </label>
              <textarea
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                placeholder="Présentez-vous ou posez une question..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 border-2 border-gray-200 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBooking}
                disabled={isBooking}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
