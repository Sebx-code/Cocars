import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { userApi, tripsApi, bookingsApi } from '../../services/api'
import { UserStats, Trip, Booking } from '../../types'
import StatCard from '../../components/ui/StatCard'
import { Car, Users, Calendar, DollarSign, Leaf, TrendingUp, ArrowRight, Plus, Wallet } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, tripsRes, bookingsRes] = await Promise.all([
        userApi.getStats(),
        tripsApi.getMyTrips(),
        bookingsApi.getMyBookings(),
      ])
      setStats(statsRes.data.data)
      setRecentTrips(tripsRes.data.data.slice(0, 3))
      setRecentBookings(bookingsRes.data.data.slice(0, 3))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats cards - Argon Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trajets conducteur"
          value={stats?.total_trips_as_driver || 0}
          change="+55% depuis hier"
          changeType="positive"
          icon={Car}
          iconColor="blue"
        />
        <StatCard
          title="Trajets passager"
          value={stats?.total_trips_as_passenger || 0}
          change="+3% cette semaine"
          changeType="positive"
          icon={Users}
          iconColor="orange"
        />
        <StatCard
          title="Nouveaux clients"
          value={`+${stats?.total_trips_as_passenger || 0}`}
          change="-2% ce trimestre"
          changeType="negative"
          icon={Wallet}
          iconColor="red"
        />
        <StatCard
          title="Total gains"
          value={`${(stats?.total_earnings || 0).toLocaleString()} FCFA`}
          change="+5% ce mois"
          changeType="positive"
          icon={DollarSign}
          iconColor="green"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent trips - Sales Overview style */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Mes trajets récents
              </h2>
              <p className="text-sm text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>4% de plus en 2024</span>
              </p>
            </div>
            <Link to="/my-trips" className="text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1 text-sm">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentTrips.length > 0 ? (
            <div className="space-y-3">
              {recentTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 border border-gray-100 dark:border-slate-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        {trip.departure_city} → {trip.arrival_city}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {trip.departure_date} • {trip.available_seats} places disponibles
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500 text-sm">{trip.price_per_seat.toLocaleString()} FCFA</p>
                    <span className={`badge text-xs ${trip.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {trip.status === 'active' ? 'Actif' : 'Terminé'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun trajet pour le moment</p>
              <Link to="/create-trip" className="btn-primary">
                <Plus className="w-4 h-4" />
                Créer mon premier trajet
              </Link>
            </div>
          )}
        </div>

        {/* CTA Card - Argon Purple/Pink Gradient Style */}
        <div className="relative rounded-2xl overflow-hidden min-h-[350px] shadow-argon-lg">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500" />
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Wallet className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-2">
                Démarrez avec CoCar
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Il n'y a rien que vous ne puissiez accomplir. Partagez vos trajets et économisez ensemble.
              </p>
            </div>
            
            <Link 
              to="/create-trip" 
              className="mt-6 inline-flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg w-fit text-sm"
            >
              Commencer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom section - Three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Mes réservations
            </h2>
            <Link to="/my-bookings" className="text-emerald-500 hover:text-emerald-600 font-medium flex items-center gap-1 text-sm">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-argon">
                <thead>
                  <tr>
                    <th>Trajet</th>
                    <th>Date</th>
                    <th>Prix</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          {booking.trip?.departure_city} → {booking.trip?.arrival_city}
                        </p>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400 text-sm">
                        {booking.trip?.departure_date}
                      </td>
                      <td className="font-semibold text-gray-800 dark:text-white text-sm">
                        {booking.total_price.toLocaleString()} FCFA
                      </td>
                      <td>
                        <span className={`badge ${
                          booking.status === 'confirmed' ? 'badge-success' :
                          booking.status === 'pending' ? 'badge-warning' :
                          booking.status === 'cancelled' ? 'badge-danger' : 'badge-primary'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmé' :
                           booking.status === 'pending' ? 'En attente' :
                           booking.status === 'cancelled' ? 'Annulé' : booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune réservation pour le moment</p>
              <Link to="/search" className="btn-secondary">
                Rechercher un trajet
              </Link>
            </div>
          )}
        </div>

        {/* Eco Stats Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            Impact écologique
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.co2_saved || 0} kg
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">CO₂ économisé</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Équivalent à
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🌳 Arbres plantés</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{Math.round((stats?.co2_saved || 0) / 20)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🚗 Km évités</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{Math.round((stats?.co2_saved || 0) * 4)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Merci de contribuer à un avenir plus vert ! 🌱
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
