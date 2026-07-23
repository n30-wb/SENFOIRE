export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden animate-modal-in">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-modal-in { animation: modalIn 0.2s ease-out; }
        `}</style>
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            danger ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            {danger ? (
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-black text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-center border border-gray-200 hover:bg-white bg-white font-bold text-sm text-gray-600 rounded-xl transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 font-bold text-sm text-white rounded-xl transition-all cursor-pointer ${
              danger
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                : 'bg-foire-primary hover:bg-blue-900 shadow-lg shadow-blue-200'
            }`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
