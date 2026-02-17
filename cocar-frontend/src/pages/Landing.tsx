import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Car, Users, Shield, Star, MapPin, Calendar, Search,
  Sparkles, ArrowRight, Check, Award, Clock, DollarSign,
  Menu, X, ChevronDown, ChevronRight
} from 'lucide-react'

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchData, setSearchData] = useState({
    departure: '',
    destination: '',
    date: '',
    seats: 1
  })
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/search?from=${searchData.departure}&to=${searchData.destination}&date=${searchData.date}&seats=${searchData.seats}`)
  }

  const popularRoutes = [
    'Yaoundé → Douala',
    'Douala → Bafoussam',
    'Yaoundé → Kribi',
    'Douala → Limbé'
  ]

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Sécurisé',
      description: 'Système de vérification et notation des conducteurs'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Économique',
      description: 'Économisez jusqu\'à 60% sur vos trajets'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Flexible',
      description: 'Voyagez quand vous voulez, où vous voulez'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Crédibilité',
      description: 'Système de points pour conducteurs fiables'
    }
  ]

  const stats = [
    { value: '50K+', label: 'Utilisateurs' },
    { value: '100K+', label: 'Trajets' },
    { value: '4.8/5', label: 'Note moyenne' },
    { value: '98%', label: 'Satisfaction' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg border-b border-white/10 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Cocar</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/search" className="text-white/80 hover:text-white transition">
                Rechercher
              </Link>
              <Link to="/register" className="text-white/80 hover:text-white transition">
                Proposer
              </Link>
              <Link to="/login" className="text-white/80 hover:text-white transition">
                Connexion
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/50 transition"
              >
                Inscription
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <Link to="/search" className="text-white/80 hover:text-white transition">
                  Rechercher
                </Link>
                <Link to="/register" className="text-white/80 hover:text-white transition">
                  Proposer
                </Link>
                <Link to="/login" className="text-white/80 hover:text-white transition">
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-center"
                >
                  Inscription
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: 'perspective(500px) rotateX(60deg) scale(2)',
              transformOrigin: 'center top'
            }} />
          </div>
          
          {/* Floating Shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Isometric Cars Animation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Car className="w-64 h-64 text-emerald-400" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">1000+ trajets ce mois</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Voyagez malin,<br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                économisez plus
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Covoiturage simple et sécurisé partout au Cameroun
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Départ</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                      <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={searchData.departure}
                      onChange={(e) => setSearchData({...searchData, departure: e.target.value})}
                      placeholder="Yaoundé"
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Destination</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                    </div>
                    <input
                      type="text"
                      value={searchData.destination}
                      onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                      placeholder="Douala"
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Date</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                      <Calendar className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="date"
                      value={searchData.date}
                      onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Places</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-focus-within:bg-emerald-100 transition-colors">
                      <Users className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={searchData.seats}
                      onChange={(e) => setSearchData({...searchData, seats: parseInt(e.target.value)})}
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="group w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                <Search className="w-6 h-6" />
                Rechercher un trajet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Popular Routes */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30" />
                <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">Trajets Populaires</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/30" />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {popularRoutes.map((route, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const [from, to] = route.split(' → ')
                      setSearchData({...searchData, departure: from, destination: to})
                    }}
                    className="group px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-emerald-600 transition-all border border-white/30 hover:border-white hover:scale-105 hover:shadow-lg font-medium"
                  >
                    <span className="flex items-center gap-2">
                      {route}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="h-1 w-16 mx-auto bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-white/60 group-hover:text-white transition-colors font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">Nos Avantages</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi choisir <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Cocar</span> ?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              La meilleure plateforme de covoiturage au Cameroun
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent rounded-3xl transition-all duration-300" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </p>
                </div>
                
                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-3xl rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                               radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            }} />
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Icon Row */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform hover:scale-110 transition">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform hover:scale-110 transition" style={{ animationDelay: '0.1s' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform hover:scale-110 transition" style={{ animationDelay: '0.2s' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Prêt à démarrer votre <br className="hidden md:block" />
            <span className="relative inline-block">
              voyage ?
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-white/30 -skew-x-12" />
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Rejoignez des milliers d'utilisateurs qui voyagent malin et économisent plus chaque jour
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/register"
              className="group px-10 py-5 bg-white text-emerald-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-3"
            >
              Créer un compte gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/search"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all border-2 border-white inline-flex items-center justify-center gap-3"
            >
              <Search className="w-5 h-5" />
              Rechercher un trajet
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Inscription gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-950 border-t border-white/10 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(16,185,129,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(59,130,246,0.3) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">Cocar</span>
              </div>
              <p className="text-white/60 mb-6 leading-relaxed">
                Covoiturage simple et sécurisé partout au Cameroun. Voyagez malin, économisez plus.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-emerald-500 rounded-xl flex items-center justify-center transition group">
                  <Star className="w-5 h-5 text-white/60 group-hover:text-white transition" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-emerald-500 rounded-xl flex items-center justify-center transition group">
                  <Users className="w-5 h-5 text-white/60 group-hover:text-white transition" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 hover:bg-emerald-500 rounded-xl flex items-center justify-center transition group">
                  <Shield className="w-5 h-5 text-white/60 group-hover:text-white transition" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Entreprise</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  À propos
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Blog
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Carrières
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Presse
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Centre d'aide
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Sécurité
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Contact
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  FAQ
                </a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Légal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Conditions d'utilisation
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Confidentialité
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Cookies
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-emerald-400 transition flex items-center gap-2 group">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                  Mentions légales
                </a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/60 text-sm">
                &copy; 2024 Cocar. Tous droits réservés.
              </p>
              <div className="flex items-center gap-6 text-white/60 text-sm">
                <a href="#" className="hover:text-emerald-400 transition">Français</a>
                <span>•</span>
                <a href="#" className="hover:text-emerald-400 transition">English</a>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Certifié sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
