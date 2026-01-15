// src/pages/landing.tsx
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  MapPin,
  Search,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LandingProvider } from "../contexts/landingContext";
import { useLanding } from "../hooks/useLanding";
import { useAuth } from "../hooks/useAuth";
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
  BlurIn,
  Floating,
  HoverScale,
  StaggerContainer,
  StaggerItem,
  motion,
} from "../components/animations";

function LandingContent() {
  const {
    searchData,
    setSearchData,
    popularRoutes,
    benefits,
    testimonials,
    handleSearch,
    navigateToLogin,
    navigateToSignup,
    navigateToUserDashboard,
    selectPopularRoute,
  } = useLanding();

  const { isAuthenticated, user } = useAuth();

  const stats = [
    { label: "Utilisateurs", value: "5 000+" },
    { label: "Trajets / mois", value: "1 000+" },
    { label: "Note moyenne", value: "4.8/5" },
  ];

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 via-white to-white dark:from-yellow-400/10 dark:via-transparent dark:to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400/10 blur-3xl rounded-full" />

        {/* Spotlight animé (capte l'attention dès les premières secondes) */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[450px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(250,204,21,0.22), rgba(250,204,21,0.10), transparent)",
            filter: "blur(12px)",
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left */}
            <div className="lg:col-span-6">
              <BlurIn>
                <div className="inline-flex items-center gap-2 badge badge-yellow mb-6">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Plateforme #1 du covoiturage au Cameroun
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-theme-primary leading-tight">
                  <AnimatedText
                    text="Voyagez plus malin,"
                    className="inline"
                  />
                  <br />
                  <span className="gradient-text">payez moins.</span>
                </h1>

                <p className="mt-6 text-lg text-theme-secondary leading-relaxed max-w-xl">
                  Réservez un trajet fiable, trouvez des conducteurs vérifiés, et profitez d’une expérience simple et professionnelle.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <HoverScale>
                    <button
                      onClick={handleSearch}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      Rechercher un trajet
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </HoverScale>

                  {isAuthenticated ? (
                    <HoverScale>
                      <button
                        onClick={navigateToUserDashboard}
                        className="btn-secondary flex items-center justify-center gap-2"
                      >
                        Continuer ({user?.name?.split(" ")[0] || "Mon compte"})
                      </button>
                    </HoverScale>
                  ) : (
                    <HoverScale>
                      <button
                        onClick={navigateToSignup}
                        className="btn-secondary flex items-center justify-center gap-2"
                      >
                        Créer un compte
                      </button>
                    </HoverScale>
                  )}
                </div>

                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-5 text-sm text-theme-tertiary"
                  >
                    Vous pouvez explorer les trajets, mais la réservation nécessite une connexion.
                    <button
                      onClick={navigateToLogin}
                      className="ml-2 font-semibold text-yellow-700 hover:text-yellow-800"
                    >
                      Se connecter
                    </button>
                  </motion.div>
                )}

                <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
                  {stats.map((s) => (
                    <div key={s.label} className="card-professional px-4 py-4 text-center">
                      <div className="text-xl font-bold text-theme-primary">{s.value}</div>
                      <div className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </BlurIn>
            </div>

            {/* Right */}
            <div className="lg:col-span-6">
              <Floating amplitude={10} duration={4}>
                <div className="card-professional shadow-professional-xl p-6 sm:p-8 relative noise-overlay">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-theme-primary">Trouver un trajet</h2>
                      <p className="text-sm text-theme-tertiary">
                        Remplissez les infos et lancez la recherche.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                      <Search className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-theme-primary mb-2">Départ</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black dark:bg-yellow-400 rounded-full" />
                        <input
                          type="text"
                          placeholder="Yaoundé"
                          value={searchData.from}
                          onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                          className="input-professional w-full pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-theme-primary mb-2">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                        <input
                          type="text"
                          placeholder="Douala"
                          value={searchData.to}
                          onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                          className="input-professional w-full pl-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-theme-primary mb-2">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                        <input
                          type="date"
                          value={searchData.date}
                          onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                          className="input-professional w-full pl-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-theme-primary mb-2">Passagers</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                        <select
                          value={searchData.passengers}
                          onChange={(e) => setSearchData({ ...searchData, passengers: e.target.value })}
                          className="input-professional w-full pl-12 appearance-none"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4+</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <HoverScale className="mt-6">
                    <button
                      onClick={handleSearch}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      Rechercher
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </HoverScale>

                  {/* Popular routes */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-theme-tertiary uppercase tracking-wide">
                        Trajets populaires
                      </p>
                      <button
                        onClick={navigateToLogin}
                        className="text-xs font-semibold text-yellow-600 hover:text-yellow-700"
                      >
                        Se connecter
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {popularRoutes.slice(0, 6).map((route, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectPopularRoute(route)}
                          className="px-4 py-2 rounded-full border border-theme text-sm font-semibold text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary"
                        >
                          {route.from} → {route.to}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </Floating>
            </div>
          </div>
        </motion.div>
      </section>

      {/* BENEFITS */}
      <AnimatedSection className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-theme-primary">
              Pourquoi choisir <span className="gradient-text">Rideshare</span> ?
            </h2>
            <p className="mt-3 text-lg text-theme-secondary">
              Une expérience moderne, fiable et agréable.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <StaggerItem key={i}>
                <AnimatedCard
                  hoverEffect="lift"
                  className="card-professional p-6 h-full"
                >
                  <div className={`w-14 h-14 ${benefit.color} rounded-xl flex items-center justify-center mb-5`}>
                    {/* icons based on string in context */}
                    {benefit.icon === "Shield" ? (
                      <Shield className="w-7 h-7" />
                    ) : benefit.icon === "DollarSign" ? (
                      <span className="text-2xl font-black">₣</span>
                    ) : benefit.icon === "MessageCircle" ? (
                      <span className="text-2xl font-black">✉</span>
                    ) : (
                      <span className="text-2xl font-black">↗</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-theme-primary mb-2">{benefit.title}</h3>
                  <p className="text-theme-secondary leading-relaxed">{benefit.description}</p>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 hero-pattern" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400/10 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold">Comment ça marche ?</h2>
            <p className="mt-4 text-lg text-gray-300">Réservez votre trajet en 3 étapes.</p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Recherchez",
                desc: "Indiquez départ/destination et comparez les trajets disponibles.",
                icon: <Search className="w-7 h-7 text-yellow-400" />,
              },
              {
                step: "2",
                title: "Réservez",
                desc: "Consultez les profils, lisez les avis et réservez en quelques clics.",
                icon: <CheckCircle className="w-7 h-7 text-yellow-400" />,
              },
              {
                step: "3",
                title: "Voyagez",
                desc: "Rencontrez votre conducteur au point de rendez-vous et partez sereinement.",
                icon: <Shield className="w-7 h-7 text-yellow-400" />,
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-black font-extrabold flex items-center justify-center">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-gray-300 leading-relaxed">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <AnimatedSection className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-theme-primary">
              Ils nous font confiance
            </h2>
            <p className="mt-4 text-lg text-theme-secondary">Une communauté active et satisfaite.</p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <AnimatedCard hoverEffect="glow" className="card-professional p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-professional">
                      <span className="text-black font-extrabold">{t.avatar}</span>
                    </div>
                    <div>
                      <div className="font-bold text-theme-primary">{t.name}</div>
                      <div className="text-sm text-theme-tertiary">{t.city}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-theme-secondary leading-relaxed">“{t.comment}”</p>
                  <div className="mt-5 text-xs font-semibold text-theme-tertiary uppercase tracking-wide">
                    {t.trips} trajets effectués
                  </div>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 hero-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold">Prêt à partir ?</h2>
            <p className="mt-5 text-lg font-medium text-black/80">
              Rejoignez une communauté qui économise chaque jour avec une expérience fluide et moderne.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <HoverScale>
                <button
                  onClick={navigateToSignup}
                  className="bg-black text-white rounded-xl px-6 py-4 font-bold shadow-professional-lg flex items-center justify-center gap-2"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5" />
                </button>
              </HoverScale>
              <HoverScale>
                <Link
                  to="/trips"
                  className="bg-white/70 hover:bg-white rounded-xl px-6 py-4 font-bold border border-black/10 flex items-center justify-center"
                >
                  Voir les trajets
                </Link>
              </HoverScale>
            </div>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="py-10 text-center text-sm text-theme-tertiary">
        <p>
          En continuant, vous acceptez nos conditions. <Link to="/terms" className="text-yellow-600 hover:text-yellow-700 font-semibold">Voir les CGU</Link>.
        </p>
      </div>
    </div>
  );
}

export default function CovoiturageLanding() {
  return (
    <LandingProvider>
      <LandingContent />
    </LandingProvider>
  );
}
