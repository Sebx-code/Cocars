// src/pages/signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Check, Car, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/themeContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = () => {
    const { password } = formData;
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 4;
    return 3;
  };

  const validateStep = () => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.name || !formData.email) {
        setError("Veuillez remplir tous les champs");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError("Email invalide");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.password || !formData.password_confirmation) {
        setError("Veuillez remplir tous les champs");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères");
        return false;
      }
      if (formData.password !== formData.password_confirmation) {
        setError("Les mots de passe ne correspondent pas");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      navigate("/user", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const strength = passwordStrength();
  const strengthColors = ["bg-gray-200 dark:bg-gray-700", "bg-red-500", "bg-orange-500", "bg-emerald-500", "bg-green-500"];
  const strengthLabels = ["", "Faible", "Moyen", "Bon", "Fort"];

  return (
    <div className="min-h-screen bg-theme-primary flex transition-colors">
      {/* Left side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Car className="w-7 h-7" />
              </div>
              <span className="text-3xl font-bold">Rideshare</span>
            </Link>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              Rejoignez notre<br />communauté !
            </h2>
            <p className="text-xl text-white/90 max-w-md">
              Créez votre compte en quelques étapes et commencez à partager vos trajets dès aujourd'hui.
            </p>
            <div className="space-y-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-lg">Économisez sur vos trajets</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-lg">Rencontrez de nouvelles personnes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-lg">Réduisez votre empreinte carbone</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/70">
            <button 
              onClick={toggleTheme}
              className="hover:text-white transition-colors font-medium"
            >
              {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>
            <span>•</span>
            <span>© 2024 Rideshare</span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-theme-primary tracking-tight">Rideshare</span>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">
              Créer un compte
            </h1>
            <p className="text-theme-secondary">
              Étape {currentStep} sur 3
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= currentStep ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
              <p className="text-red-700 dark:text-red-300 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-theme-secondary mb-2">
                    Nom complet
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Kamga"
                      className="input-theme w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium placeholder:text-theme-tertiary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-secondary mb-2">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="input-theme w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium placeholder:text-theme-tertiary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-secondary mb-2">
                    Téléphone <span className="text-theme-tertiary font-normal">(optionnel)</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="699 123 456"
                      className="input-theme w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium placeholder:text-theme-tertiary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Continuer
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Password */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-theme-secondary mb-2">
                    Mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="input-theme w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all font-medium"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-secondary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i <= strength ? strengthColors[strength] : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${strength >= 3 ? "text-green-600 dark:text-green-400" : "text-theme-tertiary"}`}>
                        Force: {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-theme-secondary mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      placeholder="••••••••"
                      className={`input-theme w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 outline-none transition-all font-medium ${
                        formData.password_confirmation && formData.password !== formData.password_confirmation
                          ? "border-red-300 dark:border-red-800 focus:border-red-400 focus:ring-red-400"
                          : "focus:ring-emerald-400 focus:border-emerald-400"
                      }`}
                      required
                    />
                    {formData.password_confirmation && formData.password === formData.password_confirmation && (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex-1 border-2 border-theme-strong py-3.5 rounded-xl font-bold text-theme-primary hover:bg-theme-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Continuer
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="bg-theme-secondary rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-theme-primary text-lg">Récapitulatif</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-theme-tertiary uppercase tracking-wide">Nom</p>
                      <p className="text-theme-primary font-semibold">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-theme-tertiary uppercase tracking-wide">Email</p>
                      <p className="text-theme-primary font-semibold">{formData.email}</p>
                    </div>
                    {formData.phone && (
                      <div>
                        <p className="text-xs text-theme-tertiary uppercase tracking-wide">Téléphone</p>
                        <p className="text-theme-primary font-semibold">{formData.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-400 transition-colors"
                    />
                    <span className="text-sm text-theme-secondary group-hover:text-theme-primary transition-colors">
                      J'accepte les{" "}
                      <Link to="/terms" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                        Conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link to="/privacy" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                        Politique de confidentialité
                      </Link>
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex-1 border-2 border-theme-strong py-3.5 rounded-xl font-bold text-theme-primary hover:bg-theme-secondary transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base transition-all hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Créer mon compte
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          {currentStep === 1 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-theme"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-theme-primary px-4 text-theme-tertiary font-medium">ou</span>
                </div>
              </div>

              {/* Social signup */}
              <button
                type="button"
                className="w-full border-2 border-theme-strong py-3.5 rounded-xl font-semibold text-theme-primary hover:bg-theme-secondary transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                S'inscrire avec Google
              </button>
            </>
          )}

          {/* Login link */}
          <p className="text-center mt-8 text-theme-secondary">
            Déjà un compte ?{" "}
            <Link 
              to="/login" 
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Se connecter
            </Link>
          </p>

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-theme-tertiary">
              <button 
                onClick={toggleTheme}
                className="hover:text-theme-primary transition-colors font-medium"
              >
                {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
              </button>
              <span>•</span>
              <span>© 2024 Rideshare</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}