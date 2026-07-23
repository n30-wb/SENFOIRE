import { useState } from 'react';
import API from '../services/api';
import { useToast } from './Toast';

export default function ReturnModal({ open, onClose, commande, produit }) {
  const toast = useToast();
  const [form, setForm] = useState({ motif: 'produit_defectueux', description: '', quantite: 1 });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const motifs = [
    { value: 'produit_defectueux', label: 'Produit défectueux' },
    { value: 'mauvais_article', label: 'Mauvais article reçu' },
    { value: 'pas_satisfait', label: 'Pas satisfait' },
    { value: 'autre', label: 'Autre motif' },
  ];

  const submit = async () => {
    setSubmitting(true);
    try {
      await API.post('/retours', {
        commande_id: commande.id,
        produit_id: produit.id,
        quantite: form.quantite,
        motif: form.motif,
        description: form.description,
      });
      toast.success('Demande de retour enregistrée.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la demande.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900">Retour / Remboursement</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400">Commande #{commande?.id}</p>
          <p className="text-sm font-bold text-gray-800">{produit?.nom}</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-2 block">Motif</label>
          <select
            value={form.motif}
            onChange={e => setForm({ ...form, motif: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          >
            {motifs.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-2 block">Quantité</label>
          <input
            type="number"
            value={form.quantite}
            onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 1 })}
            min={1}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 mb-2 block">Description (optionnel)</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez le problème..."
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">Annuler</button>
          <button onClick={submit} disabled={submitting} className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm cursor-pointer disabled:opacity-50">
            {submitting ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </div>
    </div>
  );
}
