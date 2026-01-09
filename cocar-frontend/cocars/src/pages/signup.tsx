import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.passwordConfirm,
        role: "user",
      });
      navigate("/user");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo & Back Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">T</span>
              </div>
              <h1 className="text-2xl font-bold">TaxiYa</h1>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Retour au site</span>
            </Link>
          </div>

          {/* Main Message */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Commencez
                <br />
                Votre Voyage
                <br />
                Avec Nous.
              </h2>
              <p className="text-slate-300 text-lg max-w-md">
                Créez votre compte en quelques secondes et accédez à un service
                de taxi premium disponible 24/7.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-slate-300">
                  Inscription rapide et sécurisée
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-slate-300">
                  Réservation en quelques clics
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-slate-300">
                  Service client disponible 24/7
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 border-2 border-slate-900"></div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 border-2 border-slate-900"></div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-amber-600 border-2 border-slate-900"></div>
            </div>
            <p className="text-sm text-slate-400 ml-2">
              Rejoignez <span className="text-white font-semibold">5000+</span>{" "}
              utilisateurs satisfaits
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">T</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">TaxiYa</h1>
          </div>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-block mb-4 p-3 bg-amber-100 rounded-full">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Créer un compte</h2>
            <p className="text-slate-600">
              Rejoignez TaxiYa et profitez d'un service premium disponible 24/7
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Erreur</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Jean Dupont"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+237 6 XX XX XX XX"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Créez un mot de passe sécurisé"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Minimum 8 caractères avec lettres et chiffres
              </p>
            </div>

            {/* Password confirmation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Confirmation du mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.passwordConfirm}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordConfirm: e.target.value })
                  }
                  placeholder="Confirmez votre mot de passe"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
                className="w-4 h-4 mt-1 rounded border-slate-300 text-amber-500 focus:ring-2 focus:ring-amber-200"
              />
              <label className="text-sm text-slate-600">
                J'accepte les{" "}
                <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">
                  conditions d'utilisation
                </a>{" "}
                et la{" "}
                <a href="#" className="text-amber-600 hover:text-amber-700 font-medium">
                  politique de confidentialité
                </a>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Création du compte...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">
                  Ou s'inscrire avec
                </span>
              </div>
            </div>

            {/* Social Signup */}
            <button className="w-full flex items-center justify-center gap-3 py-3.5 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-300 hover:border-slate-400 group shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77 h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                Continuer avec Google
              </span>
            </button>

            {/* Login Link */}
            <p className="text-center text-slate-600">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-amber-600 hover:text-amber-700 font-bold transition-colors hover:underline"
              >
                Connectez-vous ici
              </Link>
            </p>

            {/* Info Card */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs text-emerald-700 font-semibold mb-2">✓ Nous sommes sécurisés</p>
              <p className="text-xs text-emerald-600">
                Vos données sont chiffrées et protégées par TaxiYa. Pas de spams garantis.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

