import { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

export default function PriceAlertButton({ produitId, stock }) {
  const toast = useToast();
  const [hasAlert, setHasAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/mes-alertes').then(r => {
      const alertes = r.data?.data || [];
      setHasAlert(alertes.some(a => a.produit_id === produitId));
    }).catch(() => {});
  }, [produitId]);

  const toggleAlert = async () => {
    setLoading(true);
    try {
      if (hasAlert) {
        const alertes = (await API.get('/mes-alertes')).data?.data || [];
        const alerte = alertes.find(a => a.produit_id === produitId);
        if (alerte) {
          await API.delete(`/alertes-stock/${alerte.id}`);
          setHasAlert(false);
          toast.success('Alerte supprimée.');
        }
      } else {
        await API.post('/alertes-stock', { produit_id: produitId });
        setHasAlert(true);
        toast.success('Alerte configurée ! Vous serez notifié quand le produit sera disponible.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    }
    setLoading(false);
  };

  if (stock > 0) return null;

  return (
    <button
      onClick={toggleAlert}
      disabled={loading}
      className={`w-9 h-9 rounded-xl backdrop-blur-sm flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110 ${
        hasAlert ? 'bg-amber-400/90 text-white' : 'bg-white/90 hover:bg-amber-50 text-amber-500'
      }`}
      title={hasAlert ? 'Désactiver l\'alerte' : 'Alerte quand dispo'}
    >
      <svg className="w-4 h-4" fill={hasAlert ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </button>
  );
}
