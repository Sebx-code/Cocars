// src/contexts/landingContext.tsx
import { createContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Types
interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: string;
}

interface PopularRoute {
  from: string;
  to: string;
  price: string;
  trips: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  city: string;
  rating: number;
  comment: string;
  avatar: string;
  trips: number;
}

interface LandingContextType {
  // State
  mobileMenuOpen: boolean;
  searchData: SearchData;
  popularRoutes: PopularRoute[];
  benefits: Benefit[];
  testimonials: Testimonial[];
  
  // Actions
  setMobileMenuOpen: (open: boolean) => void;
  setSearchData: (data: SearchData) => void;
  handleSearch: () => void;
  navigateToLogin: () => void;
  navigateToSignup: () => void;
  navigateToUserDashboard: () => void;
  selectPopularRoute: (route: PopularRoute) => void;
}

const LandingContext = createContext<LandingContextType | undefined>(undefined);

// Provider
export function LandingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  
  // States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchData, setSearchData] = useState<SearchData>({
    from: "",
    to: "",
    date: "",
    passengers: "1",
  });

  // Data statiques
  const popularRoutes: PopularRoute[] = [
    { from: "Yaoundé", to: "Douala", price: "2 500 FCFA", trips: "15+" },
    { from: "Douala", to: "Bafoussam", price: "3 000 FCFA", trips: "12+" },
    { from: "Yaoundé", to: "Kribi", price: "4 500 FCFA", trips: "8+" },
    { from: "Douala", to: "Limbé", price: "2 000 FCFA", trips: "20+" },
  ];

  const benefits: Benefit[] = [
    {
      icon: "DollarSign",
      title: "Économisez jusqu'à 70%",
      description: "Partagez les frais avec d'autres passagers",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: "Shield",
      title: "Voyagez en toute sécurité",
      description: "Profils vérifiés et système de notation",
      color: "bg-slate-100 text-slate-700",
    },
    {
      icon: "MessageCircle",
      title: "Restez connecté",
      description: "Communiquez facilement avec votre conducteur",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: "TrendingUp",
      title: "Flexibilité totale",
      description: "Réservez et annulez gratuitement",
      color: "bg-slate-100 text-slate-700",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Solange B.",
      city: "Yaoundé",
      rating: 5,
      comment: "Super expérience ! Le conducteur était ponctuel et très sympa. Je recommande à 100%.",
      avatar: "SB",
      trips: 24,
    },
    {
      name: "Mbappe M.",
      city: "Douala",
      rating: 5,
      comment: "J'ai économisé tellement d'argent avec cette app. Les conducteurs sont fiables.",
      avatar: "MB",
      trips: 18,
    },
    {
      name: "Junior N.",
      city: "Bafoussam",
      rating: 5,
      comment: "Pratique et économique. J'utilise l'app pour tous mes trajets maintenant.",
      avatar: "JN",
      trips: 31,
    },
  ];

  // Actions
  const handleSearch = () => {
    // Validation basique
    if (!searchData.from || !searchData.to) {
      alert("Veuillez renseigner le départ et la destination");
      return;
    }

    // Redirection vers la page de recherche de trajets
    const queryParams = new URLSearchParams({
      from: searchData.from,
      to: searchData.to,
      date: searchData.date || new Date().toISOString().split('T')[0],
      passengers: searchData.passengers,
    });

    navigate(`/trips?${queryParams.toString()}`);
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  const navigateToSignup = () => {
    navigate('/signup');
  };

  const navigateToUserDashboard = () => {
    navigate('/user');
  };

  const selectPopularRoute = (route: PopularRoute) => {
    // Pré-remplir le formulaire de recherche avec le trajet populaire
    setSearchData({
      ...searchData,
      from: route.from,
      to: route.to,
    });

    // Scroller vers le formulaire de recherche
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const value: LandingContextType = {
    // State
    mobileMenuOpen,
    searchData,
    popularRoutes,
    benefits,
    testimonials,
    
    // Actions
    setMobileMenuOpen,
    setSearchData,
    handleSearch,
    navigateToLogin,
    navigateToSignup,
    navigateToUserDashboard,
    selectPopularRoute,
  };

  return (
    <LandingContext.Provider value={value}>
      {children}
    </LandingContext.Provider>
  );
}



// Export du contexte pour les cas d'usage avancés
export { LandingContext };