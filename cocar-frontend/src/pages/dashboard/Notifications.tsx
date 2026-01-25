import { useState, useEffect } from 'react'
import { notificationsApi } from '../../services/api'
import { Notification } from '../../types'
import { Bell, Check, CheckCheck, Trash2, Loader2, Calendar, Car, CreditCard, Star, MessageCircle, Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

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
  if (isRead) return 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-gray-500'
  
  const colors: Record<string, string> = {
    booking_new: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    booking_confirmed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    booking_cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    booking_completed: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    trip_reminder: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    trip_cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    message_new: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    rating_received: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    payment_received: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    payment_refund: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    verification_approved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    verification_rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }
  return colors[type] || 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('Toutes les notifications marquées comme lues')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await notificationsApi.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notification supprimée')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && <p className="text-gray-600 dark:text-gray-400">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-outline">
            <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`card p-4 flex items-start gap-4 transition-all hover:shadow-md ${
                !notif.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotificationColor(notif.type, notif.is_read)}`}>
                {getNotificationIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-semibold ${!notif.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {notif.title}
                  </h3>
                  {!notif.is_read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!notif.is_read && (
                  <button 
                    onClick={() => markAsRead(notif.id)} 
                    className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" 
                    title="Marquer comme lu"
                  >
                    <Check className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notif.id)} 
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" 
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune notification</h3>
          <p className="text-gray-600 dark:text-gray-400">Vous n'avez pas de nouvelles notifications</p>
        </div>
      )}
    </div>
  )
}
