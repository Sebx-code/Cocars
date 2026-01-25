import { Link } from 'react-router-dom'
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 gradient-header rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">CoCar</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              CoCar est la plateforme de covoiturage qui vous permet de partager vos trajets, 
              d'économiser de l'argent et de réduire votre empreinte carbone.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/search" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Rechercher un trajet
                </Link>
              </li>
              <li>
                <Link to="/create-trip" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Proposer un trajet
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Mon espace
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5 text-primary-500" />
                contact@cocar.com
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5 text-primary-500" />
                +237 6XX XXX XXX
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 text-primary-500" />
                Douala, Cameroun
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CoCar. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
