// src/pages/userDashboard.tsx
import {
  Menu,
  X,
  MapPin,
  Calendar,
  Star,
  Clock,
  User,
  LogOut,
  Plus,
  ChevronRight,
  Navigation,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { UserProvider } from "../contexts/userContext";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Composant du contenu principal
function UserDashboardContent() {
  const {
    activeTab,
    setActiveTab,
    showBookingModal,
    setShowBookingModal,
    bookingFormData,
    setBookingFormData,
    recentTrips,
    upcomingTrips,
    quickStats,
    handleBookingSubmit,
    handleCancelTrip,
  } = useUser();

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const vehicleTypes = [
    {
      id: "economy" as const,
      name: "Économique",
      description: "Partagez avec d'autres",
      price: "1,500 FCFA",
      icon: "🚗",
    },
    {
      id: "standard" as const,
      name: "Standard",
      description: "Confort et rapidité",
      price: "2,500 FCFA",
      icon: "🚙",
    },
    {
      id: "premium" as const,
      name: "Premium",
      description: "Luxe et prestige",
      price: "4,500 FCFA",
      icon: "🚕",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-lg">Rs</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Rideshare
                </span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "text-black"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => setActiveTab("trips")}
                  className={`font-medium transition-colors ${
                    activeTab === "trips"
                      ? "text-black"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  Mes trajets
                </button>
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`font-medium transition-colors ${
                    activeTab === "upcoming"
                      ? "text-black"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  À venir
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau trajet
              </button>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">
                      {userInitials}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-4 h-4" />
                    Mon profil
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 px-4 space-y-3 bg-white">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-black font-medium py-2"
            >
              Tableau de bord
            </button>
            <button
              onClick={() => {
                setActiveTab("trips");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-black font-medium py-2"
            >
              Mes trajets
            </button>
            <button
              onClick={() => {
                setActiveTab("upcoming");
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-black font-medium py-2"
            >
              À venir
            </button>
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold"
            >
              Nouveau trajet
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-linear-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl p-8 md:p-12 text-black">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Bonjour {user?.name?.split(" ")[0]} ! 👋
              </h1>
              <p className="text-xl text-gray-900 mb-6 font-medium">
                Prêt pour votre prochain voyage ?
              </p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-900 transition-all hover:scale-105 shadow-xl inline-flex items-center gap-2"
              >
                Réserver maintenant
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}
                    >
                      {stat.icon}
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Trips */}
            <div className="bg-white rounded-3xl border-2 border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Trajets récents
                </h2>
                <button
                  onClick={() => setActiveTab("trips")}
                  className="text-black hover:text-gray-700 font-semibold flex items-center gap-1"
                >
                  Voir tout
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {recentTrips.slice(0, 3).map((trip) => (
                  <div
                    key={trip.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                            Terminé
                          </span>
                          <span className="text-sm text-gray-600">
                            {trip.date} • {trip.time}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-black rounded-full mt-1.5"></div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {trip.from}
                              </p>
                              <p className="text-sm text-gray-600">Départ</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-yellow-500 shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {trip.to}
                              </p>
                              <p className="text-sm text-gray-600">
                                Destination
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>{trip.distance}</span>
                          <span>•</span>
                          <span>{trip.duration}</span>
                          <span>•</span>
                          <span>{trip.driver}</span>
                        </div>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {trip.price}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {trip.rating &&
                              [...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (trip.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setActiveTab("upcoming")}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all cursor-pointer hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Trajets programmés
                    </h3>
                    <p className="text-gray-600">
                      {upcomingTrips.length} trajet
                      {upcomingTrips.length > 1 ? "s" : ""} à venir
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all cursor-pointer hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                    💳
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Mes paiements
                    </h3>
                    <p className="text-gray-600">Gérer mes moyens de paiement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === "trips" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Historique des trajets
            </h1>
            <div className="bg-white rounded-3xl border-2 border-gray-200">
              <div className="divide-y divide-gray-200">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              trip.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : trip.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {trip.status === "completed"
                              ? "Terminé"
                              : trip.status === "cancelled"
                              ? "Annulé"
                              : "À venir"}
                          </span>
                          <span className="text-sm text-gray-600">
                            {trip.date} • {trip.time}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-black rounded-full mt-1.5"></div>
                            <p className="font-semibold text-gray-900">
                              {trip.from}
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-yellow-500" />
                            <p className="font-semibold text-gray-900">
                              {trip.to}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span>{trip.distance}</span>
                          <span>•</span>
                          <span>{trip.duration}</span>
                          <span>•</span>
                          <span>{trip.driver}</span>
                        </div>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {trip.price}
                          </p>
                          {trip.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (trip.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Tab */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Trajets à venir
              </h1>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau trajet
              </button>
            </div>

            {upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Programmé
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {trip.date} • {trip.time}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-black rounded-full mt-1.5"></div>
                            <p className="font-semibold text-gray-900">
                              {trip.from}
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-yellow-500" />
                            <p className="font-semibold text-gray-900">
                              {trip.to}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{trip.distance}</span>
                          <span>•</span>
                          <span>{trip.duration}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {trip.price}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelTrip(trip.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 text-center">
                <div className="inline-block mb-4 p-4 bg-blue-100 rounded-full">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Aucun trajet programmé
                </h3>
                <p className="text-gray-600 mb-6">
                  Planifiez votre prochain voyage dès maintenant
                </p>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-linear-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-lg"
                >
                  Réserver un trajet
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-linear-to-r from-yellow-400 to-yellow-500 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black">
                  Réserver un trajet
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-black hover:bg-opacity-10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-blue-500" />
                      Point de départ
                    </label>
                    <input
                      type="text"
                      placeholder="Yaoundé Centre, Tsinga..."
                      value={bookingFormData.pickup}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          pickup: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-500" />
                      Destination
                    </label>
                    <input
                      type="text"
                      placeholder="Bastos, Omnisport..."
                      value={bookingFormData.destination}
                      onChange={(e) =>
                        setBookingFormData({
                          ...bookingFormData,
                          destination: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">
                        Date
                      </label>
                      <input
                        type="date"
                        value={bookingFormData.date}
                        onChange={(e) =>
                          setBookingFormData({
                            ...bookingFormData,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">
                        Heure
                      </label>
                      <input
                        type="time"
                        value={bookingFormData.time}
                        onChange={(e) =>
                          setBookingFormData({
                            ...bookingFormData,
                            time: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">
                      Type de véhicule
                    </label>
                    <div className="space-y-3">
                      {vehicleTypes.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() =>
                            setBookingFormData({
                              ...bookingFormData,
                              vehicleType: vehicle.id,
                            })
                          }
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            bookingFormData.vehicleType === vehicle.id
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{vehicle.icon}</div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {vehicle.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {vehicle.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {vehicle.price}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <button
                onClick={handleBookingSubmit}
                className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant wrapper avec le Provider
export default function UserDashboard() {
  return (
    <UserProvider>
      <UserDashboardContent />
    </UserProvider>
  );
}