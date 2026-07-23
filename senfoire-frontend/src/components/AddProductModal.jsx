import { useState, useRef } from 'react';
import API from '../services/api';

export default function AddProductModal({ isOpen, onClose, onProductAdded, toast }) {
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setNom('');
    setPrix('');
    setStock('');
    setDescription('');
    setImages([]);
    setCurrentImgIndex(0);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;
    const validFiles = files.filter(f => {
      if (f.size > maxSize) {
        toast?.warning(`${f.name} dépasse 5 Mo et a été ignoré.`);
        return false;
      }
      return true;
    });
    const newImages = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages(prev => {
      const updated = [...prev, ...newImages];
      setCurrentImgIndex(updated.length > 0 ? updated.length - 1 : 0);
      return updated;
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (currentImgIndex >= updated.length) {
        setCurrentImgIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const validate = () => {
    const errs = {};
    if (!nom.trim()) errs.nom = 'Le nom est requis.';
    if (!prix || Number(prix) < 0) errs.prix = 'Prix invalide.';
    if (!stock || Number(stock) < 0) errs.stock = 'Stock invalide.';
    if (!description.trim()) errs.description = 'La description est requise.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('nom', nom.trim());
    formData.append('prix', prix);
    formData.append('stock', stock);
    formData.append('description', description.trim());
    images.forEach(img => formData.append('photos[]', img.file));

    try {
      const response = await API.post('/produits', formData);

      const newProduct = response.data?.data || response.data;
      toast?.success('Produit ajouté avec succès !');
      resetForm();
      onProductAdded?.(newProduct);
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
        toast?.error(error.response.data?.message || 'Veuillez corriger les erreurs du formulaire.');
      } else if (error.response?.data?.message) {
        toast?.error(error.response.data.message);
      } else {
        toast?.error('Impossible de joindre le serveur.');
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
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col md:flex-row animate-modal-in">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-in { animation: modalIn 0.25s ease-out; }
        `}</style>

        <div className="md:w-5/12 bg-gradient-to-br from-gray-50 to-gray-100/80 border-b md:border-b-0 md:border-r border-gray-100 p-6 flex flex-col items-center justify-center min-h-[280px] md:min-h-full">
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          {images.length > 0 ? (
            <div className="w-full space-y-4">
              <div className="relative w-full h-64 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200/60 shadow-inner">
                <img
                  src={images[currentImgIndex]?.url}
                  alt="Aperçu"
                  className="max-w-full max-h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={() => removeImage(currentImgIndex)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentImgIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                      className="absolute left-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentImgIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                      className="absolute right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  {currentImgIndex + 1} / {images.length}
                </div>
              </div>

              <div className="flex justify-center gap-2 overflow-x-auto py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      idx === currentImgIndex
                        ? 'border-foire-primary scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-foire-primary hover:text-foire-primary transition-all cursor-pointer shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-gray-200 hover:border-foire-primary rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer group bg-white/80 transition-all hover:bg-white"
            >
              <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                <svg className="w-8 h-8 text-blue-400 group-hover:text-foire-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
              <h5 className="text-sm font-bold text-gray-700">Ajoutez des photos</h5>
              <p className="text-xs text-gray-400 mt-1.5 max-w-[200px] leading-relaxed">Cliquez ici ou glissez vos images (max 5 Mo)</p>
              <span className="mt-4 px-4 py-1.5 bg-gray-100 text-[11px] font-bold text-gray-500 group-hover:bg-blue-50 group-hover:text-foire-primary rounded-lg transition-all">
                Parcourir
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="md:w-7/12 p-8 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">Nouvel Article</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ajoutez un produit à votre stand virtuel</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5 flex-1">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Nom du produit</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => { setNom(e.target.value); setErrors(prev => ({ ...prev, nom: null })); }}
                placeholder="Ex: Tissu Thioup Premium"
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
                  placeholder="25 000"
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
                  placeholder="10"
                  className={inputClass('stock')}
                />
                {errors.stock && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.stock}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({ ...prev, description: null })); }}
                placeholder="Décrivez la qualité, les dimensions, les spécificités..."
                className={`${inputClass('description')} resize-none leading-relaxed`}
              />
              {errors.description && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.description}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
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
                  Publication...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
