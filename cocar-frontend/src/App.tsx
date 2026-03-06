import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Layouts (statiques - chargés immédiatement)
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

// Protected Route Components (statiques)
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

// Pages publiques (lazy)
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Feed = lazy(() => import('./pages/trips/Feed'))
const SearchTrips = lazy(() => import('./pages/trips/SearchTrips'))
const TripDetail = lazy(() => import('./pages/trips/TripDetail'))

// Pages protégées - Dashboard (lazy)
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const MyTrips = lazy(() => import('./pages/dashboard/MyTrips'))
const CreateTrip = lazy(() => import('./pages/dashboard/CreateTrip'))
const MyBookings = lazy(() => import('./pages/dashboard/MyBookings'))
const DriverBookings = lazy(() => import('./pages/dashboard/DriverBookings'))
const Messages = lazy(() => import('./pages/dashboard/Messages'))
const Notifications = lazy(() => import('./pages/dashboard/Notifications'))
const Profile = lazy(() => import('./pages/dashboard/Profile'))
const Vehicles = lazy(() => import('./pages/dashboard/Vehicles'))
const Settings = lazy(() => import('./pages/dashboard/Settings'))
const Wallet = lazy(() => import('./pages/dashboard/Wallet'))

// Pages Admin (lazy)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminTrips = lazy(() => import('./pages/admin/AdminTrips'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

// Spinner de chargement pour Suspense
function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 dark:text-white/50">Chargement...</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Landing page (sans layout) */}
            <Route path="/" element={<Landing />} />

            {/* Pages publiques avec MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/feed" element={<Feed />} />
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
              <Route path="/trip-feed" element={<Feed />} />
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
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
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
