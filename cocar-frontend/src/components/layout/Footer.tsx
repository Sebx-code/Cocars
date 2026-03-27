import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-neutral-950 border-t border-gray-200 dark:border-white/[0.07] px-6 lg:px-10 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="font-sora font-black text-neutral-950 text-base leading-none">C</span>
              </div>
              <span className="font-sora font-bold text-lg tracking-tight text-gray-900 dark:text-white">CoCar</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-white/35 font-light leading-relaxed">
              La plateforme de covoiturage de référence au Cameroun.
            </p>
          </div>

          {/* Produit */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-gray-400 dark:text-white/25 mb-5">Produit</p>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <Link to="/search" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/create-trip" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Proposer un trajet
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Tarifs
                </a>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-gray-400 dark:text-white/25 mb-5">Légal</p>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  CGU
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-gray-400 dark:text-white/25 mb-5">Contact</p>
            <ul className="space-y-3 list-none p-0 m-0">
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Presse
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Partenariats
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors no-underline">
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/[0.07] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400 dark:text-white/25">© {new Date().getFullYear()} CoCar · Tous droits réservés</p>
          <p className="text-xs text-gray-400 dark:text-white/25">Yaoundé, Cameroun 🇨🇲</p>
        </div>
      </div>
    </footer>
  )
}
