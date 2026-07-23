import { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

export default function MessageModal({ isOpen, onClose, commandeId, vendeurId, vendeurNom }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadConversation();
    }
  }, [isOpen, commandeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const res = await API.get('/conversations');
      const conv = res.data.data.find(c =>
        c.commande_id === commandeId ||
        (c.vendeur_id === vendeurId && !commandeId)
      );
      if (conv) {
        setConversationId(conv.id);
        const msgRes = await API.get(`/conversations/${conv.id}/messages`);
        setMessages(msgRes.data.data);
      }
    } catch { }
  };

  const handleSend = async () => {
    if (!contenu.trim()) return;
    setLoading(true);
    try {
      const payload = { contenu: contenu.trim() };
      if (conversationId) {
        payload.conversation_id = conversationId;
      } else if (commandeId) {
        payload.commande_id = commandeId;
      }
      const res = await API.post('/messages/envoyer', payload);
      setMessages(prev => [...prev, res.data.data]);
      setContenu('');
      if (!conversationId) {
        setConversationId(res.data.data.conversation_id);
      }
    } catch (err) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Message</h3>
              {vendeurNom && <p className="text-sm text-gray-400">À : {vendeurNom}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-3 min-h-[300px]">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">Aucun message. Écrivez votre premier message.</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender.role === 'admin' ? 'justify-center' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender.role === 'admin' ? 'bg-red-50 text-red-700 text-xs text-center' :
                msg.sender_id === conversationId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender.prenom} {msg.sender.nom}</p>
                <p className="text-sm">{msg.contenu}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              value={contenu}
              onChange={e => setContenu(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !contenu.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
