import { useState, useEffect } from 'react';
import API from '../services/api';

export default function EditProductModal({ isOpen, onClose, product, onProductUpdated, toast }) {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [disponibilite, setDisponibilite] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product && isOpen) {
      setNom(product.nom || '');
      setPrix(product.prix?.toString() || '');
      setStock(product.stock?.toString() || '');
      setDescription(product.description || '');
      setDisponibilite(product.disponibilite ?? true);
      setErrors({});
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const validate = () => {
    const errs = {};
    if (!nom.trim()) errs.nom = 'Le nom est requis.';
    if (!prix || Number(prix) < 0) errs.prix = 'Prix invalide.';
    if (stock === '' || Number(stock) < 0) errs.stock = 'Stock invalide.';
    if (!description.trim()) errs.description = 'La description est requise.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const response = await API.put(`/produits/${product.id}`, {
        nom: nom.trim(),
        prix: Number(prix),
        stock: Number(stock),
        description: description.trim(),
        disponibilite,
      });

      const updatedProduct = response.data?.data || response.data;
      toast?.success('Produit modifié avec succès !');
      onProductUpdated?.(updatedProduct);
      onClose();
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data?.errors || {};
        const mapped = {};
        if (serverErrors.nom) mapped.nom = serverErrors.nom[0];
        if (serverErrors.prix) mapped.prix = serverErrors.prix[0];
        if (serverErrors.stock) mapped.stock = serverErrors.stock[0];
        if (serverErrors.description) mapped.description = serverErrors.description[0];
        setErrors(mapped);
      } else if (error.response?.data?.message) {
        toast?.error(error.response.data.message);
      } else {
        toast?.error('Impossible de modifier le produit.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm bg-gray-50/80 ${
      errors[field]
        ? 'border-red-300 focus:ring-red-400/30 focus:border-red-400'
        : 'border-gray-200 focus:ring-foire-primary/20 focus:border-foire-primary'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-modal-in">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-in { animation: modalIn 0.25s ease-out; }
        `}</style>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">Modifier le Produit</h3>
              <p className="text-xs text-gray-400 mt-0.5">Mettez à jour les informations de votre article</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Nom du produit</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => { setNom(e.target.value); setErrors(prev => ({ ...prev, nom: null })); }}
                className={inputClass('nom')}
              />
              {errors.nom && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.nom}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Prix (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  value={prix}
                  onChange={(e) => { setPrix(e.target.value); setErrors(prev => ({ ...prev, prix: null })); }}
                  className={inputClass('prix')}
                />
                {errors.prix && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.prix}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => { setStock(e.target.value); setErrors(prev => ({ ...prev, stock: null })); }}
                  className={inputClass('stock')}
                />
                {errors.stock && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.stock}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: null })); }}
                className={`${inputClass('description')} resize-none leading-relaxed`}
              />
              {errors.description && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.description}</p>}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-bold text-gray-700">Disponibilité</p>
                <p className="text-[11px] text-gray-400">{disponibilite ? 'Visible dans le catalogue' : 'Masqué du catalogue'}</p>
              </div>
              <button
                type="button"
                onClick={() => setDisponibilite(!disponibilite)}
                className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${
                  disponibilite ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  disponibilite ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 text-center border border-gray-200 hover:bg-gray-50 font-bold text-sm text-gray-600 rounded-xl transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-foire-primary to-blue-800 hover:from-blue-900 hover:to-blue-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-950/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
