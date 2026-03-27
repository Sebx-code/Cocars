import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Calendar, Users, ArrowRight,
  ChevronDown, Star, Shield, Leaf, Lock,
  CheckCircle, TrendingUp, Car,
} from 'lucide-react'

/* ─── Only non-Tailwind things: custom font import + 3 animation keyframes ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;600;800&family=DM+Sans:wght@300;400;500&display=swap');
  .font-sora { font-family: 'Sora', sans-serif; }
  .font-dm   { font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
  @keyframes floatY  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
  @keyframes ticker  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
  .anim-up-1 { animation: fadeUp .65s ease .1s  both }
  .anim-up-2 { animation: fadeUp .65s ease .22s both }
  .anim-up-3 { animation: fadeUp .65s ease .36s both }
  .anim-up-4 { animation: fadeUp .65s ease .50s both }
  .anim-float{ animation: floatY 3.5s ease-in-out infinite }
  .ticker-track { display:inline-flex; gap:3rem; animation:ticker 26s linear infinite; white-space:nowrap }
  .ticker-track:hover { animation-play-state:paused }
  .outline-text { -webkit-text-stroke: 1px rgba(255,255,255,.45); color:transparent }
`

/* ─── Types ─── */
interface SearchForm { departure: string; arrival: string; date: string; seats: string }

export default function Landing() {
  const navigate = useNavigate()
  const statsRef = useRef<HTMLDivElement>(null)

  const [scrolled,         setScrolled]         = useState(false)
  const [statsVisible,     setStatsVisible]     = useState(false)
  const [counters,         setCounters]         = useState({ users: 0, trips: 0, co2: 0, rating: 0 })
  const [activeTestimonial,setActiveTestimonial]= useState(0)
  const [form, setForm] = useState<SearchForm>({ departure:'', arrival:'', date:'', seats:'1' })

  /* Scroll → darken navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Stats counter animation on scroll-enter */
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || statsVisible) return
      setStatsVisible(true)
      const STEPS = 60, DURATION = 1800
      let step = 0
      const timer = setInterval(() => {
        step++
        const p = 1 - Math.pow(1 - step / STEPS, 3)
        setCounters({
          users:  Math.floor(50000 * p),
          trips:  Math.floor(100000 * p),
          co2:    Math.floor(200 * p),
          rating: parseFloat((4.8 * p).toFixed(1)),
        })
        if (step >= STEPS) clearInterval(timer)
      }, DURATION / STEPS)
    }, { threshold: 0.3 })
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [statsVisible])

  /* Auto-rotate testimonials */
  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % 3), 5000)
    return () => clearInterval(id)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (form.departure) params.set('departure', form.departure)
    if (form.arrival)   params.set('arrival',   form.arrival)
    if (form.date)      params.set('date',       form.date)
    if (form.seats)     params.set('seats',      form.seats)
    navigate(`/search?${params.toString()}`)
  }

  /* ─── Data ─── */
  const ROUTES = [
    { from:'Douala',  to:'Yaoundé',    price:'4 000',  dur:'3h',    freq:'24 / jour' },
    { from:'Yaoundé', to:'Bafoussam',  price:'5 000',  dur:'4h',    freq:'12 / jour' },
    { from:'Douala',  to:'Limbe',      price:'2 000',  dur:'1h30',  freq:'18 / jour' },
    { from:'Douala',  to:'Buea',       price:'3 000',  dur:'2h',    freq:'15 / jour' },
    { from:'Yaoundé', to:'Bertoua',    price:'8 000',  dur:'6h',    freq:'8 / jour'  },
    { from:'Douala',  to:'Kribi',      price:'4 500',  dur:'3h',    freq:'10 / jour' },
  ]

  const TESTIMONIALS = [
    { name:'Amadou K.',    city:'Douala',    trips:12, text:'CoCar m\'a permis d\'économiser plus de 30 000 FCFA ce mois. Le système de paiement sécurisé est vraiment rassurant.' },
    { name:'Fatima N.',    city:'Yaoundé',   trips:28, text:'J\'utilise CoCar chaque semaine pour mes trajets professionnels. Les conducteurs sont toujours ponctuels et courtois.' },
    { name:'Jean-Paul M.', city:'Bafoussam', trips:45, text:'Grâce à CoCar je partage mes frais d\'essence et rencontre des gens formidables. Une belle communauté camerounaise.' },
  ]

  const TRUST = [
    { icon:<Shield      size={20}/>, title:'Profils vérifiés',  desc:'Permis et pièce d\'identité vérifiés pour chaque conducteur.' },
    { icon:<Lock        size={20}/>, title:'Paiement sécurisé', desc:'Argent en escrow, libéré uniquement à la confirmation du voyage.' },
    { icon:<Star        size={20}/>, title:'Avis authentiques', desc:'Conducteurs et passagers se notent mutuellement après chaque trajet.' },
    { icon:<Leaf        size={20}/>, title:'Impact écologique', desc:'Chaque covoiturage réduit les émissions de CO₂. Voyagez responsable.' },
    { icon:<CheckCircle size={20}/>, title:'Support 7j/7',      desc:'Une équipe disponible pour vous aider à tout moment.' },
    { icon:<TrendingUp  size={20}/>, title:'Prix transparents', desc:'Aucun frais caché. Vous voyez le prix total avant de confirmer.' },
  ]

  const TICKER = ['Douala → Yaoundé','Yaoundé → Bafoussam','Douala → Limbe','Douala → Kribi','Bafoussam → Douala','Yaoundé → Bertoua','Limbe → Douala','Kribi → Yaoundé']

  /* ─── Render ─── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="font-dm bg-neutral-950 text-white min-h-screen overflow-x-hidden">

        {/* ════════════════ NAVBAR ════════════════ */}
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          scrolled ? 'bg-neutral-950/90 backdrop-blur-xl border-white/10' : 'bg-transparent border-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">

            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="font-sora font-black text-neutral-950 text-base leading-none">C</span>
              </div>
              <span className="font-sora font-bold text-white text-lg tracking-tight">CoCar</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[['Trajets','/feed'],['Rechercher','/search']].map(([label,href])=>(
                <Link key={href} to={href} className="text-white/55 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors no-underline">
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:block text-white/55 hover:text-white text-sm font-medium px-4 py-2 transition-colors no-underline">
                Connexion
              </Link>
              <Link to="/register" className="bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-semibold px-5 py-2 rounded-full transition-colors no-underline shadow-sm">
                S'inscrire
              </Link>
            </div>
          </div>
        </nav>

        {/* ════════════════ HERO ════════════════ */}
        <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-24 px-6 lg:px-10">

          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-white/[0.035] blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto w-full">

            {/* Badge */}
            <div className="anim-up-1 mb-8">
              <span className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/65 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                50 000+ utilisateurs actifs au Cameroun
              </span>
            </div>

            {/* Headline */}
            <h1 className="anim-up-2 font-sora font-extrabold leading-[.94] tracking-[-0.04em] text-[clamp(48px,9vw,100px)] mb-8 max-w-4xl">
              Voyagez malin,{' '}
              <span className="outline-text">partagez.</span>
            </h1>

            <p className="anim-up-3 text-white/40 text-lg leading-relaxed font-light max-w-lg mb-14">
              La plateforme de covoiturage qui connecte conducteurs et passagers au Cameroun. Paiements sécurisés, trajets vérifiés.
            </p>

            {/* ── Search card ── */}
            <div className="anim-up-4 max-w-4xl">
              <form onSubmit={handleSearch}
                className="bg-white rounded-2xl p-2 flex flex-col md:flex-row shadow-[0_32px_80px_rgba(0,0,0,.55)]">

                {/* Departure */}
                <div className="flex-1 px-5 py-3 border-b border-neutral-200 md:border-b-0 md:border-r">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-[.15em] mb-1">Départ</label>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-neutral-400 flex-shrink-0" />
                    <input type="text" placeholder="Ex: Douala"
                      value={form.departure}
                      onChange={e => setForm(f=>({...f, departure:e.target.value}))}
                      className="w-full bg-transparent text-neutral-900 text-sm font-medium placeholder:text-neutral-400 outline-none"
                    />
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 px-5 py-3 border-b border-neutral-200 md:border-b-0 md:border-r">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-[.15em] mb-1">Arrivée</label>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-neutral-400 flex-shrink-0" />
                    <input type="text" placeholder="Ex: Yaoundé"
                      value={form.arrival}
                      onChange={e => setForm(f=>({...f, arrival:e.target.value}))}
                      className="w-full bg-transparent text-neutral-900 text-sm font-medium placeholder:text-neutral-400 outline-none"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="flex-1 px-5 py-3 border-b border-neutral-200 md:border-b-0 md:border-r">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-[.15em] mb-1">Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-neutral-400 flex-shrink-0" />
                    <input type="date"
                      value={form.date}
                      onChange={e => setForm(f=>({...f, date:e.target.value}))}
                      className="w-full bg-transparent text-neutral-900 text-sm font-medium outline-none"
                    />
                  </div>
                </div>

                {/* Seats */}
                <div className="px-5 py-3 border-b border-neutral-200 md:border-b-0 md:border-r min-w-[140px]">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-[.15em] mb-1">Passagers</label>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-neutral-400 flex-shrink-0" />
                    <select value={form.seats} onChange={e => setForm(f=>({...f, seats:e.target.value}))}
                      className="w-full bg-transparent text-neutral-900 text-sm font-medium outline-none cursor-pointer">
                      {[1,2,3,4].map(n=><option key={n} value={n}>{n} passager{n>1?'s':''}</option>)}
                    </select>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-1.5 flex-shrink-0">
                  <button type="submit"
                    className="w-full md:w-auto h-full bg-neutral-950 hover:bg-neutral-800 active:scale-95 text-white text-sm font-semibold px-7 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                    <Search size={14}/> Rechercher
                  </button>
                </div>
              </form>

              {/* Quick-pick chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-white/30 text-xs">Populaires :</span>
                {['Douala → Yaoundé','Yaoundé → Bafoussam','Douala → Limbe'].map(r => {
                  const [dep,arr] = r.split(' → ')
                  return (
                    <button key={r}
                      onClick={()=>setForm(f=>({...f, departure:dep, arrival:arr}))}
                      className="bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/50 hover:text-white/80 text-xs rounded-full px-3 py-1.5 transition-all cursor-pointer">
                      {r}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
            <span className="text-[10px] uppercase tracking-[.2em]">Défiler</span>
            <ChevronDown size={13} className="anim-float" />
          </div>
        </section>

        {/* ════════════════ TICKER ════════════════ */}
        <div className="border-y border-white/[0.07] py-4 bg-white/[0.02] overflow-hidden whitespace-nowrap">
          <div className="ticker-track">
            {[...TICKER,...TICKER].map((item,i)=>(
              <span key={i} className="text-sm text-white/35 font-medium flex-shrink-0 inline-flex items-center gap-2.5">
                <Car size={12} className="text-white/20"/> {item}
              </span>
            ))}
          </div>
        </div>

        {/* ════════════════ STATS ════════════════ */}
        <section ref={statsRef} className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji:'👥', value: counters.users.toLocaleString('fr-FR'),  suffix:'+', label:'Utilisateurs actifs' },
              { emoji:'🚗', value: counters.trips.toLocaleString('fr-FR'),  suffix:'+', label:'Trajets effectués'   },
              { emoji:'🌿', value: counters.co2,                             suffix:' T', label:'CO₂ économisé'     },
              { emoji:'⭐', value: counters.rating.toFixed(1),               suffix:'/5', label:'Note moyenne'      },
            ].map((s,i)=>(
              <div key={i}
                className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/20 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="font-sora font-extrabold text-[clamp(30px,5vw,46px)] leading-none tracking-tight">
                  {s.value}
                  <span className="text-white/30 font-light text-xl">{s.suffix}</span>
                </div>
                <div className="mt-2 text-sm text-white/40 font-light">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-white/[0.07]" />

        {/* ════════════════ POPULAR ROUTES ════════════════ */}
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">

            <div className="mb-14">
              <span className="inline-flex items-center bg-white/[0.05] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white/55 font-medium mb-5">
                Destinations
              </span>
              <h2 className="font-sora font-extrabold text-[clamp(30px,5vw,54px)] leading-[1.05] tracking-[-0.03em]">
                Trajets les plus<br/>
                <span className="text-white/25">populaires</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROUTES.map((r,i)=>(
                <Link key={i} to={`/search?departure=${r.from}&arrival=${r.to}`}
                  className="group bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-white/20 rounded-2xl px-6 py-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-1 no-underline">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold">{r.from}</span>
                      <ArrowRight size={11} className="text-white/25 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all"/>
                      <span className="text-sm font-semibold">{r.to}</span>
                    </div>
                    <div className="text-xs text-white/35">{r.dur} · {r.freq}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-sora font-bold text-lg leading-none">
                      {r.price} <span className="text-xs font-light text-white/35">FCFA</span>
                    </div>
                    <div className="text-[11px] text-white/30 mt-0.5">dès</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to="/search"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-white/35 text-white/55 hover:text-white text-sm font-medium px-7 py-3 rounded-full transition-all no-underline">
                Voir tous les trajets <ArrowRight size={13}/>
              </Link>
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07]" />

        {/* ════════════════ HOW IT WORKS ════════════════ */}
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div>
              <span className="inline-flex items-center bg-white/[0.05] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white/55 font-medium mb-6">
                Simple & rapide
              </span>
              <h2 className="font-sora font-extrabold text-[clamp(30px,5vw,54px)] leading-[1.05] tracking-[-0.03em] mb-6">
                Réservez en<br/>
                <span className="text-white/25">3 étapes</span>
              </h2>
              <p className="text-white/40 font-light leading-relaxed text-base max-w-sm mb-10">
                Trouver un covoiturage n'a jamais été aussi simple. Notre plateforme vous guide à chaque étape.
              </p>
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-950 font-semibold text-sm px-7 py-3.5 rounded-full transition-all hover:shadow-[0_8px_32px_rgba(255,255,255,.15)] no-underline">
                Commencer gratuitement <ArrowRight size={14}/>
              </Link>
            </div>

            <div>
              {[
                { n:'01', title:'Recherchez votre trajet',  desc:'Entrez ville de départ, arrivée et date. Trouvez le trajet qui vous convient parmi des dizaines d\'offres vérifiées.' },
                { n:'02', title:'Réservez votre place',     desc:'Choisissez votre conducteur et payez via Orange Money ou MTN MoMo. Paiement sécurisé et protégé.' },
                { n:'03', title:'Voyagez sereinement',      desc:'Retrouvez votre conducteur au point convenu. Le paiement est libéré automatiquement à la confirmation.' },
              ].map((step,i)=>(
                <div key={i} className={`flex gap-6 py-8 ${i<2?'border-b border-white/[0.07]':''}`}>
                  <span className="font-sora text-xs font-bold text-white/20 mt-0.5 w-7 flex-shrink-0">{step.n}</span>
                  <div>
                    <h3 className="text-base font-semibold mb-2 leading-snug">{step.title}</h3>
                    <p className="text-sm text-white/40 font-light leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07]" />

        {/* ════════════════ TRUST GRID ════════════════ */}
        <section className="py-24 px-6 lg:px-10 bg-white/[0.015]">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-16">
              <span className="inline-flex items-center bg-white/[0.05] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white/55 font-medium mb-5">
                Confiance & Sécurité
              </span>
              <h2 className="font-sora font-extrabold text-[clamp(30px,5vw,54px)] leading-[1.05] tracking-[-0.03em]">
                Votre sécurité,<br/>
                <span className="text-white/25">notre priorité</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRUST.map((f,i)=>(
                <div key={i}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/20 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 bg-white/[0.07] group-hover:bg-white/10 rounded-xl flex items-center justify-center text-white/65 mb-5 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07]" />

        {/* ════════════════ TESTIMONIALS ════════════════ */}
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">

            <div className="mb-14">
              <span className="inline-flex items-center bg-white/[0.05] border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white/55 font-medium mb-5">
                Témoignages
              </span>
              <h2 className="font-sora font-extrabold text-[clamp(30px,5vw,54px)] leading-[1.05] tracking-[-0.03em]">
                Ils voyagent avec<br/>
                <span className="text-white/25">CoCar</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t,i)=>(
                <div key={i} onClick={()=>setActiveTestimonial(i)}
                  className={`bg-neutral-900 border rounded-2xl p-8 cursor-pointer transition-all duration-500 ${
                    i===activeTestimonial
                      ? 'border-white/25 scale-[1.02] shadow-[0_0_48px_rgba(255,255,255,.04)]'
                      : 'border-neutral-800 opacity-45 hover:opacity-70'
                  }`}>
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_,j)=>
                      <Star key={j} size={12} className="fill-white/75 text-transparent"/>
                    )}
                  </div>
                  <p className="text-sm text-white/60 font-light leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-xs text-white/35">{t.city}</div>
                      </div>
                    </div>
                    <span className="text-xs text-white/25">{t.trips} trajets</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_,i)=>(
                <button key={i} onClick={()=>setActiveTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${
                    i===activeTestimonial ? 'w-8 bg-white' : 'w-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07]" />

        {/* ════════════════ PASSENGER / DRIVER ════════════════ */}
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">

            {/* Passenger — white card */}
            <div className="relative bg-white rounded-3xl p-12 lg:p-14 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-black/[0.03] -translate-y-1/4 translate-x-1/4 pointer-events-none" />
              <span className="inline-block bg-black/[0.06] text-neutral-900 text-[11px] font-bold uppercase tracking-widest rounded-full px-3.5 py-1.5 mb-6">
                Passager
              </span>
              <h3 className="font-sora font-extrabold text-neutral-950 text-[clamp(28px,4vw,38px)] leading-tight tracking-tight mb-4">
                Trouvez votre trajet idéal
              </h3>
              <p className="text-neutral-500 text-[15px] font-light leading-relaxed mb-10 max-w-xs">
                Des centaines de trajets disponibles chaque jour. Réservez en quelques secondes.
              </p>
              <Link to="/search"
                className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all hover:shadow-lg no-underline">
                Rechercher un trajet <ArrowRight size={14}/>
              </Link>
            </div>

            {/* Driver — dark card */}
            <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-12 lg:p-14 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/[0.02] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
              <span className="inline-block bg-white/[0.07] border border-white/10 text-white/55 text-[11px] font-bold uppercase tracking-widest rounded-full px-3.5 py-1.5 mb-6">
                Conducteur
              </span>
              <h3 className="font-sora font-extrabold text-white text-[clamp(28px,4vw,38px)] leading-tight tracking-tight mb-4">
                Rentabilisez vos trajets
              </h3>
              <p className="text-white/40 text-[15px] font-light leading-relaxed mb-10 max-w-xs">
                Proposez vos trajets et partagez vos frais. Publiez votre premier trajet en 2 minutes.
              </p>
              <Link to="/create-trip"
                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-semibold px-7 py-3.5 rounded-full transition-all hover:shadow-[0_8px_28px_rgba(255,255,255,.12)] no-underline">
                Proposer un trajet <ArrowRight size={14}/>
              </Link>
            </div>
          </div>
        </section>

        <div className="border-t border-white/[0.07]" />

        {/* ════════════════ FINAL CTA ════════════════ */}
        <section className="py-24 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-white rounded-3xl px-8 py-20 lg:py-28 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-black/[0.02] pointer-events-none" />
              <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-64 h-64 rounded-full bg-black/[0.025] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 bg-black/[0.05] rounded-full px-4 py-1.5 text-xs font-medium text-neutral-500 mb-6">
                  🚗 Rejoindre la communauté
                </span>
                <h2 className="font-sora font-extrabold text-neutral-950 text-[clamp(36px,7vw,76px)] leading-[.95] tracking-[-0.04em] mb-5">
                  Prêt à covoiturer ?
                </h2>
                <p className="text-neutral-500 text-lg font-light max-w-sm mx-auto leading-relaxed mb-10">
                  Rejoignez 50 000 utilisateurs qui économisent en partageant leurs trajets.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-base px-8 py-4 rounded-full transition-all hover:shadow-xl no-underline">
                    Créer mon compte gratuit <ArrowRight size={15}/>
                  </Link>
                  <Link to="/search"
                    className="inline-flex items-center justify-center gap-2 border border-black/15 hover:border-black/30 text-neutral-700 hover:text-neutral-950 font-medium text-base px-8 py-4 rounded-full transition-all no-underline">
                    Rechercher un trajet
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════ FOOTER ════════════════ */}
        <footer className="border-t border-white/[0.07] px-6 lg:px-10 pt-16 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="font-sora font-black text-neutral-950 text-base leading-none">C</span>
                  </div>
                  <span className="font-sora font-bold text-lg tracking-tight">CoCar</span>
                </div>
                <p className="text-sm text-white/35 font-light leading-relaxed">
                  La plateforme de covoiturage de référence au Cameroun.
                </p>
              </div>

              {[
                { title:'Produit',  links:['Rechercher','Proposer un trajet','Comment ça marche','Tarifs'] },
                { title:'Légal',   links:['CGU','Confidentialité','Cookies','Mentions légales']           },
                { title:'Contact', links:['Support','Presse','Partenariats','Blog']                       },
              ].map(col=>(
                <div key={col.title}>
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/25 mb-5">{col.title}</p>
                  <ul className="space-y-3 list-none p-0 m-0">
                    {col.links.map(l=>(
                      <li key={l}>
                        <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors no-underline">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs text-white/25">© {new Date().getFullYear()} CoCar · Tous droits réservés</p>
              <p className="text-xs text-white/25">Yaoundé, Cameroun 🇨🇲</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}