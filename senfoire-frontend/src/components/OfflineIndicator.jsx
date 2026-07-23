import { useState, useEffect } from 'react';
import { isOnline, onOffline, onOnline } from '../services/offline';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const unsubOffline = onOffline(() => setOnline(false));
    const unsubOnline = onOnline(() => setOnline(true));
    return () => { unsubOffline(); unsubOnline(); };
  }, []);

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2 text-xs font-bold shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 2.121a2 2 0 112.829 2.829" />
        </svg>
        Mode hors-ligne — Certaines fonctionnalités peuvent être limitées
      </div>
    </div>
  );
}
