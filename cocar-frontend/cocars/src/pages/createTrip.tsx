// src/pages/createTrip.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  DollarSign,
  ArrowLeft,
  Check,
  Loader2,
  Info,
  Luggage,
  Music,
  Wind,
  Dog,
  Cigarette,
  AlertCircle,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { tripService } from "../services/tripService";
import type { CreateTripData } from "../types";

const POPULAR_CITIES = [
  "Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua", "Maroua",
  "Ngaoundéré", "Kribi", "Limbe", "Buea", "Ebolowa", "Bertoua",
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<CreateTripData>({
    departure_city: "",
    departure_address: "",
    arrival_city: "",
    arrival_address: "",
    departure_date: "",
    departure_time: "",
    estimated_arrival_time: "",
    available_seats: 3,
    price_per_seat: 0,
    description: "",
    vehicle_registration: "",
    vehicle_brand: "",
    vehicle_color: "",
    luggage_allowed: true,
    pets_allowed: false,
    smoking_allowed: false,
    music_allowed: true,
    air_conditioning: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/trips/create" } });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await tripService.createTrip(formData);
      console.log('Trip created successfully:', response);
      setSuccess(true);
      setTimeout(() => navigate("/user/my-trips"), 2000);
    } catch (err: unknown) {
      console.error('Error creating trip:', err);
      let errorMessage = "Erreur lors de la création du trajet";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'errors' in err) {
        const errors = (err as { errors?: Record<string, unknown> }).errors;
        const firstError = errors ? Object.values(errors)[0] : undefined;
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = String(firstError[0]);
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => currentStep < 3 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const isStep1Valid = () =>
    formData.departure_city && formData.departure_address &&
    formData.arrival_city && formData.arrival_address;

  const isStep2Valid = () =>
    formData.departure_date && formData.departure_time &&
    formData.available_seats > 0 && formData.price_per_seat > 0 &&
    formData.vehicle_registration && formData.vehicle_brand && formData.vehicle_color;

  if (success) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="card-theme rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border-2">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-theme-primary mb-3">Trajet publié !</h2>
            <p className="text-theme-secondary text-lg mb-8">
              Votre trajet a été publié avec succès. Les passagers peuvent maintenant le réserver.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/user/my-trips")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-full font-bold transition-all"
              >
                Voir mes trajets
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    departure_city: "", departure_address: "", arrival_city: "", arrival_address: "",
                    departure_date: "", departure_time: "", estimated_arrival_time: "",
                    available_seats: 3, price_per_seat: 0, description: "",
                    vehicle_registration: "", vehicle_brand: "", vehicle_color: "",
                    luggage_allowed: true, pets_allowed: false, smoking_allowed: false,
                    music_allowed: true, air_conditioning: true,
                  });
                  setCurrentStep(1);
                }}
                className="flex-1 border-2 border-theme-strong py-4 rounded-full font-bold hover:bg-theme-secondary transition-all"
              >
                Nouveau trajet
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="bg-theme-primary min-h-[calc(100vh-64px)]">
        {/* Header */}
        <div className="card-theme border-b border-theme">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card-theme border-b border-theme">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Itinéraire" },
                { num: 2, label: "Détails" },
                { num: 3, label: "Options" },
              ].map((step, index) => (
                <div key={step.num} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                      currentStep >= step.num
                        ? "bg-emerald-500 text-white"
                        : "bg-theme-secondary text-theme-tertiary"
                    }`}
                  >
                    {currentStep > step.num ? <Check className="w-6 h-6" /> : step.num}
                  </div>
                  <span className={`ml-3 font-semibold hidden sm:block ${
                    currentStep >= step.num ? "text-theme-primary" : "text-theme-tertiary"
                  }`}>
                    {step.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-16 sm:w-24 h-1 mx-4 rounded-full ${
                      currentStep > step.num ? "bg-emerald-500" : "bg-theme-secondary"
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" initial={false}>
            {/* Step 1: Itinéraire */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
                className="card-theme rounded-3xl shadow-sm border-2 p-8"
              >
                <h2 className="text-2xl font-bold text-theme-primary mb-8">Définissez votre itinéraire</h2>

                <div className="mb-8">
                  <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-3">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                    Lieu de départ
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Ville</label>
                      <select
                        value={formData.departure_city}
                        onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                        required
                      >
                        <option value="">Sélectionnez une ville</option>
                        {POPULAR_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Adresse / Point de rencontre</label>
                      <input
                        type="text"
                        value={formData.departure_address}
                        onChange={(e) => setFormData({ ...formData, departure_address: e.target.value })}
                        placeholder="Ex: Carrefour Nlongkak, devant la pharmacie"
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Lieu d'arrivée
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Ville</label>
                      <select
                        value={formData.arrival_city}
                        onChange={(e) => setFormData({ ...formData, arrival_city: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                        required
                      >
                        <option value="">Sélectionnez une ville</option>
                        {POPULAR_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Adresse / Point de dépôt</label>
                      <input
                        type="text"
                        value={formData.arrival_address}
                        onChange={(e) => setFormData({ ...formData, arrival_address: e.target.value })}
                        placeholder="Ex: Akwa Palace, près du rond-point"
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStep1Valid()}
                    className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Détails */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
                className="card-theme rounded-3xl shadow-sm border-2 border-theme p-8"
              >
                <h2 className="text-2xl font-bold text-theme-primary mb-8">Détails du trajet</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-3">
                      <Calendar className="w-4 h-4 text-theme-tertiary" />
                      Date de départ
                    </label>
                    <input
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-3">
                      <Clock className="w-4 h-4 text-theme-tertiary" />
                      Heure de départ
                    </label>
                    <input
                      type="time"
                      value={formData.departure_time}
                      onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-3">
                      <Users className="w-4 h-4 text-theme-tertiary" />
                      Nombre de places
                    </label>
                    <select
                      value={formData.available_seats}
                      onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                      className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num}>{num} place{num > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-3">
                      <DollarSign className="w-4 h-4 text-theme-tertiary" />
                      Prix par place (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.price_per_seat || ""}
                      onChange={(e) => setFormData({ ...formData, price_per_seat: parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 4000"
                      min="500"
                      step="100"
                      className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Informations du véhicule */}
                <div className="mb-8">
                  <label className="flex items-center gap-2 text-sm font-semibold text-theme-primary mb-4">
                    <Car className="w-4 h-4 text-emerald-600" />
                    Informations du véhicule
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Immatriculation *</label>
                      <input
                        type="text"
                        value={formData.vehicle_registration}
                        onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value.toUpperCase() })}
                        placeholder="Ex: LT-1234-AB"
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Marque *</label>
                      <input
                        type="text"
                        value={formData.vehicle_brand}
                        onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                        placeholder="Ex: Toyota"
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-theme-tertiary mb-1.5">Couleur *</label>
                      <input
                        type="text"
                        value={formData.vehicle_color}
                        onChange={(e) => setFormData({ ...formData, vehicle_color: e.target.value })}
                        placeholder="Ex: Blanche"
                        className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none font-medium"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-theme-tertiary mt-2">
                    Ces informations permettent aux passagers d'identifier facilement votre véhicule
                  </p>
                </div>

                {formData.price_per_seat > 0 && formData.available_seats > 0 && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 mb-8">
                    <div className="flex items-center gap-3 text-emerald-800">
                      <Info className="w-6 h-6" />
                      <span className="font-bold text-lg">
                        Gain potentiel: {(formData.price_per_seat * formData.available_seats).toLocaleString()} FCFA
                      </span>
                    </div>
                    <p className="text-emerald-700 mt-1 ml-9">Si toutes les places sont réservées</p>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="border-2 border-theme px-8 py-4 rounded-full font-bold hover:bg-theme-secondary transition-all"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStep2Valid()}
                    className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Options */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.25 }}
                className="card-theme rounded-3xl shadow-sm border-2 border-theme p-8"
              >
                <h2 className="text-2xl font-bold text-theme-primary mb-8">Options et préférences</h2>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-theme-primary mb-3">
                    Description du trajet (optionnel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Informations supplémentaires, points de passage, etc."
                    rows={3}
                    className="w-full px-4 py-4 border-2 border-theme rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none resize-none font-medium"
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-theme-primary mb-4">
                    Ce qui est autorisé dans votre véhicule
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "luggage_allowed", label: "Bagages", icon: Luggage },
                      { key: "music_allowed", label: "Musique", icon: Music },
                      { key: "air_conditioning", label: "Climatisation", icon: Wind },
                      { key: "pets_allowed", label: "Animaux", icon: Dog },
                      { key: "smoking_allowed", label: "Fumeurs", icon: Cigarette },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isActive = formData[option.key as keyof CreateTripData];
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setFormData({ ...formData, [option.key]: !isActive })}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                            isActive
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-theme hover:border-gray-300"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isActive ? "bg-emerald-500" : "bg-theme-secondary"
                          }`}>
                            <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-theme-tertiary"}`} />
                          </div>
                          <span className={`font-semibold ${isActive ? "text-theme-primary" : "text-theme-secondary"}`}>
                            {option.label}
                          </span>
                          {isActive && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="bg-theme-secondary rounded-2xl p-6 mb-8">
                  <h3 className="font-bold text-theme-primary text-lg mb-4">Récapitulatif</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Trajet</span>
                      <span className="font-semibold">{formData.departure_city} → {formData.arrival_city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Date</span>
                      <span className="font-semibold">
                        {formData.departure_date && new Date(formData.departure_date).toLocaleDateString("fr-FR", {
                          weekday: "long", day: "numeric", month: "long",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Heure</span>
                      <span className="font-semibold">{formData.departure_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Places</span>
                      <span className="font-semibold">{formData.available_seats}</span>
                    </div>
                    <div className="flex justify-between border-t border-theme pt-3 mt-3">
                      <span className="font-semibold text-theme-primary">Prix par place</span>
                      <span className="font-bold text-xl text-emerald-700">
                        {formData.price_per_seat.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="border-2 border-theme px-8 py-4 rounded-full font-bold hover:bg-theme-secondary transition-all"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      <>
                        <Car className="w-5 h-5" />
                        Publier le trajet
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </Layout>
  );
}
