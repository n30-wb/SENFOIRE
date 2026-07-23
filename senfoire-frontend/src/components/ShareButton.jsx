import { useState } from 'react';

export default function ShareButton({ produit }) {
  const [showOptions, setShowOptions] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/visiteur' : '';
  const text = `Découvrez "${produit?.nom}" à ${(produit?.prix || 0).toLocaleString('fr-FR')} FCFA sur SENFOIRE ! 🛍️`;
  
  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
    setShowOptions(false);
  };
  
  const shareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
    setShowOptions(false);
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(text + ' ' + shareUrl);
      alert('Lien copié !');
    } catch {}
    setShowOptions(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-blue-50 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
        title="Partager"
      >
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
      
      {showOptions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowOptions(false)} />
          <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <button onClick={shareWhatsApp} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
              <span className="text-lg">💬</span> WhatsApp
            </button>
            <button onClick={shareSMS} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer border-t border-gray-100">
              <span className="text-lg">📱</span> SMS
            </button>
            <button onClick={copyLink} className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer border-t border-gray-100">
              <span className="text-lg">📋</span> Copier le lien
            </button>
          </div>
        </>
      )}
    </div>
  );
}
