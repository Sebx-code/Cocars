import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, CheckCheck, Trash2, X, Loader2 } from 'lucide-react'
import { useNotifications, Notification } from '../../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string): string => {
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

  const getNotificationColor = (type: string): string => {
    const colors: Record<string, string> = {
      booking_new: 'bg-blue-100 dark:bg-blue-900/30',
      booking_confirmed: 'bg-emerald-100 dark:bg-emerald-900/30',
      booking_cancelled: 'bg-red-100 dark:bg-red-900/30',
      booking_completed: 'bg-purple-100 dark:bg-purple-900/30',
      trip_reminder: 'bg-amber-100 dark:bg-amber-900/30',
      trip_cancelled: 'bg-red-100 dark:bg-red-900/30',
      message_new: 'bg-cyan-100 dark:bg-cyan-900/30',
      rating_received: 'bg-yellow-100 dark:bg-yellow-900/30',
      payment_received: 'bg-emerald-100 dark:bg-emerald-900/30',
      payment_refund: 'bg-orange-100 dark:bg-orange-900/30',
    }
    return colors[type] || 'bg-gray-100 dark:bg-gray-800'
  }

  const formatTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr })
    } catch {
      return ''
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/80 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />
        
        {/* Badge de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  markAllAsRead()
                }}
                className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            </div>
          )}

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full ${getNotificationColor(notification.type)} flex items-center justify-center text-lg shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-1 shrink-0">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucune notification
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700">
              <Link
                to="/notifications"
                className="block text-center text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
