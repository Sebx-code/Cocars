// src/pages/signup.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

type Step = 0 | 1;

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState<Step>(0);
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

  const emailIsValid = useMemo(() => {
    if (!formData.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  }, [formData.email]);

  const step0Valid = useMemo(() => {
    return formData.name.trim().length >= 2 && emailIsValid;
  }, [formData.name, emailIsValid]);

  const strength = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  }, [formData.password]);

  const strengthLabels = ["", "Faible", "Moyen", "Bon", "Fort"];

  const onNext = () => {
    if (!step0Valid) return;
    setError(null);
    setStep(1);
  };

  const onBack = () => {
    setError(null);
    setStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

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
        phone: formData.phone || undefined,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      navigate("/user", { replace: true });
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT: image / story */}
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
                Créez votre compte.
                <br />
                Voyagez autrement.
              </h2>
              <p className="mt-4 text-white/70 text-lg max-w-md">
                Des trajets plus simples, des profils plus fiables, une interface plus moderne.
              </p>

              <div className="mt-8 flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-sm">Vérification · Avis · Sécurité</p>
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
          <div className="absolute inset-0 hero-pattern" />
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 via-white to-white dark:from-yellow-400/10 dark:via-transparent dark:to-transparent" />

          <div className="relative min-h-screen flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg"
            >
              {/* mobile brand */}
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
                    <h1 className="text-3xl font-extrabold text-theme-primary">Inscription</h1>
                    <p className="mt-2 text-theme-secondary">
                      {step === 0 ? "Vos informations" : "Sécurité du compte"}
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
                        key="step-info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-theme-primary mb-2">Nom complet</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                            <input
                              type="text"
                              autoFocus
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Jean Kamga"
                              className="input-professional w-full pl-12"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-theme-primary mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="votre@email.com"
                              className="input-professional w-full pl-12"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-theme-primary mb-2">Téléphone (optionnel)</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="699 123 456"
                              className="input-professional w-full pl-12"
                            />
                          </div>
                        </div>

                        <motion.button
                          type="button"
                          onClick={onNext}
                          whileHover={{ scale: step0Valid ? 1.02 : 1 }}
                          whileTap={{ scale: step0Valid ? 0.98 : 1 }}
                          disabled={!step0Valid}
                          className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-professional flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          Continuer
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>

                        <p className="text-center text-sm text-theme-secondary">
                          Déjà un compte ?{" "}
                          <Link to="/login" className="font-bold text-theme-primary hover:text-yellow-600">
                            Se connecter
                          </Link>
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step-security"
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
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-secondary"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide">Sécurité</span>
                              <span className="text-xs font-bold text-theme-secondary">{strengthLabels[strength]}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                              {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                  key={i}
                                  layout
                                  className={`h-2 rounded-full ${
                                    i <= strength
                                      ? strength <= 1
                                        ? "bg-red-500"
                                        : strength === 2
                                          ? "bg-orange-500"
                                          : strength === 3
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-theme-primary mb-2">Confirmer</label>
                          <div className="relative">
                            <Check className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                            <input
                              type="password"
                              value={formData.password_confirmation}
                              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                              placeholder="••••••••"
                              className="input-professional w-full pl-12"
                              required
                              minLength={8}
                            />
                          </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="w-4 h-4 mt-1 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                          />
                          <span className="text-sm text-theme-secondary">
                            J'accepte les{" "}
                            <Link to="/terms" className="font-semibold text-yellow-600 hover:text-yellow-700">
                              conditions d'utilisation
                            </Link>
                            .
                          </span>
                        </label>

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
                            className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-professional flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer"}
                          </motion.button>
                        </div>

                        <p className="text-center text-xs text-theme-tertiary">
                          Votre compte sera prêt en quelques secondes.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
