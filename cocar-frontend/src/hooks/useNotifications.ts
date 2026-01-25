import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { initEcho, disconnectEcho, getEcho } from '../services/echo'
import { notificationsApi } from '../services/api'
import toast from 'react-hot-toast'

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  data: Record<string, unknown>
  is_read: boolean
  read?: boolean // Support pour les deux formats
  created_at: string
}

// Normaliser la notification pour s'assurer que is_read est toujours présent
const normalizeNotification = (notification: Notification): Notification => ({
  ...notification,
  is_read: notification.is_read ?? notification.read ?? false,
})

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  isConnected: boolean
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  refreshNotifications: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  
  // Utiliser des refs pour éviter les dépendances circulaires dans useEffect
  const isAuthenticatedRef = useRef(isAuthenticated)
  const userRef = useRef(user)
  
  // Mettre à jour les refs quand les valeurs changent
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
    userRef.current = user
  }, [isAuthenticated, user])

  // Charger les notifications depuis l'API
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticatedRef.current) return
    
    try {
      setIsLoading(true)
      const response = await notificationsApi.getAll()
      // Support pour les deux formats de réponse possibles
      const responseData = response.data as { data?: Notification[]; notifications?: Notification[] } | Notification[]
      const notificationsArray = Array.isArray(responseData) 
        ? responseData 
        : (responseData.data || responseData.notifications || [])
      const normalizedNotifications = notificationsArray.map(normalizeNotification)
      setNotifications(normalizedNotifications)
      // Mettre à jour le compteur de non-lues
      setUnreadCount(normalizedNotifications.filter(n => !n.is_read).length)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Charger le nombre de non-lues
  const loadUnreadCount = useCallback(async () => {
    if (!isAuthenticatedRef.current) return
    
    try {
      const response = await notificationsApi.getUnreadCount()
      // Support pour les deux formats de réponse possibles
      const responseData = response.data as { data?: { count: number }; count?: number }
      const count = responseData.data?.count ?? responseData.count ?? 0
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }, [])

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsApi.delete(id)
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id)
        if (notification && !notification.is_read) {
          setUnreadCount(count => Math.max(0, count - 1))
        }
        return prev.filter(n => n.id !== id)
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [])

  // Rafraîchir les notifications
  const refreshNotifications = useCallback(async () => {
    await Promise.all([loadNotifications(), loadUnreadCount()])
  }, [loadNotifications, loadUnreadCount])

  // Initialiser Echo et écouter les événements
  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectEcho()
      setIsConnected(false)
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    let channel: ReturnType<ReturnType<typeof initEcho>['private']> | null = null

    const setupEcho = async () => {
      try {
        const echo = initEcho(token)
        
        // S'abonner au canal privé de l'utilisateur
        channel = echo.private(`user.${user.id}`)
        
        // Écouter les nouvelles notifications
        channel.listen('.notification.new', (data: unknown) => {
          console.log('New notification received:', data)
          const normalizedNotification = normalizeNotification(data as Notification)
          
          // Ajouter au début de la liste
          setNotifications(prev => {
            // Éviter les doublons
            if (prev.some(n => n.id === normalizedNotification.id)) {
              return prev
            }
            return [normalizedNotification, ...prev]
          })
          setUnreadCount(prev => prev + 1)

          // Afficher un toast selon le type
          toast.success(`${normalizedNotification.title}`, {
            duration: 5000,
            icon: getNotificationIcon(normalizedNotification.type),
          })
        })

        // Écouter les changements de statut de réservation
        channel.listen('.booking.status_changed', (data: unknown) => {
          console.log('Booking status changed:', data)
          // Rafraîchir les notifications après un court délai
          setTimeout(() => {
            loadNotifications()
            loadUnreadCount()
          }, 500)
        })

        // Écouter les rappels de trajet
        channel.listen('.trip.reminder', (data: unknown) => {
          console.log('Trip reminder:', data)
        })

        setIsConnected(true)

        // Charger les données initiales
        await loadNotifications()
        await loadUnreadCount()
      } catch (error) {
        console.error('Error initializing Echo:', error)
        setIsConnected(false)
        
        // Charger les notifications même si WebSocket échoue
        loadNotifications()
        loadUnreadCount()
      }
    }

    setupEcho()

    return () => {
      if (channel) {
        channel.stopListening('.notification.new')
        channel.stopListening('.booking.status_changed')
        channel.stopListening('.trip.reminder')
      }
      const echo = getEcho()
      if (echo && user) {
        echo.leave(`user.${user.id}`)
      }
    }
  }, [isAuthenticated, user?.id]) // Dépendre uniquement de isAuthenticated et user.id

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  }
}

// Helper pour obtenir l'icône selon le type de notification
function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    booking_new: '📅',
    booking_confirmed: '✅',
    booking_cancelled: '❌',
    booking_completed: '🎉',
    trip_reminder: '⏰',
    trip_cancelled: '🚫',
    trip_updated: '📝',
    message_new: '💬',
    rating_received: '⭐',
    payment_received: '💰',
    payment_refund: '💸',
    verification_approved: '✓',
    verification_rejected: '⚠️',
    system: '🔔',
  }
  return icons[type] || '🔔'
}

export default useNotifications
