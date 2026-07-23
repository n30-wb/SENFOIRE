import { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

export default function FavoriButton({ produitId, className = '' }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavori, setIsFavori] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'client') {
      API.get(`/favoris/check/${produitId}`)
        .then(res => setIsFavori(res.data.favori))
        .catch(() => {});
    }
  }, [produitId, user]);

  if (user?.role !== 'client') return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await API.post('/favoris/toggle', { produit_id: produitId });
      setIsFavori(res.data.favori);
      toast.success(res.data.message);
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-red-50 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110 ${className}`}
      title={isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg className={`w-4 h-4 transition-colors ${isFavori ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill={isFavori ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
