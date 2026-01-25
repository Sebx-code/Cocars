import { useState, useEffect } from 'react'
import { messagesApi } from '../../services/api'
import { Conversation, Message } from '../../types'
import { MessageSquare, Send, Loader2, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadConversations() }, [])

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
    try {
      const response = await messagesApi.getMessages(conv.id)
      setMessages(response.data.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return
    try {
      await messagesApi.sendMessage(selectedConv.id, newMessage)
      setNewMessage('')
      loadMessages(selectedConv)
    } catch (error) {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-primary-500" /></div>

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Messages</h1>
      
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Conversations list */}
          <div className="w-80 border-r border-gray-200 dark:border-slate-700 overflow-y-auto">
            {conversations.length > 0 ? conversations.map((conv) => (
              <button key={conv.id} onClick={() => loadMessages(conv)} className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700 ${selectedConv?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                    {conv.participants?.[0]?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{conv.trip?.departure_city} → {conv.trip?.arrival_city}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.last_message?.content || 'Pas de message'}</p>
                  </div>
                  {conv.unread_count > 0 && <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unread_count}</span>}
                </div>
              </button>
            )) : (
              <div className="p-8 text-center text-gray-500">Aucune conversation</div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedConv.trip?.departure_city} → {selectedConv.trip?.arrival_city}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === selectedConv.participants?.[0]?.id ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender_id === selectedConv.participants?.[0]?.id ? 'bg-gray-100 dark:bg-slate-700' : 'bg-primary-500 text-white'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Votre message..." className="input flex-1" />
                    <button onClick={sendMessage} className="btn-primary"><Send className="w-5 h-5" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p>Sélectionnez une conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
