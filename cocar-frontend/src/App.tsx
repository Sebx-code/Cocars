import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

// Pages publiques
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SearchTrips from './pages/trips/SearchTrips'
import TripDetail from './pages/trips/TripDetail'

// Pages protégées - Dashboard
import Dashboard from './pages/dashboard/Dashboard'
import MyTrips from './pages/dashboard/MyTrips'
import CreateTrip from './pages/dashboard/CreateTrip'
import MyBookings from './pages/dashboard/MyBookings'
import DriverBookings from './pages/dashboard/DriverBookings'
import Messages from './pages/dashboard/Messages'
import Notifications from './pages/dashboard/Notifications'
import Profile from './pages/dashboard/Profile'
import Vehicles from './pages/dashboard/Vehicles'
import Settings from './pages/dashboard/Settings'
import Wallet from './pages/dashboard/Wallet'

// Pages Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTrips from './pages/admin/AdminTrips'
import AdminBookings from './pages/admin/AdminBookings'

// Protected Route Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Pages publiques avec MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/search" element={<SearchTrips />} />
              <Route path="/trips/:id" element={<TripDetail />} />
            </Route>

            {/* Pages d'authentification */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Pages protégées avec DashboardLayout */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/create-trip" element={<CreateTrip />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/driver-bookings" element={<DriverBookings />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Pages Admin avec AdminLayout */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/trips" element={<AdminTrips />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
