// src/pages/login.tsx
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

type Step = 0 | 1;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from || "/user";

  const emailIsValid = useMemo(() => {
    if (!formData.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  }, [formData.email]);

  const canGoNext = step === 0 ? emailIsValid : true;

  const onNext = () => {
    if (!canGoNext) return;
    setError(null);
    setStep(1);
  };

  const onBack = () => {
    setError(null);
    setStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT: image / brand */}
        <div className="hidden lg:block lg:col-span-5 relative overflow-hidden bg-black">
          <div className="absolute inset-0 opacity-20 hero-pattern" />
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-400/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400/10 blur-3xl rounded-full" />
          </motion.div>

          <div className="relative h-full flex flex-col justify-between p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Link to="/" className="flex items-center gap-2 w-fit">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
                  <span className="text-black font-black text-xl">Rs</span>
                </div>
                <span className="text-white text-2xl font-extrabold tracking-tight">Rideshare</span>
              </Link>

              <h2 className="mt-10 text-4xl font-extrabold text-white leading-tight">
                Une connexion rapide.
                <br />
                Une expérience fluide.
              </h2>
              <p className="mt-4 text-white/70 text-lg max-w-md">
                Accédez à vos réservations, vos trajets et vos notifications, en toute sécurité.
              </p>

              <div className="mt-8 flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-sm">
                  Conducteurs vérifiés · Paiement après confirmation · Support réactif
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/50 text-sm"
            >
              © {new Date().getFullYear()} Rideshare
            </motion.div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div className="lg:col-span-7 relative overflow-hidden">
          {/* subtle bg */}
          <div className="absolute inset-0 hero-pattern" />
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 via-white to-white dark:from-yellow-400/10 dark:via-transparent dark:to-transparent" />

          <div className="relative min-h-screen flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md"
            >
              {/* Top brand for mobile */}
              <div className="lg:hidden mb-8">
                <Link to="/" className="flex items-center gap-2 w-fit">
                  <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center">
                    <span className="text-yellow-400 font-black text-xl">Rs</span>
                  </div>
                  <span className="text-xl font-extrabold text-theme-primary">Rideshare</span>
                </Link>
              </div>

              <div className="card-professional shadow-professional-xl p-8 sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-theme-primary">Connexion</h1>
                    <p className="mt-2 text-theme-secondary">
                      {step === 0 ? "Entrez votre email" : "Entrez votre mot de passe"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-10 rounded-full ${step >= 0 ? "bg-yellow-400" : "bg-gray-200"}`} />
                    <div className={`h-2 w-10 rounded-full ${step >= 1 ? "bg-yellow-400" : "bg-gray-200"}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="mt-6">
                  <AnimatePresence mode="wait" initial={false}>
                    {step === 0 ? (
                      <motion.div
                        key="step-email"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-theme-primary mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                            <input
                              type="email"
                              autoFocus
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="votre@email.com"
                              className="input-professional w-full pl-12"
                              required
                            />
                          </div>
                          <p className="mt-2 text-xs text-theme-tertiary">
                            Astuce: utilisez le même email que lors de votre inscription.
                          </p>
                        </div>

                        <motion.button
                          type="button"
                          onClick={onNext}
                          whileHover={{ scale: canGoNext ? 1.02 : 1 }}
                          whileTap={{ scale: canGoNext ? 0.98 : 1 }}
                          disabled={!canGoNext}
                          className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-professional flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          Continuer
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>

                        <p className="text-center text-sm text-theme-secondary">
                          Pas de compte ?{" "}
                          <Link to="/signup" className="font-bold text-theme-primary hover:text-yellow-600">
                            S'inscrire
                          </Link>
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step-password"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-theme-primary mb-2">Mot de passe</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                            <input
                              type={showPassword ? "text" : "password"}
                              autoFocus
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="••••••••"
                              className="input-professional w-full pl-12 pr-12"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-secondary"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                            />
                            <span className="text-sm text-theme-secondary">Se souvenir de moi</span>
                          </label>
                          <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-yellow-600 hover:text-yellow-700"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            type="button"
                            onClick={onBack}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full border border-theme py-4 rounded-xl font-bold text-theme-secondary hover:bg-theme-tertiary flex items-center justify-center gap-2"
                          >
                            <ArrowLeft className="w-5 h-5" />
                            Retour
                          </motion.button>

                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="w-full bg-black hover:bg-neutral-900 text-white py-4 rounded-xl font-bold text-lg shadow-professional flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Connexion"}
                          </motion.button>
                        </div>

                        <p className="text-center text-xs text-theme-tertiary">
                          En vous connectant, vous acceptez nos{" "}
                          <Link to="/terms" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                            conditions
                          </Link>
                          .
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Small help text */}
              <p className="text-center mt-5 text-xs text-theme-tertiary">
                Conseil: sur mobile, passez en mode paysage pour voir le visuel.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
