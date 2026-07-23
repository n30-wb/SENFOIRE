import { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

const tierConfig = {
  bronze: { color: 'from-amber-600 to-amber-800', label: 'Bronze', icon: '🥉', discount: '0%' },
  argent: { color: 'from-gray-400 to-gray-600', label: 'Argent', icon: '🥈', discount: '2%' },
  or: { color: 'from-yellow-400 to-yellow-600', label: 'Or', icon: '🥇', discount: '5%' },
  diamant: { color: 'from-blue-400 to-purple-500', label: 'Diamant', icon: '💎', discount: '10%' },
};

export default function LoyaltyCard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [showRedeem, setShowRedeem] = useState(false);

  useEffect(() => {
    API.get('/fidelite').then(r => {
      setData(r.data?.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRedeem = async () => {
    const points = parseInt(redeemPoints);
    if (!points || points <= 0) return;
    try {
      const res = await API.post('/fidelite/redeem', { points });
      toast.success(res.data.message);
      setShowRedeem(false);
      setRedeemPoints('');
      const refreshed = await API.get('/fidelite');
      setData(refreshed.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading || !data) return null;

  const tier = tierConfig[data.niveau] || tierConfig.bronze;

  return (
    <div className={`bg-gradient-to-r ${tier.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tier.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Programme Fidélité</p>
              <p className="text-sm font-black">{tier.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{data.points}</p>
            <p className="text-[10px] font-bold text-white/70 uppercase">points</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-white/70">Progression</span>
            <span className="text-white/70">{data.total_points_gagnes} pts total</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (data.total_points_gagnes / Math.max(1, data.total_points_gagnes + (data.points_pour_prochain_niveau || 0)))) * 100}%` }}
            />
          </div>
          {data.prochain_niveau && (
            <p className="text-[10px] text-white/60 mt-1">{data.points_pour_prochain_niveau} points pour {tierConfig[data.prochain_niveau]?.label}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-white/70">Remise fidélité : <span className="font-bold text-white">{data.remise_pct}%</span></p>
          {data.points > 0 && (
            <button
              onClick={() => setShowRedeem(true)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-lg cursor-pointer"
            >
              Utiliser mes points
            </button>
          )}
        </div>
      </div>

      {showRedeem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRedeem(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900">Utiliser vos points</h3>
            <p className="text-xs text-gray-500">Vous avez {data.points} points. 1 point = 10 FCFA de réduction.</p>
            <input
              type="number"
              value={redeemPoints}
              onChange={e => setRedeemPoints(e.target.value)}
              max={data.points}
              min={1}
              placeholder="Nombre de points"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {redeemPoints && (
              <p className="text-sm text-emerald-600 font-bold">= {Number(parseInt(redeemPoints || 0) * 10).toLocaleString('fr-FR')} FCFA de réduction</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowRedeem(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">Annuler</button>
              <button onClick={handleRedeem} className="flex-1 py-2.5 bg-blue-500 text-white font-bold rounded-xl text-sm cursor-pointer">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
