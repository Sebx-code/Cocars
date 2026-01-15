// src/pages/landing.tsx
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Shield,
  DollarSign,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Menu,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { LandingProvider } from "../contexts/landingContext";
import { useLanding } from "../hooks/useLanding";

// Composant principal qui utilise le contexte
function LandingContent() {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    searchData,
    setSearchData,
    popularRoutes,
    benefits,
    testimonials,
    handleSearch,
    navigateToLogin,
    navigateToSignup,
    selectPopularRoute,
  } = useLanding();

  // Mapping des noms d'icônes vers les composants
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    DollarSign,
    Shield,
    MessageCircle,
    TrendingUp,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation minimaliste */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo épuré */}
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center shadow-lg hover-lift">
                <span className="text-yellow-400 font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">Rideshare</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 animate-fade-in animation-delay-200">
              <button className="text-gray-600 hover:text-black font-medium transition-all hover:scale-105">
                Rechercher
              </button>
              <button className="text-gray-600 hover:text-black font-medium transition-all hover:scale-105">
                Proposer
              </button>
              <button
                onClick={navigateToLogin}
                className="text-gray-600 hover:text-black font-medium transition-all hover:scale-105"
              >
                Connexion
              </button>
              <button
                onClick={navigateToSignup}
                className="bg-black hover:bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 shadow-md hover:shadow-xl"
              >
                Inscription
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-slide-in-bottom">
            <div className="px-6 py-6 space-y-3">
              <button className="block w-full text-left text-gray-600 hover:text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-all">
                Rechercher
              </button>
              <button className="block w-full text-left text-gray-600 hover:text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-all">
                Proposer
              </button>
              <button
                onClick={navigateToLogin}
                className="block w-full text-left text-gray-600 hover:text-black font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-all"
              >
                Connexion
              </button>
              <button
                onClick={navigateToSignup}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold shadow-md"
              >
                Inscription
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section Épuré */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient Background subtil */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-50 via-white to-yellow-50/30 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Badge animé */}
          <div className="flex justify-center mb-8 animate-bounce-smooth">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-5 py-2 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-900">
                1000+ trajets ce mois
              </span>
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center mb-16 animate-fade-in-scale">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Voyagez malin,
              <br />
              <span className="text-gradient-yellow">économisez plus</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Covoiturage simple et sécurisé partout au Cameroun
            </p>
          </div>

          {/* Search Form Épuré */}
          <div className="max-w-4xl mx-auto animate-slide-in-bottom animation-delay-300">
            <div className="glass-effect rounded-3xl p-8 shadow-xl-strong border-2 border-white/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Départ */}
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Départ
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rounded-full"></div>
                    <input
                      type="text"
                      placeholder="Yaoundé"
                      value={searchData.from}
                      onChange={(e) =>
                        setSearchData({ ...searchData, from: e.target.value })
                      }
                      className="w-full pl-9 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
                    <input
                      type="text"
                      placeholder="Douala"
                      value={searchData.to}
                      onChange={(e) =>
                        setSearchData({ ...searchData, to: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) =>
                        setSearchData({ ...searchData, date: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium text-gray-900"
                    />
                  </div>
                </div>

                {/* Passagers */}
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Places
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={searchData.passengers}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          passengers: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none font-medium text-gray-900"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ripple-effect"
              >
                <Search className="w-5 h-5" />
                Rechercher un trajet
              </button>
            </div>

            {/* Popular Routes - Épuré */}
            <div className="mt-10 text-center">
              <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                Trajets populaires
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularRoutes.slice(0, 4).map((route, i) => (
                  <button
                    key={i}
                    onClick={() => selectPopularRoute(route)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-yellow-400 hover:bg-yellow-50 transition-all text-sm font-medium text-gray-700 hover:text-gray-900 hover-lift"
                  >
                    {route.from} → {route.to}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Design Épuré */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-yellow-600 mb-3 uppercase tracking-wider">
              Pourquoi nous choisir
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple, rapide, sécurisé
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {benefits.map((benefit, i) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div
                  key={i}
                  className="group p-8 rounded-3xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-yellow-400 transition-all hover-lift"
                >
                  <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works - Minimaliste */}
      <section className="py-24 bg-linear-to-b from-gray-900 to-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wider">
              Comment ça marche
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              En 3 étapes simples
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-yellow-400/20 via-yellow-400 to-yellow-400/20"></div>

            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-10 text-center border border-gray-700 hover:border-yellow-400 transition-all hover-lift">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-8 group-hover:scale-110 transition-transform shadow-glow-yellow">
                  1
                </div>
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-800 transition-colors">
                  <Search className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Recherchez</h3>
                <p className="text-gray-400 leading-relaxed">
                  Trouvez votre trajet idéal en quelques clics
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-10 text-center border border-gray-700 hover:border-yellow-400 transition-all hover-lift">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-8 group-hover:scale-110 transition-transform shadow-glow-yellow">
                  2
                </div>
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-800 transition-colors">
                  <CheckCircle className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Réservez</h3>
                <p className="text-gray-400 leading-relaxed">
                  Confirmez votre place en toute sécurité
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-10 text-center border border-gray-700 hover:border-yellow-400 transition-all hover-lift">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-8 group-hover:scale-110 transition-transform shadow-glow-yellow">
                  3
                </div>
                <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-800 transition-colors">
                  <Zap className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Partez</h3>
                <p className="text-gray-400 leading-relaxed">
                  Profitez d'un voyage confortable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Élégant */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-yellow-600 mb-3 uppercase tracking-wider">
              Témoignages
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Ils voyagent avec nous
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-yellow-400 transition-all hover-lift shadow-sm hover:shadow-xl"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-5 h-5 ${
                        j < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-black font-bold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Clean */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-linear-to-br from-yellow-400/10 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
            Prêt à partir ?
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui voyagent malin
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSearch}
              className="group bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl inline-flex items-center justify-center gap-2 ripple-effect"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Trouver un trajet
            </button>
            <button
              onClick={navigateToSignup}
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/20 px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105"
            >
              Devenir conducteur
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Minimaliste */}
      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center">
                  <span className="text-black font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold">Rideshare</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Covoiturage simple et sécurisé
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">À propos</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Notre histoire
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Comment ça marche
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Centre d'aide
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Légal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    CGU
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Confidentialité
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 Rideshare. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <button className="hover:text-white transition-colors">Français</button>
              <span>•</span>
              <button className="hover:text-white transition-colors">English</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Composant wrapper avec le Provider
export default function CovoiturageLanding() {
  return (
    <LandingProvider>
      <LandingContent />
    </LandingProvider>
  );
}