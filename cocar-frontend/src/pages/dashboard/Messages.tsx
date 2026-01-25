import { useState, useEffect, useRef } from 'react'
import { messagesApi } from '../../services/api'
import { Conversation, Message } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MessageSquare, Send, Loader2, Search, MoreVertical, 
  Phone, Video, Smile, Paperclip, Mic, Check, CheckCheck,
  ArrowLeft, Clock, Car
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      const response = await messagesApi.getConversations()
      setConversations(response.data.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conv: Conversation) => {
    setSelectedConv(conv)
    setShowMobileChat(true)
    try {
      const response = await messagesApi.getMessages(conv.id)
      setMessages(response.data.data || [])
      // Marquer comme lu
      if (conv.unread_count > 0) {
        await messagesApi.markAsRead(conv.id)
        setConversations(prev => 
          prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
        )
      }
    } catch (error) {
      toast.error('Erreur lors du chargement')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || isSending) return
    
    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    // Optimistic update
    const tempMessage: Message = {
      id: Date.now(),
      conversation_id: selectedConv.id,
      sender_id: user?.id || 0,
      sender: user as any,
      content: messageContent,
      type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      await messagesApi.sendMessage(selectedConv.id, messageContent)
      loadMessages(selectedConv)
    } catch (error) {
      toast.error("Erreur lors de l'envoi")
      // Revert optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      setNewMessage(messageContent)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const formatMessageTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: fr })
    } catch {
      return ''
    }
  }

  const formatConversationTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isToday(date)) return format(date, 'HH:mm')
      if (isYesterday(date)) return 'Hier'
      return format(date, 'dd/MM/yyyy')
    } catch {
      return ''
    }
  }

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants?.find(p => p.id !== user?.id) || conv.participants?.[0]
  }

  const isMyMessage = (msg: Message) => msg.sender_id === user?.id

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const participant = getOtherParticipant(conv)
    const searchLower = searchQuery.toLowerCase()
    return (
      participant?.name?.toLowerCase().includes(searchLower) ||
      conv.trip?.departure_city?.toLowerCase().includes(searchLower) ||
      conv.trip?.arrival_city?.toLowerCase().includes(searchLower)
    )
  })

  // Grouper les messages par date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ''

    msgs.forEach(msg => {
      const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd')
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })

    return groups
  }

  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString)
    if (isToday(date)) return "Aujourd'hui"
    if (isYesterday(date)) return 'Hier'
    return format(date, 'EEEE d MMMM yyyy', { locale: fr })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Chargement des conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      {/* Container principal style WhatsApp */}
      <div className="flex-1 flex overflow-hidden rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        
        {/* Sidebar - Liste des conversations */}
        <div className={`
          w-full md:w-96 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-slate-700
          bg-white dark:bg-slate-800
          ${showMobileChat ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Header sidebar */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const participant = getOtherParticipant(conv)
                const isSelected = selectedConv?.id === conv.id
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => loadMessages(conv)}
                    className={`
                      w-full p-3 flex items-center gap-3 transition-all
                      hover:bg-gray-50 dark:hover:bg-slate-700/50
                      ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}
                    `}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {participant?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {/* Indicateur en ligne */}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                    </div>

                    {/* Infos conversation */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {participant?.name || 'Utilisateur'}
                        </p>
                        <span className={`text-xs ${conv.unread_count > 0 ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
                          {conv.last_message?.created_at && formatConversationTime(conv.last_message.created_at)}
                        </span>
                      </div>
                      
                      {/* Trajet */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <Car className="w-3 h-3" />
                        <span className="truncate">{conv.trip?.departure_city} → {conv.trip?.arrival_city}</span>
                      </div>

                      {/* Dernier message */}
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {conv.last_message?.sender_id === user?.id && (
                            <CheckCheck className="w-4 h-4 inline mr-1 text-primary-500" />
                          )}
                          {conv.last_message?.content || 'Démarrer la conversation'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
                  {!searchQuery && 'Réservez un trajet pour démarrer une conversation'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`
          flex-1 flex flex-col bg-[#efeae2] dark:bg-slate-900
          ${!showMobileChat ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedConv ? (
            <>
              {/* Header du chat */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                {/* Bouton retour mobile */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-md">
                    {getOtherParticipant(selectedConv)?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-50 dark:border-slate-800 rounded-full" />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {getOtherParticipant(selectedConv)?.name || 'Utilisateur'}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                    En ligne
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Info trajet */}
              <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800/30">
                <div className="flex items-center gap-2 text-sm">
                  <Car className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-primary-700 dark:text-primary-300 font-medium">
                    {selectedConv.trip?.departure_city} → {selectedConv.trip?.arrival_city}
                  </span>
                  {selectedConv.trip?.departure_date && (
                    <span className="text-primary-600/70 dark:text-primary-400/70">
                      • {format(new Date(selectedConv.trip.departure_date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  )}
                </div>
              </div>

              {/* Zone des messages */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {groupMessagesByDate(messages).map((group) => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                      <span className="px-4 py-1.5 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full shadow-sm">
                        {formatDateHeader(group.date)}
                      </span>
                    </div>

                    {/* Messages du groupe */}
                    {group.messages.map((msg, index) => {
                      const isMine = isMyMessage(msg)
                      const showTail = index === group.messages.length - 1 || 
                        isMyMessage(group.messages[index + 1]) !== isMine

                      return (
                        <div
                          key={msg.id}
                          className={`flex mb-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              relative max-w-[75%] md:max-w-[65%] px-3 py-2 rounded-lg shadow-sm
                              ${isMine 
                                ? 'bg-primary-500 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none'
                              }
                              ${showTail ? '' : isMine ? 'rounded-br-lg' : 'rounded-bl-lg'}
                            `}
                          >
                            {/* Contenu du message */}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>

                            {/* Heure et statut */}
                            <div className={`flex items-center justify-end gap-1 mt-1 -mb-1 ${isMine ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                              <span className="text-[10px]">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {isMine && (
                                msg.is_read ? (
                                  <CheckCheck className="w-4 h-4 text-sky-300" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )
                              )}
                            </div>

                            {/* Tail du message */}
                            {showTail && (
                              <div
                                className={`
                                  absolute bottom-0 w-3 h-3
                                  ${isMine 
                                    ? '-right-1.5 bg-primary-500' 
                                    : '-left-1.5 bg-white dark:bg-slate-700'
                                  }
                                `}
                                style={{
                                  clipPath: isMine 
                                    ? 'polygon(0 0, 100% 100%, 0 100%)' 
                                    : 'polygon(100% 0, 100% 100%, 0 100%)'
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center mb-4">
                      <MessageSquare className="w-12 h-12 text-primary-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun message</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Envoyez un message pour démarrer la conversation
                    </p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-end gap-2">
                  {/* Boutons d'action */}
                  <div className="flex items-center gap-1">
                    <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                      <Smile className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button className="p-2.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                      <Paperclip className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Input */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Écrivez un message..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                    />
                  </div>

                  {/* Bouton envoyer */}
                  {newMessage.trim() ? (
                    <button
                      onClick={sendMessage}
                      disabled={isSending}
                      className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {isSending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Send className="w-6 h-6" />
                      )}
                    </button>
                  ) : (
                    <button className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
                      <Mic className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* État vide - Pas de conversation sélectionnée */
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
              <div className="w-64 h-64 relative mb-8">
                {/* Illustration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full animate-pulse" />
                <div className="absolute inset-8 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800/40 dark:to-primary-700/40 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MessageSquare className="w-24 h-24 text-primary-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                CoCar Messenger
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                Envoyez et recevez des messages avec vos conducteurs et passagers. 
                Sélectionnez une conversation pour commencer.
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>Messagerie sécurisée</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary-600" />
                  </div>
                  <span>Temps réel</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
