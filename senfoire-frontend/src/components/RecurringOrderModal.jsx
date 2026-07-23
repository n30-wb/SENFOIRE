import { useState, useEffect } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

export default function RecurringOrderModal({ open, onClose }) {
  const toast = useToast();
  const [produits, setProduits] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [frequence, setFrequence] = useState('mensuel');
  const [myRecurrentes, setMyRecurrentes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      API.get('/produits'),
      API.get('/commandes-recurrentes'),
    ]).then(([prodRes, recRes]) => {
      setProduits(prodRes.data?.data || []);
      setMyRecurrentes(recRes.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const toggleProduct = (p) => {
    setSelectedProducts(prev => {
      const existing = prev.find(x => x.produit_id === p.id);
      if (existing) return prev.filter(x => x.produit_id !== p.id);
      return [...prev, { produit_id: p.id, nom: p.nom, quantite: 1 }];
    });
  };

  const updateQty = (produitId, qty) => {
    setSelectedProducts(prev =>
      prev.map(x => x.produit_id === produitId ? { ...x, quantite: Math.max(1, qty) } : x)
    );
  };

  const submit = async () => {
    if (selectedProducts.length === 0) return;
    setSubmitting(true);
    try {
      await API.post('/commandes-recurrentes', {
        frequence,
        produits: selectedProducts.map(p => ({
          produit_id: p.produit_id,
          quantite: p.quantite,
        })),
      });
      toast.success('Commande récurrente créée !');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    }
    setSubmitting(false);
  };

  const toggleRecurrente = async (id) => {
    try {
      const res = await API.put(`/commandes-recurrentes/${id}/toggle`);
      setMyRecurrentes(prev => prev.map(r => r.id === id ? { ...r, active: res.data.data.active } : r));
      toast.success(res.data.message);
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900">Commande Récurrente 🔄</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {myRecurrentes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">Vos commandes récurrentes</p>
            {myRecurrentes.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-gray-800 capitalize">{r.frequence}</p>
                  <p className="text-xs text-gray-400">Prochaine : {new Date(r.prochaine_commande).toLocaleDateString('fr-FR')}</p>
                </div>
                <button
                  onClick={() => toggleRecurrente(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer ${r.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}
                >
                  {r.active ? 'Active' : 'Suspendue'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Créer une nouvelle commande</p>

          <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 mb-2 block">Fréquence</label>
            <div className="flex gap-2">
              {[{ value: 'hebdomadaire', label: 'Hebdomadaire' }, { value: 'bimensuel', label: 'Bimensuel' }, { value: 'mensuel', label: 'Mensuel' }].map(f => (
                <button key={f.value} onClick={() => setFrequence(f.value)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${frequence === f.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {produits.filter(p => p.disponibilite && p.stock > 0).map(p => {
              const sel = selectedProducts.find(x => x.produit_id === p.id);
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${sel ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'}`} onClick={() => toggleProduct(p)}>
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${sel ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                    {sel && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.nom}</p>
                    <p className="text-xs text-gray-400">{Number(p.prix).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  {sel && (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => updateQty(p.produit_id || p.id, sel.quantite - 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-xs font-bold flex items-center justify-center cursor-pointer">-</button>
                      <span className="text-sm font-bold">{sel.quantite}</span>
                      <button onClick={() => updateQty(p.produit_id || p.id, sel.quantite + 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-xs font-bold flex items-center justify-center cursor-pointer">+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={submit}
            disabled={submitting || selectedProducts.length === 0}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm rounded-xl cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Création...' : `Créer la commande ${frequence}`}
          </button>
        </div>
      </div>
    </div>
  );
}
