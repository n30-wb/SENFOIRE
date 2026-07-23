import { useState } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

export default function LitigeModal({ isOpen, onClose, commandeId }) {
  const { toast } = useToast();
  const [type, setType] = useState('produit_non_conforme');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/litiges', { commande_id: commandeId, type, description });
      toast.success('Litige ouvert avec succès. Un admin va traiter votre demande.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ouverture du litige");
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: 'produit_non_conforme', label: 'Produit non conforme', icon: '⚠️' },
    { value: 'commande_non_livree', label: 'Commande non livrée', icon: '📦' },
    { value: 'remboursement', label: 'Demande de remboursement', icon: '💰' },
    { value: 'autre', label: 'Autre', icon: '📝' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Ouvrir un litige</h3>
          <p className="text-sm text-gray-400 mt-1">Commande #{commandeId}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {types.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  type === t.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <p className="text-xs font-semibold text-gray-700 mt-1">{t.label}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              required
              maxLength={2000}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
            />
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
              disabled={loading || !description.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm rounded-2xl shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Envoi...' : 'Ouvrir le litige'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
