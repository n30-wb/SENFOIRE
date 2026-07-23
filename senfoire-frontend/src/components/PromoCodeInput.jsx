import { useState } from 'react';
import API from '../services/api';

export default function PromoCodeInput({ montantCommande, onCodeApplied }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleValider = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await API.post('/promo/valider', { code: code.trim(), montant_commande: montantCommande });
      if (res.data.success) {
        setResult(res.data.data);
        onCodeApplied(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Code promo invalide');
      setResult(null);
      onCodeApplied(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">Code promo</label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="EX: SENFOIRE10"
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <button
          onClick={handleValider}
          disabled={loading || !code.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? '...' : 'Valider'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-emerald-700">
            Réduction : {result.reduction.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-emerald-600">
            Total après réduction : <strong>{result.montant_final.toLocaleString('fr-FR')} FCFA</strong>
          </p>
        </div>
      )}
    </div>
  );
}
