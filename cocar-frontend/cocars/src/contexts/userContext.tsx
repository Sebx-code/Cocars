// src/contexts/userContext.tsx
import { createContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Types
interface Trip {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  driver: string;
  price: string;
  status: 'completed' | 'cancelled' | 'upcoming';
  rating?: number;
  distance: string;
  duration: string;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface BookingFormData {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: string;
  vehicleType: 'economy' | 'standard' | 'premium';
}

interface UserContextType {
  // State
  activeTab: 'dashboard' | 'trips' | 'upcoming' | 'history';
  showBookingModal: boolean;
  bookingFormData: BookingFormData;
  recentTrips: Trip[];
  upcomingTrips: Trip[];
  quickStats: QuickStat[];
  
  // Actions
  setActiveTab: (tab: 'dashboard' | 'trips' | 'upcoming' | 'history') => void;
  setShowBookingModal: (show: boolean) => void;
  setBookingFormData: (data: BookingFormData) => void;
  handleBookingSubmit: () => void;
  handleCancelTrip: (tripId: string) => void;
  navigateToProfile: () => void;
  navigateToSettings: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export function UserProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'upcoming' | 'history'>('dashboard');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    passengers: '1',
    vehicleType: 'standard',
  });

  // Quick Stats
  const quickStats: QuickStat[] = [
    {
      label: 'Trajets ce mois',
      value: '8',
      change: '+2',
      icon: '🚗',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Économisé',
      value: '12,500 FCFA',
      change: '+15%',
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Note moyenne',
      value: '4.9',
      change: '⭐',
      icon: '⭐',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  // Recent Trips
  const recentTrips: Trip[] = [
    {
      id: '1',
      date: '08 Déc 2024',
      time: '14:30',
      from: 'Yaoundé Centre',
      to: 'Bastos',
      driver: 'Pierre Martin',
      price: '2,500 FCFA',
      status: 'completed',
      rating: 5,
      distance: '8 km',
      duration: '25 min',
    },
    {
      id: '2',
      date: '07 Déc 2024',
      time: '09:15',
      from: 'Nsimeyong',
      to: 'Omnisport',
      driver: 'Jacques Fotso',
      price: '1,800 FCFA',
      status: 'completed',
      rating: 4,
      distance: '5 km',
      duration: '18 min',
    },
    {
      id: '3',
      date: '05 Déc 2024',
      time: '16:45',
      from: 'Mvan',
      to: 'Nlongkak',
      driver: 'Thomas Ndi',
      price: '3,200 FCFA',
      status: 'completed',
      rating: 5,
      distance: '12 km',
      duration: '35 min',
    },
  ];

  // Upcoming Trips
  const upcomingTrips: Trip[] = [
    {
      id: '4',
      date: '10 Déc 2024',
      time: '08:00',
      from: 'Yaoundé',
      to: 'Douala',
      driver: 'En attente',
      price: '15,000 FCFA',
      status: 'upcoming',
      distance: '250 km',
      duration: '3h 30min',
    },
  ];

  // Actions
  const handleBookingSubmit = () => {
    console.log('Nouvelle réservation:', bookingFormData);
    // TODO: Envoyer au backend
    setShowBookingModal(false);
    setBookingFormData({
      pickup: '',
      destination: '',
      date: '',
      time: '',
      passengers: '1',
      vehicleType: 'standard',
    });
  };

  const handleCancelTrip = (tripId: string) => {
    console.log('Annulation du trajet:', tripId);
    // TODO: Appel API pour annuler
  };

  const navigateToProfile = () => {
    navigate('/profile');
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  const value: UserContextType = {
    // State
    activeTab,
    showBookingModal,
    bookingFormData,
    recentTrips,
    upcomingTrips,
    quickStats,
    
    // Actions
    setActiveTab,
    setShowBookingModal,
    setBookingFormData,
    handleBookingSubmit,
    handleCancelTrip,
    navigateToProfile,
    navigateToSettings,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export { UserContext };