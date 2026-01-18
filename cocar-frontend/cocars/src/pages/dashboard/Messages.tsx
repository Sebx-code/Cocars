// cocar-frontend/cocars/src/pages/dashboard/Messages.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Send, AlertCircle, User, Clock, Plus, Check, CheckCheck } from 'lucide-react';
import messageService from '../../services/messageService';
import echo from '../../services/echo';
import type { Conversation, Message, SendMessageData } from '../../types';
import { Card } from '../../components/dashboard';

export default function Messages() {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  // Sélectionner automatiquement la conversation si passée en state
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === location.state.conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      
      // Polling automatique toutes les 3 secondes (fallback si WebSocket ne fonctionne pas)
      const pollInterval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000);
      
      // S'abonner au canal privé de la conversation (temps réel avec WebSocket)
      const channel = echo.private(`conversation.${selectedConversation.id}`);
      
      channel.listen('.message.sent', (data: any) => {
        console.log('Message reçu via WebSocket:', data);
        
        // Ajouter le nouveau message reçu
        const newMessage: Message = {
          id: data.id,
          content: data.content,
          type: data.type,
          sender: data.sender,
          is_own: false,
          created_at: data.created_at,
        };
        
        setMessages((prev) => {
          // Éviter les doublons
          if (prev.find(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        
        // Scroller vers le bas
        setTimeout(() => {
          const chatContainer = document.querySelector('.messages-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
        
        // Mettre à jour la liste des conversations
        loadConversations();
      });
      
      // Cleanup: se désabonner et arrêter le polling
      return () => {
        clearInterval(pollInterval);
        echo.leave(`conversation.${selectedConversation.id}`);
      };
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data || []);
      
      // Scroller vers le bas après chargement
      setTimeout(() => {
        const chatContainer = document.querySelector('.messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Vider immédiatement l'input pour plus de fluidité
    setSending(true);

    try {
      const data: SendMessageData = { content: messageContent };
      const response = await messageService.sendMessage(selectedConversation.id, data);
      
      // Ajouter le message envoyé à la liste
      setMessages(prev => [...prev, response.data]);
      
      // Scroller vers le bas
      setTimeout(() => {
        const chatContainer = document.querySelector('.messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
      loadConversations(); // Refresh pour mettre à jour last_message
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setNewMessage(messageContent); // Restaurer le message en cas d'erreur
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateSupport = async () => {
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    try {
      const response = await messageService.createSupportConversation({
        subject: supportSubject,
        message: supportMessage,
      });
      setShowSupportModal(false);
      setSupportSubject('');
      setSupportMessage('');
      loadConversations();
      if (response.data.conversation) {
        setSelectedConversation(response.data.conversation);
      }
    } catch (error) {
      console.error('Erreur création conversation support:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-theme-primary">Messages</h1>
        <button
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Contacter le support
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Liste des conversations */}
        <Card className="p-4 lg:col-span-1 overflow-y-auto">
          <h2 className="font-bold text-theme-primary mb-4">Conversations</h2>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-theme-tertiary">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune conversation</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'hover:bg-theme-secondary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-theme-primary truncate">
                          {conv.type === 'support' ? conv.subject : `Trajet ${conv.trip?.id}`}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-sm text-theme-tertiary truncate">
                          {conv.last_message.sender_name}: {conv.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Zone de chat */}
        <Card className="p-4 lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b border-theme pb-4 mb-4">
                <h3 className="font-bold text-theme-primary">
                  {selectedConversation.type === 'support'
                    ? selectedConversation.subject
                    : `Trajet: ${selectedConversation.trip?.departure_city} → ${selectedConversation.trip?.arrival_city}`}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-theme-tertiary">
                  <User className="w-4 h-4" />
                  {selectedConversation.participants.length} participant(s)
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 messages-container">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_own ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.is_own
                          ? 'bg-emerald-600 text-white'
                          : 'bg-theme-secondary text-theme-primary'
                      }`}
                    >
                      {!msg.is_own && (
                        <p className="text-xs font-semibold mb-1">{msg.sender.name}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.is_own && (
                          <>
                            {msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-300" title="Lu" />
                            ) : (
                              <Check className="w-3.5 h-3.5" title="Envoyé" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border-2 border-theme rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-theme-tertiary">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal Support */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-4">Contacter le support</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-theme-primary mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="Ex: Problème avec un trajet"
                  className="w-full px-4 py-2 border-2 border-theme rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-theme-primary mb-2">
                  Message
                </label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Décrivez votre problème..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-theme rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-theme rounded-xl hover:bg-theme-secondary transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateSupport}
                  disabled={!supportSubject.trim() || !supportMessage.trim()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
