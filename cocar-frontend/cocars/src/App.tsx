// src/App.tsx - Application de covoiturage Rideshare
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/themeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages publiques
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import CovoiturageLanding from './pages/landing';
import SearchTripsPage from './pages/searchTrips';
import TripDetailPage from './pages/tripDetail';
import CreateTripPage from './pages/createTrip';

// Pages Dashboard utilisateur
import UserDashboard from './pages/dashboard/UserDashboard';
import MyTrips from './pages/dashboard/MyTrips';
import MyBookings from './pages/dashboard/MyBookings';
import MyRatings from './pages/dashboard/MyRatings';
import UserProfile from './pages/dashboard/UserProfile';
import Notifications from './pages/dashboard/Notifications';

// Pages Admin
import { AdminDashboard, AdminUsers, AdminTrips, AdminBookings, AdminSettings } from './pages/admin';

import './App.css';
import { PageTransition } from './components/animations/PageTransition';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
      <Routes location={location} key={location.pathname}>
          {/* ============ PAGES PUBLIQUES ============ */}
          
          {/* Page d'accueil */}
          <Route path="/" element={<PageTransition><CovoiturageLanding /></PageTransition>} />
          
          {/* Authentification */}
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
          
          {/* Recherche et détails trajets (public) */}
          <Route path="/trips" element={<PageTransition><SearchTripsPage /></PageTransition>} />
          <Route path="/trips/:id" element={<PageTransition><TripDetailPage /></PageTransition>} />
          
          {/* Création de trajet (protégée) */}
          <Route
            path="/trips/create"
            element={
              <ProtectedRoute>
                <PageTransition><CreateTripPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          
          {/* ============ DASHBOARD UTILISATEUR ============ */}
          <Route
            path="/user"
            element={
              <PageTransition>
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
              </PageTransition>
            }
          >
            {/* Routes enfants du dashboard */}
            <Route path="my-trips" element={<MyTrips />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="ratings" element={<MyRatings />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          
          {/* ============ DASHBOARD ADMIN ============ */}
          <Route
            path="/admin"
            element={
              <PageTransition>
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
              </PageTransition>
            }
          >
            <Route path="users" element={<AdminUsers />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* ============ PAGE 404 ============ */}
          <Route path="*" element={<NotFound />} />
      </Routes>
  );
}

// Composant 404
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
      <div className="text-center text-white space-y-6 p-8">
        <h1 className="text-9xl font-bold text-amber-400">404</h1>
        <h2 className="text-4xl font-bold">Page introuvable</h2>
        <p className="text-slate-300 text-lg">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <a
          href="/"
          className="inline-block mt-8 px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

export default App;