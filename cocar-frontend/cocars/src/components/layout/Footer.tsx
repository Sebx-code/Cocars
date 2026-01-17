// src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer() {
  const linkClass =
    "text-sm text-gray-400 hover:text-white transition-colors animated-underline w-fit";

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-gray-900 dark:bg-slate-950 text-white py-14 overflow-hidden"
    >
      {/* subtle glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-400/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-400/10 blur-3xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="flex items-center gap-2 mb-4 w-fit">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Rs</span>
                </div>
                <span className="text-xl font-bold">Rideshare</span>
              </Link>
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plateforme de covoiturage n°1 au Cameroun.
              <br />
              Plus simple, plus sûr, plus économique.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">À propos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className={linkClass}>
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={linkClass}>
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link to="/blog" className={linkClass}>
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className={linkClass}>
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link to="/report" className={linkClass}>
                  Signaler un problème
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className={linkClass}>
                  CGU
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={linkClass}>
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className={linkClass}>
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Rideshare. Tous droits réservés.</p>
        </div>
      </div>
    </motion.footer>
  );
}
