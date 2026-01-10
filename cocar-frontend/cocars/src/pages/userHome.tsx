import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  MapPin,
  Clock,
  User,
  CreditCard,
  Settings,
  LogOut,
  Plus,
  Navigation,
  Phone,
  Star,
  Calendar,
  DollarSign,
  ChevronRight,
  Users,
  Briefcase,
  ChevronLeft,
  Check,
  Car,
  Mail,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Composant du formulaire multi-étapes
function MultiStepBookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup: "",
    destination: "",
    pickupDetails: "",
    destinationDetails: "",
    bookingType: "now",
    date: "",
    time: "",
    passengers: "1",
    luggage: "0",
    vehicleType: "standard",
    specialRequests: "",
    fullName: "",
    phone: "",
    email: "",
    paymentMethod: "cash",
  });

  const totalSteps = 5;

  const vehicleTypes = [
    {
      id: "standard",
      name: "Standard",
      description: "Voiture confortable pour 4 passagers",
      price: "2,500 FCFA",
      icon: Car,
    },
    {
      id: "premium",
      name: "Premium",
      description: "Véhicule haut de gamme, climatisé",
      price: "4,500 FCFA",
      icon: Car,
    },
    {
      id: "van",
      name: "Van",
      description: "Pour groupes jusqu'à 7 passagers",
      price: "6,000 FCFA",
      icon: Car,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Réservation confirmée:", formData);
    onClose();
    setCurrentStep(1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Définir l'itinéraire
              </h3>
              <p className="text-sm text-slate-600">
                D'où partez-vous et où allez-vous ?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  Point de départ
                </label>
                <input
                  type="text"
                  placeholder="Ex: Yaoundé Centre, Tsinga..."
                  value={formData.pickup}
                  onChange={(e) => handleInputChange("pickup", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Détails (bâtiment, point de repère...)"
                  value={formData.pickupDetails}
                  onChange={(e) =>
                    handleInputChange("pickupDetails", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                />
              </div>

              <div className="relative py-2">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-0.5 bg-slate-300"></div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Ex: Bastos, Omnisport..."
                  value={formData.destination}
                  onChange={(e) =>
                    handleInputChange("destination", e.target.value)
                  }
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Détails (bâtiment, point de repère...)"
                  value={formData.destinationDetails}
                  onChange={(e) =>
                    handleInputChange("destinationDetails", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Quand souhaitez-vous partir ?
              </h3>
              <p className="text-sm text-slate-600">
                Choisissez votre horaire de départ
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleInputChange("bookingType", "now")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.bookingType === "now"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Clock
                    className={`w-6 h-6 mx-auto mb-2 ${
                      formData.bookingType === "now"
                        ? "text-blue-500"
                        : "text-slate-400"
                    }`}
                  />
                  <p className="font-semibold text-slate-900 text-sm">
                    Maintenant
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Départ immédiat</p>
                </button>

                <button
                  onClick={() => handleInputChange("bookingType", "scheduled")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.bookingType === "scheduled"
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Calendar
                    className={`w-6 h-6 mx-auto mb-2 ${
                      formData.bookingType === "scheduled"
                        ? "text-amber-500"
                        : "text-slate-400"
                    }`}
                  />
                  <p className="font-semibold text-slate-900 text-sm">
                    Programmer
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Choisir date/heure
                  </p>
                </button>
              </div>

              {formData.bookingType === "scheduled" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Date de départ
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Heure de départ
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Détails du voyage
              </h3>
              <p className="text-sm text-slate-600">
                Informations sur les passagers et le véhicule
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Passagers
                  </label>
                  <select
                    value={formData.passengers}
                    onChange={(e) =>
                      handleInputChange("passengers", e.target.value)
                    }
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  >
                    <option value="1">1 passager</option>
                    <option value="2">2 passagers</option>
                    <option value="3">3 passagers</option>
                    <option value="4">4 passagers</option>
                    <option value="5">5+ passagers</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Bagages
                  </label>
                  <select
                    value={formData.luggage}
                    onChange={(e) =>
                      handleInputChange("luggage", e.target.value)
                    }
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  >
                    <option value="0">Aucun</option>
                    <option value="1">1 bagage</option>
                    <option value="2">2 bagages</option>
                    <option value="3">3+ bagages</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Type de véhicule
                </label>
                <div className="space-y-3">
                  {vehicleTypes.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() =>
                        handleInputChange("vehicleType", vehicle.id)
                      }
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        formData.vehicleType === vehicle.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              formData.vehicleType === vehicle.id
                                ? "bg-blue-100"
                                : "bg-slate-100"
                            }`}
                          >
                            <vehicle.icon
                              className={`w-5 h-5 ${
                                formData.vehicleType === vehicle.id
                                  ? "text-blue-600"
                                  : "text-slate-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {vehicle.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {vehicle.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {vehicle.price}
                          </p>
                          <p className="text-xs text-slate-600">estimé</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Demandes spéciales (optionnel)
                </label>
                <textarea
                  placeholder="Ex: Climatisation, siège bébé, arrêt en cours de route..."
                  value={formData.specialRequests}
                  onChange={(e) =>
                    handleInputChange("specialRequests", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Informations du passager
              </h3>
              <p className="text-sm text-slate-600">
                Pour confirmer votre réservation
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +237 6 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
                <p className="text-xs text-slate-500">
                  Le chauffeur vous contactera sur ce numéro
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
                <p className="text-xs text-slate-500">
                  Pour recevoir la confirmation par email
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Récapitulatif et paiement
              </h3>
              <p className="text-sm text-slate-600">
                Vérifiez vos informations avant de confirmer
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 mb-1">Départ</p>
                  <p className="font-semibold text-slate-900">
                    {formData.pickup || "Non défini"}
                  </p>
                  {formData.pickupDetails && (
                    <p className="text-sm text-slate-600">
                      {formData.pickupDetails}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 mb-1">Destination</p>
                  <p className="font-semibold text-slate-900">
                    {formData.destination || "Non défini"}
                  </p>
                  {formData.destinationDetails && (
                    <p className="text-sm text-slate-600">
                      {formData.destinationDetails}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Horaire:</span>
                  <span className="font-medium text-slate-900">
                    {formData.bookingType === "now"
                      ? "Maintenant"
                      : `${formData.date} à ${formData.time}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Passagers:</span>
                  <span className="font-medium text-slate-900">
                    {formData.passengers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Véhicule:</span>
                  <span className="font-medium text-slate-900">
                    {
                      vehicleTypes.find((v) => v.id === formData.vehicleType)
                        ?.name
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Contact:</span>
                  <span className="font-medium text-slate-900">
                    {formData.phone || "Non défini"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Mode de paiement
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => handleInputChange("paymentMethod", "cash")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.paymentMethod === "cash"
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Espèces</p>
                      <p className="text-xs text-slate-600">
                        Payer le chauffeur directement
                      </p>
                    </div>
                    <DollarSign
                      className={`w-5 h-5 ${
                        formData.paymentMethod === "cash"
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                </button>

                <button
                  onClick={() => handleInputChange("paymentMethod", "mobile")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.paymentMethod === "mobile"
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Mobile Money
                      </p>
                      <p className="text-xs text-slate-600">
                        MTN, Orange Money
                      </p>
                    </div>
                    <Phone
                      className={`w-5 h-5 ${
                        formData.paymentMethod === "mobile"
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                </button>

                <button
                  onClick={() => handleInputChange("paymentMethod", "card")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    formData.paymentMethod === "card"
                      ? "border-purple-500 bg-purple-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Carte bancaire
                      </p>
                      <p className="text-xs text-slate-600">Visa, Mastercard</p>
                    </div>
                    <CreditCard
                      className={`w-5 h-5 ${
                        formData.paymentMethod === "card"
                          ? "text-purple-600"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 font-medium">
                  Prix total estimé
                </span>
                <span className="text-3xl font-bold text-slate-900">
                  {
                    vehicleTypes.find((v) => v.id === formData.vehicleType)
                      ?.price
                  }
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Le prix final peut varier selon le trajet réel
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-slate-900">T</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nouvelle réservation
                </h2>
                <p className="text-sm text-slate-800">
                  Étape {currentStep} sur {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setCurrentStep(1);
              }}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-slate-900" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                  i + 1 <= currentStep
                    ? "bg-slate-900"
                    : "bg-white bg-opacity-40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Check className="w-5 h-5" />
                Confirmer la réservation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal UserDashboard
export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString('fr-FR'));

  useEffect(() => {
    const tid = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('fr-FR'));
    }, 1000);
    return () => clearInterval(tid);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const recentTrips = [
    {
      id: "#TXY-1284",
      date: "08 Déc 2024",
      from: "Yaoundé Centre",
      to: "Bastos",
      driver: "Pierre Martin",
      price: "2,500 FCFA",
      status: "completed",
      rating: 5,
    },
    {
      id: "#TXY-1283",
      date: "07 Déc 2024",
      from: "Nsimeyong",
      to: "Omnisport",
      driver: "Jacques Fotso",
      price: "1,800 FCFA",
      status: "completed",
      rating: 4,
    },
    {
      id: "#TXY-1282",
      date: "05 Déc 2024",
      from: "Mvan",
      to: "Nlongkak",
      driver: "Thomas Ndi",
      price: "3,200 FCFA",
      status: "completed",
      rating: 5,
    },
  ];

  const menuItems = [
    { id: "home", label: "Accueil", Icon: Home },
    { id: "trips", label: "Mes courses", Icon: MapPin },
    { id: "scheduled", label: "Courses programmées", Icon: Clock },
    { id: "profile", label: "Mon profil", Icon: User },
    { id: "payment", label: "Paiement", Icon: CreditCard },
    { id: "settings", label: "Paramètres", Icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-slate-900">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">TaxiYa</h1>
              <p className="text-xs text-slate-500">Votre mobilité</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveMenu(id);
                setSidebarOpen(false);
              }}
              className={`w-full text-sm flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeMenu === id
                  ? "bg-amber-400 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button onClick={async () => { await logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name ?? 'Utilisateur'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.role ? ( user.role === 'admin' ? 'Admin' : 'Client') : 'Client'}</p>
                  <p className="text-xs text-slate-400">{currentTime}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
          {activeMenu === 'home' && (
            <main className="p-4 md:p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 text-slate-900">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Bonjour {user?.name ? user.name.split(' ')[0] : '!' } ! 👋</h2>
                <p className="text-slate-800">
                  Où souhaitez-vous aller aujourd'hui ?
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouvelle course
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Courses totales</p>
                  <p className="text-2xl font-bold text-slate-900">24</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Dépenses ce mois</p>
                  <p className="text-2xl font-bold text-slate-900">45,200 F</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">Note moyenne</p>
                  <p className="text-2xl font-bold text-slate-900">4.8</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="bg-white rounded-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  Courses récentes
                </h3>
                <button className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-slate-900">
                          {trip.id}
                        </span>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                          Terminée
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mt-1 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {trip.from}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-amber-500 rounded-full mt-1 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {trip.to}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {trip.driver}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {trip.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">
                          {trip.price}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < trip.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Programmer une course
                  </h4>
                  <p className="text-sm text-slate-600">Réservez à l'avance</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Contacter le support
                  </h4>
                  <p className="text-sm text-slate-600">Disponible 24/7</p>
                </div>
              </div>
            </div>
          </div>
          </main>
        )}

        {activeMenu === 'profile' && (
          <main className="p-4 md:p-6 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl overflow-hidden text-white">
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-6xl md:text-7xl font-bold">{initials}</span>
                  </div>
                  <button className="absolute bottom-2 right-2 bg-amber-400 hover:bg-amber-500 text-slate-900 p-3 rounded-full shadow-lg transition-all">
                    <Mail className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-blue-100 text-lg mb-4 capitalize font-medium">
                    { user?.role === 'admin' ? '👨‍💼 Administrateur' : '👤 Client Premium'}
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                    <div className="bg-blue-500 bg-opacity-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-blue-100">Membre depuis</p>
                      <p className="font-semibold">2024</p>
                    </div>
                    <div className="bg-blue-500 bg-opacity-50 px-4 py-2 rounded-lg">
                      <p className="text-sm text-blue-100">Statut</p>
                      <p className="font-semibold">{user?.is_verified ? '✓ Vérifié' : 'En attente'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">Courses totales</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">24</p>
                <p className="text-xs text-slate-500 mt-1">+3 ce mois</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">Note moyenne</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">4.8</p>
                <p className="text-xs text-slate-500 mt-1">sur 5 étoiles</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium">Dépenses</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">45,2K</p>
                <p className="text-xs text-slate-500 mt-1">FCFA ce mois</p>
              </div>
            </div>

            {/* Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Informations personnelles</h3>
                  <button onClick={() => navigate('/profile')} className="text-amber-600 hover:text-amber-700 transition-colors">
                    ✎ Éditer
                  </button>
                </div>
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Nom complet</p>
                    <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Téléphone</p>
                    <p className="text-lg font-semibold text-slate-900">{user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Type de compte</p>
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <p className="text-sm font-semibold text-blue-700 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Statut du compte</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Email vérifié</p>
                        <p className="text-sm text-slate-600">{user?.email}</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 text-sm font-semibold">✓</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Téléphone vérifié</p>
                        <p className="text-sm text-slate-600">{user?.phone}</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 text-sm font-semibold">✓</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Profil complet</p>
                        <p className="text-sm text-slate-600">85% complété</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-blue-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => navigate('/profile')} className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <span>✎ Éditer mon profil</span>
              </button>
              <button onClick={async () => { await logout(); navigate('/login'); }} className="bg-white border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-900 hover:text-red-600 font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5" />
                <span>Se déconnecter</span>
              </button>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🔒</span> Sécurité
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 hover:border-slate-300">
                  <p className="font-semibold text-slate-900">Changer le mot de passe</p>
                  <p className="text-sm text-slate-600">Modifiez votre mot de passe régulièrement</p>
                </button>
                <button className="w-full text-left p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 hover:border-slate-300">
                  <p className="font-semibold text-slate-900">Connexions actives</p>
                  <p className="text-sm text-slate-600">Gérez les appareils connectés à votre compte</p>
                </button>
                <button className="w-full text-left p-4 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 hover:border-slate-300">
                  <p className="font-semibold text-slate-900">Authentification à deux facteurs</p>
                  <p className="text-sm text-slate-600">Ajoutez une couche supplémentaire de sécurité</p>
                </button>
              </div>
            </div>
          </main>
        )}

        {activeMenu === 'scheduled' && (
          <main className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900">Courses programmées</h3>
              <button onClick={() => setShowBookingModal(true)} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-6 py-2 rounded-xl transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Programmer
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Empty State */}
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <div className="inline-block mb-4 p-4 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Aucune course programmée</h4>
                <p className="text-slate-600 mb-6">Vous n'avez pas encore programmé de course pour le futur.</p>
                <button onClick={() => setShowBookingModal(true)} className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold py-3 px-8 rounded-xl transition-all">
                  Programmer une course
                </button>
              </div>
            </div>
          </main>
        )}

        {activeMenu === 'payment' && (
          <main className="p-4 md:p-6 space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Méthodes de paiement</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Credit Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 text-3xl">💳</div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Numéro de carte</p>
                    <p className="font-mono text-lg">•••• •••• •••• 4242</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">TITULAIRE</p>
                      <p className="font-semibold">Jean Dupont</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">EXPIRE</p>
                      <p className="font-semibold">12/25</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Card */}
              <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors flex items-center justify-center cursor-pointer group">
                <div className="text-center">
                  <div className="inline-block mb-3 p-4 bg-amber-100 rounded-full group-hover:bg-amber-200 transition-colors">
                    <Plus className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Ajouter une carte</p>
                  <p className="text-sm text-slate-600">Visa, Mastercard acceptées</p>
                </div>
              </div>
            </div>

            {/* Payment Methods List */}
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h4 className="font-bold text-slate-900">Méthodes de paiement disponibles</h4>
              </div>
              <div className="divide-y divide-slate-200">
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Carte bancaire</p>
                      <p className="text-sm text-slate-600">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Paiement en espèces</p>
                      <p className="text-sm text-slate-600">À la fin de votre course</p>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </main>
        )}

        {activeMenu === 'settings' && (
          <main className="p-4 md:p-6 space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Paramètres</h3>

            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Préférences générales</h4>
                <p className="text-sm text-slate-600">Personnalisez votre expérience TaxiYa</p>
              </div>
              <div className="divide-y divide-slate-200">
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">Notifications</p>
                    <p className="text-sm text-slate-600">Recevez des alertes pour vos courses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">Partage de localisation</p>
                    <p className="text-sm text-slate-600">Permettre aux chauffeurs de vous localiser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900">SMS de confirmation</p>
                    <p className="text-sm text-slate-600">Recevez un SMS pour chaque réservation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h4 className="font-bold text-slate-900">Langue et région</h4>
              </div>
              <div className="divide-y divide-slate-200">
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Langue</p>
                    <p className="text-sm text-slate-600">Français</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Fuseau horaire</p>
                    <p className="text-sm text-slate-600">GMT+1 (Afrique Centrale)</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h4 className="font-bold text-red-900 mb-4">Zone de danger</h4>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all">
                Supprimer mon compte
              </button>
              <p className="text-sm text-red-700 mt-3">⚠️ Cette action est irréversible. Toutes vos données seront supprimées.</p>
            </div>
          </main>
        )}

        {activeMenu === 'trips' && (
          <main className="p-4 md:p-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Mes courses</h3>
                <button className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-slate-200">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{trip.id} — {trip.from} → {trip.to}</div>
                        <div className="text-sm text-slate-600">{trip.date} • {trip.driver}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{trip.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Multi-Step Booking Modal */}
      <MultiStepBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}