import { useState } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

export default function ReviewModal({ isOpen, onClose, avisableType, avisableId, onReviewSubmitted }) {
  const { toast } = useToast();
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/avis', { note, commentaire, avisable_type: avisableType, avisable_id: avisableId });
      toast.success('Avis envoyé avec succès !');
      onReviewSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'avis");
    } finally {
      setLoading(false);
    }
  };

  const labels = ['Exécrable', 'Mauvais', 'Moyen', 'Bon', 'Excellent'];
  const currentNote = hoveredStar || note;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Donner votre avis</h3>
          <p className="text-sm text-gray-400 mt-1">
            {avisableType === 'produit' ? 'Notez ce produit' : 'Notez ce stand'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNote(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="cursor-pointer transition-all hover:scale-110"
                >
                  <svg className={`w-10 h-10 ${star <= currentNote ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-600">{labels[currentNote - 1]}</span>
          </div>

          <div>
            <textarea
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              placeholder="Partagez votre expérience (optionnel)..."
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{commentaire.length}/1000</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
