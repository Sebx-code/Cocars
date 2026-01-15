// src/pages/tripDetail.tsx - Données réelles uniquement
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Cigarette,
  Dog,
  Heart,
  Luggage,
  Loader2,
  MessageCircle,
  Music,
  Share2,
  Shield,
  Star,
  Wind,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import { bookingService } from "../services/bookingService";
import { tripService } from "../services/tripService";
import type { Trip } from "../types";

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

  const loadTrip = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await tripService.getTripById(id);
      setTrip(response.data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur lors du chargement du trajet";
      setError(message);
      setTrip(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const handleBooking = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/trips/${id}` } });
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      await bookingService.createBooking({
        trip_id: parseInt(id, 10),
        seats_booked: seatsToBook,
        message: bookingMessage || undefined,
      });
      setBookingSuccess(true);
      setShowBookingModal(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur lors de la réservation";
      setError(message);
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

  const formatTime = (timeStr: string) => timeStr.substring(0, 5);

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
                <span className="font-semibold">
                  {trip.departure_city} → {trip.arrival_city}
                </span>
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
                <span className="text-yellow-600">
                  {(trip.price_per_seat * seatsToBook).toLocaleString()} FCFA
                </span>
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
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Partager">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Favori">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

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
                    <div className="w-5 h-5 bg-black rounded-full" />
                    <div className="w-0.5 h-24 bg-gray-300" />
                    <div className="w-5 h-5 bg-yellow-400 rounded-full" />
                  </div>

                  <div className="flex-1">
                    <div className="mb-10">
                      <span className="text-3xl font-bold text-gray-900">{formatTime(trip.departure_time)}</span>
                      <p className="text-xl font-bold text-gray-900 mt-1">{trip.departure_city}</p>
                      <p className="text-gray-600">{trip.departure_address}</p>
                    </div>

                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        {trip.estimated_arrival_time ? formatTime(trip.estimated_arrival_time) : "--:--"}
                      </span>
                      <p className="text-xl font-bold text-gray-900 mt-1">{trip.arrival_city}</p>
                      <p className="text-gray-600">{trip.arrival_address}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mt-8">
                  {trip.air_conditioning && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                      <Wind className="w-3 h-3" /> Clim
                    </span>
                  )}
                  {trip.luggage_allowed && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
                      <Luggage className="w-3 h-3" /> Bagages
                    </span>
                  )}
                  {trip.pets_allowed && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium">
                      <Dog className="w-3 h-3" /> Animaux
                    </span>
                  )}
                  {trip.music_allowed && (
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full font-medium">
                      <Music className="w-3 h-3" /> Musique
                    </span>
                  )}
                  {trip.smoking_allowed && (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                      <Cigarette className="w-3 h-3" /> Fumeur
                    </span>
                  )}
                </div>

                {trip.description && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3">À propos du trajet</h3>
                    <p className="text-gray-700 leading-relaxed">{trip.description}</p>
                  </div>
                )}
              </div>

              {/* Driver */}
              <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="font-bold text-black text-lg">
                        {trip.driver.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{trip.driver.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{trip.driver.rating || "N/A"}</span>
                        {trip.driver.is_verified && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-semibold">
                            <Shield className="w-3 h-3" /> Vérifié
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-gray-200 hover:border-black font-semibold transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Contacter
                  </button>
                </div>

                {trip.driver.bio && (
                  <p className="mt-6 text-gray-700 bg-gray-50 rounded-2xl p-5">{trip.driver.bio}</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                <p className="text-4xl font-extrabold text-gray-900">
                  {trip.price_per_seat.toLocaleString()}
                  <span className="text-base text-gray-500 ml-2">FCFA / place</span>
                </p>

                <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
                  <span>Places restantes</span>
                  <span className="font-bold text-gray-900">{trip.available_seats}</span>
                </div>

                <div className="mt-6">
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

              <div className="bg-white rounded-3xl shadow-sm border-2 border-gray-100 p-8">
                <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Départ</span>
                    <span className="font-semibold text-gray-900">{trip.departure_city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrivée</span>
                    <span className="font-semibold text-gray-900">{trip.arrival_city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold text-gray-900">{formatDate(trip.departure_date)}</span>
                  </div>
                </div>
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
                <span className="text-gray-600">
                  {trip.departure_city} → {trip.arrival_city}
                </span>
                <span className="font-semibold">{formatDate(trip.departure_date)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Places:</span>
                  <select
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value, 10))}
                    className="border-2 border-gray-200 rounded-xl px-3 py-2 font-semibold"
                  >
                    {Array.from({ length: Math.max(1, trip.available_seats) }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="font-bold text-lg">
                  {(trip.price_per_seat * seatsToBook).toLocaleString()} FCFA
                </span>
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
