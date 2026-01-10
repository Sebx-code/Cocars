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
  Heart,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { LandingProvider, useLanding } from "../contexts/landingContext";

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
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold text-gray-900">CoCars</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <button className="text-gray-700 hover:text-black font-medium transition-colors">
                  Rechercher
                </button>
                <button className="text-gray-700 hover:text-black font-medium transition-colors">
                  Proposer un trajet
                </button>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={navigateToLogin}
                className="text-gray-700 hover:text-black font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Connexion
              </button>
              <button
                onClick={navigateToSignup}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105"
              >
                Inscription
              </button>
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
            <button className="block w-full text-left text-gray-700 hover:text-black font-medium py-2">
              Rechercher
            </button>
            <button className="block w-full text-left text-gray-700 hover:text-black font-medium py-2">
              Proposer un trajet
            </button>
            <button
              onClick={navigateToLogin}
              className="w-full text-left text-gray-700 hover:text-black font-medium py-2"
            >
              Connexion
            </button>
            <button
              onClick={navigateToSignup}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold"
            >
              Inscription
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mb-6">
              <span className="text-2xl">🚗</span>
              <span className="text-sm font-semibold text-gray-900">
                15 000+ trajets ce mois
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Votre trajet à partir de{" "}
              <span className="text-yellow-400">2 500 FCFA</span>
            </h1>
            <p className="text-xl text-gray-600">
              Réservez un trajet en covoiturage partout au Cameroun
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* From */}
                <div className="lg:col-span-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Départ
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-black rounded-full"></div>
                    <input
                      type="text"
                      placeholder="Yaoundé"
                      value={searchData.from}
                      onChange={(e) =>
                        setSearchData({ ...searchData, from: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* To */}
                <div className="lg:col-span-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                    <input
                      type="text"
                      placeholder="Douala"
                      value={searchData.to}
                      onChange={(e) =>
                        setSearchData({ ...searchData, to: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) =>
                        setSearchData({ ...searchData, date: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Passagers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={searchData.passengers}
                      onChange={(e) =>
                        setSearchData({
                          ...searchData,
                          passengers: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white font-medium"
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
                className="w-full mt-6 bg-black hover:bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Rechercher
              </button>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="max-w-5xl mx-auto mt-12">
            <h3 className="text-center text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              Trajets populaires
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {popularRoutes.map((route, i) => (
                <button
                  key={i}
                  onClick={() => selectPopularRoute(route)}
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-black hover:bg-black hover:text-white transition-all text-sm font-semibold"
                >
                  {route.from} → {route.to}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir CoCars ?
            </h2>
            <p className="text-lg text-gray-600">
              La solution de covoiturage la plus fiable au Cameroun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`w-14 h-14 ${benefit.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-400">
              Réservez votre trajet en 3 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-8 text-center border-2 border-gray-800 hover:border-yellow-400 transition-all">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Recherchez</h3>
                <p className="text-gray-400">
                  Indiquez votre destination et choisissez parmi les
                  conducteurs disponibles
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-8 text-center border-2 border-gray-800 hover:border-yellow-400 transition-all">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Réservez</h3>
                <p className="text-gray-400">
                  Consultez les profils, lisez les avis et réservez en quelques
                  clics
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-8 text-center border-2 border-gray-800 hover:border-yellow-400 transition-all">
                <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Voyagez</h3>
                <p className="text-gray-400">
                  Rencontrez votre conducteur au point de rendez-vous et
                  profitez du trajet
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 50 000 utilisateurs satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-3xl p-8 border-2 border-gray-200 hover:border-black transition-all hover:shadow-xl"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.city}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star
                          key={j}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 mb-4 text-lg leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="text-sm text-gray-500 font-semibold">
                  {testimonial.trips} trajets effectués
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Prêt à partir ?
          </h2>
          <p className="text-xl text-gray-900 mb-10 max-w-2xl mx-auto font-medium">
            Rejoignez des milliers d'utilisateurs qui économisent chaque jour
            avec CoCars
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSearch}
              className="bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-900 transition-all hover:scale-105 shadow-xl inline-flex items-center justify-center gap-2"
            >
              Rechercher un trajet
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={navigateToSignup}
              className="bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
            >
              Proposer un trajet
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold">CoCars</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme de covoiturage n°1 au Cameroun
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">À propos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button className="hover:text-white transition-colors">
                    Qui sommes-nous
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Comment ça marche
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Blog
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button className="hover:text-white transition-colors">
                    Centre d'aide
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Nous contacter
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Signaler un problème
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button className="hover:text-white transition-colors">
                    CGU
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Confidentialité
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-colors">
                    Cookies
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 CoCars. Tous droits réservés.</p>
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