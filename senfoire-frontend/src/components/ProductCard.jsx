import { useState } from 'react';

export default function ProductCard({ product, onEdit, onDelete, visitorMode, onCommander }) {
  const [imgError, setImgError] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const hasImage = product.image && !imgError;

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative h-52 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={product.image}
            alt={product.nom}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-blue-200">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-medium">Pas d'image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className={`absolute top-3 right-3 flex gap-2 transition-all duration-300 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          {!visitorMode && onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-blue-500 hover:text-white text-blue-600 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
              title="Modifier"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {!visitorMode && onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white text-red-500 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
          product.disponibilite ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/90 text-white'
        }`}>
          {product.disponibilite ? 'Disponible' : 'Indisponible'}
        </span>
      </div>

      <div className="p-5 space-y-3">
        <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-blue-700 transition-colors">
          {product.nom}
        </h4>
        {product.stand?.nom && (
          <p className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            {product.stand.nom}
          </p>
        )}
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[2rem]">
          {product.description || 'Aucune description.'}
        </p>

        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <div>
            <span className="text-lg font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
              {Number(product.prix ?? 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-[10px] font-bold text-gray-400 ml-0.5">FCFA</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
            (product.stock ?? 0) > 10 ? 'bg-emerald-50 text-emerald-700' :
            (product.stock ?? 0) > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              (product.stock ?? 0) > 10 ? 'bg-emerald-500' :
              (product.stock ?? 0) > 0 ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            {product.stock ?? 0} en stock
          </div>
        </div>

        {visitorMode && (
          <button
            onClick={() => onCommander && onCommander(product)}
            className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-[#1e3a8a] to-[#7c3aed] hover:from-blue-900 hover:to-purple-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Commander
          </button>
        )}
      </div>
    </div>
  );
}
