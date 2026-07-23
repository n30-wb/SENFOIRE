import { useState, useEffect } from 'react';
import API from '../services/api';
import StarRating from './StarRating';

export default function ReviewsList({ avisableType, avisableId }) {
  const [avis, setAvis] = useState([]);
  const [stats, setStats] = useState({ moyenne: 0, total: 0 });

  useEffect(() => {
    const fetchAvis = async () => {
      try {
        const endpoint = avisableType === 'produit' ? `/avis/produit/${avisableId}` : `/avis/stand/${avisableId}`;
        const res = await API.get(endpoint);
        setAvis(res.data.data);
        setStats({ moyenne: res.data.moyenne, total: res.data.total });
      } catch { }
    };
    fetchAvis();
  }, [avisableType, avisableId]);

  if (avis.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3 mb-3">
        <StarRating note={stats.moyenne} size="md" total={stats.total} />
      </div>
      {avis.map((a) => (
        <div key={a.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">{a.client?.prenom} {a.client?.nom}</span>
            <StarRating note={a.note} size="xs" />
          </div>
          {a.commentaire && <p className="text-sm text-gray-500">{a.commentaire}</p>}
        </div>
      ))}
    </div>
  );
}
