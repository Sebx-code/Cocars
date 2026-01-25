import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, MapPin, Calendar, Users, Shield, Leaf, Wallet, ArrowRight, Car, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  const navigate = useNavigate()
  const [searchForm, setSearchForm] = useState({
    departure: '',
    arrival: '',
    date: '',
    seats: '1',
  })

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const searchFormRef = useRef<HTMLFormElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const floatingCarsRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchForm.departure) params.set('departure', searchForm.departure)
    if (searchForm.arrival) params.set('arrival', searchForm.arrival)
    if (searchForm.date) params.set('date', searchForm.date)
    if (searchForm.seats) params.set('seats', searchForm.seats)
    navigate(`/search?${params.toString()}`)
  }

  const features = [
    { icon: Shield, title: 'Sécurisé', description: 'Profils vérifiés et paiements sécurisés', color: 'from-blue-400 to-cyan-500' },
    { icon: Wallet, title: 'Économique', description: 'Partagez les frais et économisez jusqu\'à 75%', color: 'from-emerald-400 to-teal-500' },
    { icon: Leaf, title: 'Écologique', description: 'Réduisez votre empreinte carbone', color: 'from-green-400 to-emerald-500' },
  ]

  const stats = [
    { value: 50000, suffix: '+', label: 'Utilisateurs actifs' },
    { value: 100000, suffix: '+', label: 'Trajets effectués' },
    { value: 200, suffix: 'T', label: 'CO₂ économisé' },
    { value: 4.8, suffix: '/5', label: 'Note moyenne', decimals: 1 },
  ]

  const steps = [
    { step: '1', title: 'Recherchez', description: 'Trouvez un trajet qui correspond à vos besoins', color: 'from-emerald-400 to-teal-500' },
    { step: '2', title: 'Réservez', description: 'Confirmez votre place en quelques clics', color: 'from-cyan-400 to-blue-500' },
    { step: '3', title: 'Voyagez', description: 'Profitez du trajet et partagez les frais', color: 'from-purple-400 to-pink-500' },
  ]

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      
      // Floating background elements
      if (floatingCarsRef.current) {
        gsap.to('.floating-element', {
          y: -20,
          duration: 2,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.3,
        })
      }

      // Title animation with split text effect
      if (titleRef.current) {
        heroTl.fromTo(titleRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1 }
        )
      }

      // Subtitle animation
      if (subtitleRef.current) {
        heroTl.fromTo(subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
      }

      // Search form animation
      if (searchFormRef.current) {
        heroTl.fromTo(searchFormRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 },
          '-=0.4'
        )
      }

      // Stats counter animation
      if (statsRef.current) {
        const statElements = statsRef.current.querySelectorAll('.stat-item')
        
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(statElements,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.7)' }
            )
            
            // Animate numbers
            statElements.forEach((el, i) => {
              const valueEl = el.querySelector('.stat-value')
              if (valueEl) {
                const target = stats[i].value
                const decimals = stats[i].decimals || 0
                const obj = { val: 0 }
                gsap.to(obj, {
                  val: target,
                  duration: 2,
                  ease: 'power2.out',
                  onUpdate: () => {
                    valueEl.textContent = obj.val.toFixed(decimals)
                  }
                })
              }
            })
          },
          once: true
        })
      }

      // Features animation
      if (featuresRef.current) {
        const featureCards = featuresRef.current.querySelectorAll('.feature-card')
        
        ScrollTrigger.create({
          trigger: featuresRef.current,
          start: 'top 75%',
          onEnter: () => {
            gsap.fromTo(featureCards,
              { opacity: 0, y: 60, rotateY: -15 },
              { 
                opacity: 1, 
                y: 0, 
                rotateY: 0,
                duration: 0.8, 
                stagger: 0.2,
                ease: 'back.out(1.4)'
              }
            )
          },
          once: true
        })
      }

      // Steps animation
      if (stepsRef.current) {
        const stepItems = stepsRef.current.querySelectorAll('.step-item')
        const connectors = stepsRef.current.querySelectorAll('.step-connector')
        
        ScrollTrigger.create({
          trigger: stepsRef.current,
          start: 'top 75%',
          onEnter: () => {
            gsap.fromTo(stepItems,
              { opacity: 0, scale: 0.5 },
              { 
                opacity: 1, 
                scale: 1, 
                duration: 0.6, 
                stagger: 0.3,
                ease: 'elastic.out(1, 0.5)'
              }
            )
            
            gsap.fromTo(connectors,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.5, stagger: 0.3, delay: 0.3 }
            )
          },
          once: true
        })
      }

      // CTA animation
      if (ctaRef.current) {
        ScrollTrigger.create({
          trigger: ctaRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(ctaRef.current,
              { opacity: 0, y: 50, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
            )
          },
          once: true
        })
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="bg-gray-100 dark:bg-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-white dark:bg-slate-800">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20" />
        
        {/* Floating Elements */}
        <div ref={floatingCarsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-10 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-500/10 rounded-full blur-xl" />
          <div className="floating-element absolute top-40 right-20 w-32 h-32 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-xl" />
          <div className="floating-element absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-200/30 dark:bg-cyan-500/10 rounded-full blur-xl" />
          <div className="floating-element absolute top-1/3 right-1/3 w-16 h-16 bg-emerald-300/20 dark:bg-emerald-400/10 rounded-full blur-lg" />
          
          {/* Floating car icons */}
          <Car className="floating-element absolute top-32 right-[15%] w-8 h-8 text-emerald-300/40 dark:text-emerald-500/20" />
          <Car className="floating-element absolute bottom-32 left-[20%] w-6 h-6 text-teal-300/40 dark:text-teal-500/20" />
          <Sparkles className="floating-element absolute top-1/4 left-[10%] w-6 h-6 text-cyan-300/50 dark:text-cyan-500/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight"
            >
              Voyagez ensemble,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">
                économisez
              </span>{' '}
              plus
            </h1>
            
            <p 
              ref={subtitleRef}
              className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              CoCar est la plateforme de covoiturage qui vous permet de partager vos trajets, 
              d'économiser de l'argent et de réduire votre empreinte carbone.
            </p>

            {/* Search Form */}
            <form 
              ref={searchFormRef}
              onSubmit={handleSearch} 
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 lg:p-8 max-w-4xl mx-auto border border-gray-100 dark:border-slate-700 hover:shadow-3xl transition-shadow duration-500"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
                    Départ
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={searchForm.departure}
                      onChange={(e) => setSearchForm({ ...searchForm, departure: e.target.value })}
                      placeholder="Ville de départ"
                      className="input pl-10 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
                    Arrivée
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={searchForm.arrival}
                      onChange={(e) => setSearchForm({ ...searchForm, arrival: e.target.value })}
                      placeholder="Ville d'arrivée"
                      className="input pl-10 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
                    Date
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="date"
                      value={searchForm.date}
                      onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                      className="input pl-10 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-left">
                    Passagers
                  </label>
                  <div className="relative group">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <select
                      value={searchForm.seats}
                      onChange={(e) => setSearchForm({ ...searchForm, seats: e.target.value })}
                      className="input pl-10 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'passager' : 'passagers'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button 
                    type="submit" 
                    className="btn-primary w-full group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Rechercher
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-gray-100 dark:text-slate-900"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-white dark:bg-slate-800 shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 mb-2">
                  <span className="stat-value">0</span>
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">CoCar</span> ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Découvrez les avantages du covoiturage avec notre plateforme moderne et sécurisée.
            </p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 dark:border-slate-700"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              En 3 étapes simples, commencez à voyager ensemble
            </p>
          </div>

          <div ref={stepsRef} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {steps.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="step-item text-center px-8">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${item.color} text-white text-3xl font-bold flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs">
                    {item.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-connector hidden md:block w-24 h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 rounded-full origin-left" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={ctaRef} className="rounded-3xl overflow-hidden relative shadow-2xl">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x" />
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative p-12 lg:p-20 text-center text-white">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Prêt à partager vos trajets ?
              </h2>
              <p className="text-white/90 mb-10 max-w-2xl mx-auto text-lg">
                Rejoignez des milliers d'utilisateurs qui économisent de l'argent et protègent l'environnement chaque jour.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="group inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  Créer un compte
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/search" 
                  className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1"
                >
                  Rechercher un trajet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
