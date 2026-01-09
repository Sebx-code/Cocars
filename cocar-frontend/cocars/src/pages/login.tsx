// taxiYa-main/src/pages/login.tsx
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData.email, formData.password);
      
      // Redirection selon le rôle sera gérée par ProtectedRoute
      navigate('/user'); // Par défaut, on redirige vers /user
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
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

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Voyagez Malin.
                <br />
                Réservez Rapide.
                <br />
                Arrivez Serein.
              </h2>
              <p className="text-slate-300 text-lg max-w-md">
                Gérez vos courses, suivez vos trajets et profitez d'un service
                premium depuis votre espace personnel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-slate-900"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-slate-900"></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-slate-900"></div>
            </div>
            <p className="text-sm text-slate-400 ml-2">
              Rejoignez <span className="text-white font-semibold">5000+</span>{" "}
              utilisateurs satisfaits
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">T</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">TaxiYa</h1>
          </div>

          <div className="text-center space-y-3">
            <div className="inline-block mb-4 p-3 bg-amber-100 rounded-full">
              <span className="text-4xl">👋</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900">Bon retour !</h2>
            <p className="text-slate-600">
              Connectez-vous pour accéder à votre espace personnel et vos courses
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-pulse">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Erreur</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email ou Téléphone
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="votre@email.com ou +237 6XX XX XX XX"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-900"
                  required
                />
              </div>
            </div>

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
                  placeholder="Entrez votre mot de passe"
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
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) =>
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-2 focus:ring-amber-200"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  Se souvenir de moi
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Connexion en cours...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>

            <p className="text-center text-slate-600">
              Pas encore de compte ?{" "}
              <Link
                to="/signup"
                className="text-amber-600 hover:text-amber-700 font-bold transition-colors hover:underline"
              >
                Inscrivez-vous ici
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}