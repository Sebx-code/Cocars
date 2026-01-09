import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Users,
  MapPin,
  DollarSign,
  Shield,
  Menu,
  X,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";


const CovoiturageLanding: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleClick(): void {
    navigate("/user");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">RideShare</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#fonctionnement"
                className="text-gray-600 hover:text-black"
              >
                Fonctionnement
              </a>
              <button className="text-gray-600 hover:text-black" onClick={handleClick}>
                Se connecter
              </button>
              <button className="bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800">
                S'inscrire
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <a href="#fonctionnement" className="block text-gray-600">
                Fonctionnement
              </a>
              <button className="w-full text-left text-gray-600">
                Se connecter
              </button>
              <button className="w-full bg-black text-white px-5 py-2.5 rounded-full">
                S'inscrire
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium">
              Plus de 15 000 trajets partagés ce mois
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Partage de trajet entre voisins
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl">
            Trouvez des personnes qui font le même trajet que vous. Divisez les
            coûts, réduisez votre empreinte carbone, rencontrez vos voisins.
          </p>

          {/* Search */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 mb-8 w-full">
            <div className="grid gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Départ</label>
                <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Yaoundé Centre"
                    className="flex-1 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Destination
                </label>
                <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Douala Akwa"
                    className="flex-1 outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Passagers
                  </label>
                  <select className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none">
                    <option>1 passager</option>
                    <option>2 passagers</option>
                    <option>3 passagers</option>
                    <option>4 passagers</option>
                    <option>...passagers</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
              Rechercher un trajet
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Plus de 5 000 conducteurs actifs • Moyenne de 2 300 FCFA économisés
            par trajet
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-gray-600">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-gray-600">Villes couvertes</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="fonctionnement" className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-16">
          Comment ça marche
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Recherchez votre trajet
            </h3>
            <p className="text-gray-600">
              Entrez votre point de départ et votre destination. Parcourez les
              options disponibles selon votre horaire.
            </p>
          </div>

          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Réservez votre place</h3>
            <p className="text-gray-600">
              Choisissez le conducteur qui vous convient. Consultez les avis et
              le profil avant de réserver.
            </p>
          </div>

          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Voyagez ensemble</h3>
            <p className="text-gray-600">
              Rencontrez-vous au point de départ convenu. Partagez les frais et
              profitez du voyage.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Économisez sur chaque trajet
              </h2>
              <p className="text-gray-600 mb-8">
                Les frais d'essence et de péage partagés entre plusieurs
                passagers permettent de réduire considérablement vos dépenses de
                transport.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Jusqu'à 70% d'économies
                    </h4>
                    <p className="text-sm text-gray-600">
                      Sur vos trajets réguliers et longues distances
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Paiement sécurisé</h4>
                    <p className="text-sm text-gray-600">
                      Transaction protégée via l'application
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Profils vérifiés</h4>
                    <p className="text-sm text-gray-600">
                      Système d'évaluation et vérification d'identité
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  Exemple de trajet
                </div>
                <div className="text-2xl font-bold">Yaoundé → Douala</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">
                    Trajet solo (essence + péage)
                  </span>
                  <span className="font-semibold">8 500 FCFA</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">
                    En covoiturage (3 passagers)
                  </span>
                  <span className="font-semibold">2 800 FCFA</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold">Vous économisez</span>
                  <span className="text-2xl font-bold text-green-600">
                    5 700 FCFA
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="text-sm">
                  💡 Sur un mois (8 trajets), économisez jusqu'à{" "}
                  <strong>45 600 FCFA</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
          Ce que disent nos utilisateurs
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              "J'utilise RideShare tous les jours pour aller au travail. J'ai
              économisé plus de 40 000 FCFA en 3 mois !"
            </p>
            <div className="font-semibold">Marie K.</div>
            <div className="text-sm text-gray-500">Yaoundé</div>
          </div>

          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              "Super expérience ! Les conducteurs sont sympas et ponctuels. Je
              recommande à 100%."
            </p>
            <div className="font-semibold">Jean-Paul M.</div>
            <div className="text-sm text-gray-500">Douala</div>
          </div>

          <div className="border-2 border-gray-200 rounded-2xl p-6">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-gray-700 mb-4">
              "Application simple et efficace. En plus, c'est bon pour
              l'environnement !"
            </p>
            <div className="font-semibold">Sarah N.</div>
            <div className="text-sm text-gray-500">Bafoussam</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Inscrivez-vous gratuitement et trouvez votre premier trajet
            aujourd'hui
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 inline-flex items-center gap-2">
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">RideShare</span>
              </div>
              <p className="text-sm text-gray-600">
                La plateforme de covoiturage qui connecte les voisins
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Application mobile
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Carrières
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black">
                    CGU
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>© 2026 RideShare. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CovoiturageLanding;
