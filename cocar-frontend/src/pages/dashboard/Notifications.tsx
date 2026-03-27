import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '../../services/api'
import { Notification } from '../../types'
import { Bell, Check, CheckCheck, Trash2, Loader2, Calendar, Car, CreditCard, Star, MessageCircle, Shield, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const PAGE_SIZE = 10

// Normaliser la notification pour supporter les deux formats (read et is_read)
const normalizeNotification = (notification: Notification): Notification => ({
  ...notification,
  is_read: notification.is_read ?? (notification as { read?: boolean }).read ?? false,
})

// Obtenir l'icône selon le type de notification
const getNotificationIcon = (type: string) => {
  const icons: Record<string, JSX.Element> = {
    booking_new: <Calendar className="w-5 h-5" />,
    booking_confirmed: <Check className="w-5 h-5" />,
    booking_cancelled: <AlertCircle className="w-5 h-5" />,
    booking_completed: <Check className="w-5 h-5" />,
    trip_reminder: <Car className="w-5 h-5" />,
    trip_cancelled: <AlertCircle className="w-5 h-5" />,
    trip_updated: <Car className="w-5 h-5" />,
    message_new: <MessageCircle className="w-5 h-5" />,
    rating_received: <Star className="w-5 h-5" />,
    payment_received: <CreditCard className="w-5 h-5" />,
    payment_refund: <CreditCard className="w-5 h-5" />,
    verification_approved: <Shield className="w-5 h-5" />,
    verification_rejected: <Shield className="w-5 h-5" />,
  }
  return icons[type] || <Bell className="w-5 h-5" />
}

// Obtenir la couleur selon le type de notification
const getNotificationColor = (type: string, isRead: boolean) => {
  if (isRead) return 'bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/30'
  
  const colors: Record<string, string> = {
    booking_new: 'bg-blue-100 text-blue-600',
    booking_confirmed: 'bg-emerald-100 text-emerald-600',
    booking_cancelled: 'bg-red-100 text-red-600',
    booking_completed: 'bg-purple-100 text-purple-600',
    trip_reminder: 'bg-amber-100 text-amber-600',
    trip_cancelled: 'bg-red-100 text-red-600',
    message_new: 'bg-cyan-100 text-cyan-600',
    rating_received: 'bg-yellow-100 text-yellow-600',
    payment_received: 'bg-emerald-100 text-emerald-600',
    payment_refund: 'bg-orange-100 text-orange-600',
    verification_approved: 'bg-emerald-100 text-emerald-600',
    verification_rejected: 'bg-red-100 text-red-600',
  }
  return colors[type] || 'bg-primary-100 text-primary-600'
}

// Déterminer la route de navigation selon le type de notification
const getNavigationPath = (notif: Notification): string => {
  const type = notif.type
  const data = notif.data || {}

  if (type.startsWith('booking')) return '/my-bookings'
  if (type.startsWith('trip')) {
    const tripId = data.trip_id
    if (tripId) return `/trips/${tripId}`
    return '/my-trips'
  }
  if (type.startsWith('payment')) return '/wallet'
  if (type === 'message_new') return '/messages'
  if (type === 'rating_received') return '/profile'
  return '/dashboard'
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationsApi.getAll()
      // Support pour les deux formats de réponse possibles
      const responseData = response.data as { data?: Notification[] } | Notification[]
      const notificationsArray = Array.isArray(responseData) 
        ? responseData 
        : (responseData.data || [])
      const normalizedNotifications = notificationsArray.map(normalizeNotification)
      setNotifications(normalizedNotifications)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const handleNotificationClick = async (notif: Notification) => {
    // Marquer comme lu si pas encore lu
    if (!notif.is_read) {
      try {
        await notificationsApi.markAsRead(notif.id)
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      } catch {
        // Continue navigation even if mark-as-read fails
      }
    }
    // Naviguer vers la bonne page
    const path = getNavigationPath(notif)
    navigate(path)
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('Toutes les notifications marquées comme lues')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const deleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notificationsApi.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notification supprimée')
      // Ajuster la page si nécessaire
      const newTotal = notifications.length - 1
      const newLastPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE))
      if (currentPage > newLastPage) setCurrentPage(newLastPage)
    } catch (error) {
      toast.error('Erreur')
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>

  const unreadCount = notifications.filter(n => !n.is_read).length
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE))
  const paginatedNotifications = notifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && <p className="text-gray-500 dark:text-white/55">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-outline">
            <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <>
          <div className="space-y-3">
            {paginatedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`card p-4 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer ${
                  !notif.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotificationColor(notif.type, notif.is_read)}`}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold ${!notif.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/55'}`}>
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-white/55 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-2">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  {!notif.is_read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                      className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Marquer comme lu"
                    >
                      <Check className="w-4 h-4 text-gray-400 dark:text-white/30 hover:text-emerald-500" />
                    </button>
                  )}
                  <button
                    onClick={(e) => deleteNotification(notif.id, e)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 dark:text-white/30 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-white/40">
                Page {currentPage} sur {totalPages} · {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline py-2 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline py-2 px-3 disabled:opacity-40"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-white/30 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune notification</h3>
          <p className="text-gray-500 dark:text-white/55">Vous n'avez pas de nouvelles notifications</p>
        </div>
      )}
    </div>
  )
}
