import { useState } from 'react';

export default function CompareWidget({ produits: _produits }) {
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleProduct = (p) => {
    setSelected(prev => {
      const exists = prev.find(x => x.id === p.id);
      if (exists) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 4) return prev;
      return [...prev, p];
    });
  };

  const removeFromCompare = (id) => {
    setSelected(prev => prev.filter(x => x.id !== id));
  };

  if (selected.length === 0) return null;

  return (
    <>
      {/* Floating compare bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 animate-slide-up">
        <div className="flex -space-x-3">
          {selected.map(p => (
            <div key={p.id} className="relative w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold overflow-hidden">
              {p.image ? (
                <img src={p.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{p.nom?.charAt(0)}</span>
              )}
              <button onClick={() => removeFromCompare(p.id)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center cursor-pointer">x</button>
            </div>
          ))}
        </div>
        <span className="text-xs font-bold text-white/60">{selected.length}/4 sélectionné(s)</span>
        {selected.length >= 2 && (
          <button onClick={() => setShowCompare(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer">
            Comparer
          </button>
        )}
      </div>

      {/* Compare modal */}
      {showCompare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowCompare(false)}>
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900">Comparaison de produits</h3>
              <button onClick={() => setShowCompare(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-gray-400 uppercase">Caractéristique</th>
                    {selected.map(p => (
                      <th key={p.id} className="text-center py-3 px-4">
                        <div className="w-12 h-12 mx-auto rounded-xl overflow-hidden bg-gray-100 mb-2">
                          {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                        </div>
                        <p className="font-bold text-xs text-gray-900">{p.nom}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">Prix</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-center font-black text-emerald-700">{Number(p.prix).toLocaleString('fr-FR')} FCFA</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">Stock</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {p.stock > 0 ? `${p.stock} disponible(s)` : 'Épuisé'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">Note</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-center text-xs text-gray-600">
                        {p.note_moyenne ? `${Number(p.note_moyenne).toFixed(1)} / 5` : 'Aucune note'} ({p.nombre_avis || 0} avis)
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">Stand</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-center text-xs text-gray-600">{p.stand?.nom || '—'}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">Catégorie</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-center text-xs text-gray-600">{p.categorie?.nom || '—'}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="py-3 px-4 text-xs font-bold text-gray-500">Description</td>
                    {selected.map(p => (
                      <td key={p.id} className="py-3 px-4 text-center text-xs text-gray-500 max-w-[200px] truncate">{p.description || '—'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
