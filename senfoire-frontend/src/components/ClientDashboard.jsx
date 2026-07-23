import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import API from '../services/api';
import NotificationBell from './NotificationBell';
import LocationPicker from './LocationPicker';
import FavoriButton from './FavoriButton';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import ReviewsList from './ReviewsList';
import PromoCodeInput from './PromoCodeInput';
import MessageModal from './MessageModal';
import ShareButton from './ShareButton';
import PriceAlertButton from './PriceAlertButton';
import CompareWidget from './CompareWidget';
import LoyaltyCard from './LoyaltyCard';
import ReturnModal from './ReturnModal';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useI18n } from '../context/I18nContext';
import LangSelector from './LangSelector';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const livreurIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const navItems = [
    { id: 'catalogue', label: t('nav.catalogue'), icon: '🛍️' },
    { id: 'panier', label: t('nav.panier'), icon: '🛒' },
    { id: 'commandes', label: t('nav.commandes'), icon: '📋' },
    { id: 'favoris', label: t('nav.favoris'), icon: '❤️' },
    { id: 'fidélite', label: t('loyalty.title'), icon: '⭐' },

    { id: 'messages', label: t('nav.messages'), icon: '💬' },
  ];
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('catalogue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStand, setSelectedStand] = useState(null);
  const [favoris, setFavoris] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, type: '', id: null });
  const [messageModal, setMessageModal] = useState({ open: false, commandeId: null, vendeurId: null, vendeurNom: '' });
  const [adminConvId, setAdminConvId] = useState(null);
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminMsgInput, setAdminMsgInput] = useState('');
  const [adminMsgLoading, setAdminMsgLoading] = useState(false);
  const [promoResult, setPromoResult] = useState(null);
  const [promoCodeId, setPromoCodeId] = useState(null);
  const [paiementMode, setPaiementMode] = useState('Wave');
  const [isOrdering, setIsOrdering] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [livreurLocation, setLivreurLocation] = useState(null);
  const [ratingModal, setRatingModal] = useState({ open: false, livraisonId: null });
  const [ratingNote, setRatingNote] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratedLivraisons, setRatedLivraisons] = useState([]);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [paiementInfos, setPaiementInfos] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [returnModal, setReturnModal] = useState({ open: false, commande: null, produit: null });
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);


  const fetchProduits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/produits');
      const data = res.data?.data || res.data;
      setProduits(Array.isArray(data) ? data : []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const fetchCommandes = useCallback(async () => {
    try {
      const res = await API.get('/mes-commandes');
      const data = res.data?.data || res.data;
      setCommandes(Array.isArray(data) ? data : []);
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchProduits(); fetchCommandes(); }, [fetchProduits, fetchCommandes]);

  useEffect(() => {
    if (activeTab === 'favoris') {
      API.get('/favoris').then(r => setFavoris(r.data.data || [])).catch(() => {});
    }
    if (activeTab === 'messages') {
      loadAdminConversation();
    }
    if (activeTab === 'panier') {
      API.get('/fidelite').then(r => setLoyaltyData(r.data?.data)).catch(() => {});
    }
  }, [activeTab]);

  const loadAdminConversation = async () => {
    try {
      const res = await API.post('/conversations/admin');
      const convId = res.data.data?.id;
      if (convId) {
        setAdminConvId(convId);
        const msgRes = await API.get(`/conversations/${convId}/messages`);
        setAdminMessages(msgRes.data.data || []);
      }
    } catch {}
  };

  const sendAdminMessage = async () => {
    if (!adminMsgInput.trim() || !adminConvId) return;
    setAdminMsgLoading(true);
    try {
      const res = await API.post('/messages/envoyer', {
        conversation_id: adminConvId,
        contenu: adminMsgInput.trim(),
      });
      setAdminMessages(prev => [...prev, res.data.data]);
      setAdminMsgInput('');
    } catch (err) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setAdminMsgLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'messages' || !adminConvId) return;
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/conversations/${adminConvId}/messages`);
        setAdminMessages(res.data.data || []);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, adminConvId]);

  useEffect(() => {
    if (!selectedCommande) return;
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/commande/${selectedCommande.id}/livreur-location`);
        if (res.data.success) {
          setLivreurLocation(res.data.data);
        }
      } catch { /* */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedCommande]);

  const addToCart = (product) => {
    setPanier(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.quantite >= (product.stock || 1)) { toast.warning('Stock insuffisant.'); return prev; }
        return prev.map(i => i.id === product.id ? { ...i, quantite: i.quantite + 1 } : i);
      }
      return [...prev, { ...product, quantite: 1 }];
    });
    toast.success(`${product.nom} ajouté au panier.`);
  };

  const removeFromCart = (productId) => {
    setPanier(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setPanier(prev => prev.map(i => {
      if (i.id !== productId) return i;
      const newQty = i.quantite + delta;
      if (newQty <= 0) return null;
      if (newQty > (i.stock || 1)) { toast.warning('Stock insuffisant.'); return i; }
      return { ...i, quantite: newQty };
    }).filter(Boolean));
  };

  const cartTotal = panier.reduce((s, i) => s + (Number(i.prix) * i.quantite), 0);
  const cartCount = panier.reduce((s, i) => s + i.quantite, 0);

  const placeOrder = async () => {
    if (panier.length === 0) return;
    setIsOrdering(true);
    try {
      const panierPayload = panier.map(item => ({
        produit_id: item.id,
        quantite: item.quantite,
      }));

      const payload = {
        mode_paiement: paiementMode,
        panier: panierPayload,
      };
      if (promoCode) {
        payload.promo_code = promoCode.promo?.code || promoCode.code;
      }
      if (loyaltyPointsToUse > 0) {
        payload.points_used = loyaltyPointsToUse;
      }

      const res = await API.post('/commandes', payload);

      const lienPaiement = paiementInfos?.[paiementMode === 'Wave' ? 'wave' : 'orange_money']?.lien;
      if (lienPaiement) {
        window.open(lienPaiement, '_blank');
      }

      toast.success('Commande passée avec succès !');
      if (res.data.montant_reduction > 0) {
        toast.success(`Code promo appliqué : -${Number(res.data.montant_reduction).toLocaleString('fr-FR')} FCFA !`);
      }
      if (res.data.prix_livraison > 0) {
        toast.info(`Livraison : ${Number(res.data.prix_livraison).toLocaleString('fr-FR')} FCFA (${res.data.distance_km} km)`);
      }
      setOrderResult(res.data);
      setPanier([]);
      setPromoCode(null);
      setPromoResult(null);
      setPromoCodeId(null);
      setLoyaltyPointsToUse(0);
      fetchCommandes();
      fetchProduits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
      setIsOrdering(false);
      return;
    }
    setIsOrdering(false);
  };

  const handleLocationSave = async (lat, lng) => {
    try {
      await API.put('/location', { latitude: lat, longitude: lng });
      toast.success('Position mise à jour !');
      setShowLocationPicker(false);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour de la position.');
    }
  };

  const uniqueStands = [...new Map(produits.filter(p => p.stand?.nom).map(p => [p.stand.id, p.stand])).values()];

  const filtered = produits.filter(p => {
    if (selectedStand && p.stand?.id !== selectedStand) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.nom?.toLowerCase().includes(q) || p.stand?.nom?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex font-sans antialiased">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowLocationPicker(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900">📍 Définir votre position</h3>
            <LocationPicker onLocationSelected={handleLocationSave} />
            <button onClick={() => setShowLocationPicker(false)} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {selectedCommande && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setSelectedCommande(null); setLivreurLocation(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900">📍 Suivi livraison #{selectedCommande.id}</h3>
              <button onClick={() => { setSelectedCommande(null); setLivreurLocation(null); }} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {livreurLocation ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  {livreurLocation.avatar ? (
                    <img src={`http://127.0.0.1:8000/storage/${livreurLocation.avatar}`} alt="Photo livreur" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-sm">
                      {livreurLocation.prenom?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm">{livreurLocation.prenom} {livreurLocation.nom}</p>
                    <p className="text-xs text-gray-400">Livreur en route</p>
                  </div>
                </div>
                {livreurLocation.latitude && livreurLocation.longitude ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '250px' }}>
                    <MapContainer center={[livreurLocation.latitude, livreurLocation.longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[livreurLocation.latitude, livreurLocation.longitude]} icon={livreurIcon}>
                        <Popup>{livreurLocation.prenom} {livreurLocation.nom}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Position du livreur non disponible</p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-gray-400">Recherche du livreur...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#065f46] via-[#047857] to-[#065f46]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 p-6 space-y-8 flex-1 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/30">SF</div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-none">{t('app.name')}</h2>
                  <span className="text-[9px] font-bold text-emerald-300/80 uppercase tracking-[0.2em]">Espace Client</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${activeTab === item.id ? 'bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-sm' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'panier' && cartCount > 0 && <span className="ml-auto bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">{cartCount}</span>}
                  {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-black text-white shadow-lg ring-2 ring-white/20">{user?.nom?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-extrabold text-white text-sm truncate">{user?.nom}</p>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <button onClick={() => setShowLocationPicker(true)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2">
              📍 Ma position
            </button>
            <button onClick={logout} className="w-full py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">
                  Bonjour, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{user?.prenom || user?.nom}</span> 🌿
                </h1>
                <p className="text-xs text-gray-400 font-medium">Découvrez les produits de la foire SENFOIRE</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LangSelector />
              <NotificationBell />
              <button onClick={() => { setActiveTab('panier'); setSidebarOpen(true); }} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all cursor-pointer relative">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                {t('cart.title')}
                {cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-amber-900 text-[10px] font-black rounded-full flex items-center justify-center">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* CATALOGUE */}
          {(activeTab === 'catalogue') && (
            <>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] p-8 md:p-10 text-white">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t('nav.catalogue')} de la Foire 🛍️</h2>
                  <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">Explorez les produits proposés par les stands de la foire SENFOIRE.</p>
                </div>
              </div>

              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder={t('common.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all shadow-sm" />
              </div>

              {uniqueStands.length > 0 && (
                <div className="overflow-x-auto -mx-2 px-2 pb-2 scrollbar-hide">
                  <div className="flex gap-2 w-max">
                    <button
                      onClick={() => setSelectedStand(null)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${!selectedStand ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      🏪 Tous les stands
                    </button>
                    {uniqueStands.map(stand => (
                      <button
                        key={stand.id}
                        onClick={() => setSelectedStand(selectedStand === stand.id ? null : stand.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${selectedStand === stand.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                      >
                        🏬 {stand.nom}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-100 rounded-xl" />
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(p => (
                    <div key={p.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                      <div className="relative h-52 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="text-5xl text-emerald-200">📦</div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <ShareButton produit={p} />
                          <PriceAlertButton produitId={p.id} stock={p.stock} />
                          <FavoriButton produitId={p.id} />
                          <button onClick={() => setReviewModal({ open: true, type: 'produit', id: p.id })}
                            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-amber-50 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110"
                            title="Donner un avis">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          </button>
                        </div>
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${p.disponibilite ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                          {p.disponibilite ? 'Disponible' : 'Épuisé'}
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{p.nom}</h4>
                          {p.categorie && <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{p.categorie.nom}</span>}
                        </div>
                        {p.stand?.nom && (
                          <button onClick={() => setSelectedStand(p.stand.id)} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-emerald-600 font-medium transition-colors cursor-pointer">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            {p.stand.nom}
                          </button>
                        )}
                        <StarRating note={p.note_moyenne} size="xs" total={p.nombre_avis} />
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed min-h-[2rem]">{p.description || 'Aucune description.'}</p>
                        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
                          <div>
                            <span className="text-lg font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">{Number(p.prix ?? 0).toLocaleString('fr-FR')}</span>
                            <span className="text-[10px] font-bold text-gray-400 ml-0.5">FCFA</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setReviewModal({ open: true, type: 'produit', id: p.id })}
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                              Avis
                            </button>
                            <button
                              onClick={() => addToCart(p)}
                              disabled={!p.disponibilite || (p.stock ?? 0) <= 0}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                              {t('product.addToCart')}
                            </button>
                          </div>
                        </div>
                        <ReviewsList avisableType="produit" avisableId={p.id} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-sm font-bold text-gray-600">{t('common.noData')}</p>
                </div>
              )}
            </>
          )}

          {/* COMPARE WIDGET */}
          <CompareWidget produits={produits} />

          {/* PANIER */}
          {activeTab === 'panier' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">{t('cart.title')} 🛒</h3>
                {panier.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {panier.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                            {item.image ? <img src={item.image} alt={item.nom} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 truncate">{item.nom}</h4>
                            <p className="text-xs text-emerald-600 font-bold">{Number(item.prix).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 cursor-pointer transition-all">-</button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantite}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 cursor-pointer transition-all">+</button>
                          </div>
                          <span className="text-sm font-black text-gray-900 w-24 text-right">{(Number(item.prix) * item.quantite).toLocaleString('fr-FR')} FCFA</span>
                          <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 cursor-pointer transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50">
                      <PromoCodeInput montantCommande={cartTotal} onCodeApplied={(result) => { setPromoCode(result); setPromoResult(result); setPromoCodeId(result?.promo?.id || null); }} />
                      {promoCode && (
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-emerald-700 font-bold">✓ Code appliqué</span>
                          <span className="text-emerald-700 font-bold">-{Number(promoCode.reduction).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      )}
                    </div>
                    {loyaltyData && loyaltyData.points > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">⭐</span>
                          <p className="text-xs font-bold text-amber-800">Points fidélité disponibles : <span className="text-amber-600">{loyaltyData.points} pts</span></p>
                        </div>
                        <p className="text-[10px] text-amber-600/70 mb-3">1 point = 10 FCFA de réduction</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={0}
                            max={Math.min(loyaltyData.points, Math.floor(cartTotal / 10))}
                            value={loyaltyPointsToUse || ''}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              const maxPoints = Math.min(loyaltyData.points, Math.floor(cartTotal / 10));
                              setLoyaltyPointsToUse(Math.min(val, maxPoints));
                            }}
                            placeholder="Points à utiliser"
                            className="flex-1 px-3 py-2 border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 bg-white"
                          />
                          {loyaltyPointsToUse > 0 && (
                            <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">-{Number(loyaltyPointsToUse * 10).toLocaleString('fr-FR')} FCFA</span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paiement :</label>
                        <div className="flex gap-2">
                          {['Wave', 'Orange Money'].map(mode => (
                            <button key={mode} onClick={() => setPaiementMode(mode)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${paiementMode === mode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <p className="text-xs font-bold text-amber-800">{t('cart.paymentMethod')}</p>
                        </div>

                        <button
                          onClick={async () => {
                            if (!paiementMode) return;
                            if (paiementMode === 'Wave') {
                              setIsOrdering(true);
                              try {
                                const [infosRes, panierPayload] = await Promise.all([
                                  API.get('/infos-paiement'),
                                  Promise.resolve(panier.map(item => ({
                                    produit_id: item.id,
                                    quantite: item.quantite,
                                  }))),
                                ]);
                                setPaiementInfos(infosRes.data.data);

                                const payload = {
                                  mode_paiement: 'Wave',
                                  panier: panierPayload,
                                };
                                if (promoCode) {
                                  payload.promo_code = promoCode.promo?.code || promoCode.code;
                                }
                                if (loyaltyPointsToUse > 0) {
                                  payload.points_used = loyaltyPointsToUse;
                                }

                                const res = await API.post('/commandes', payload);

                                const lienWave = infosRes.data.data.wave?.lien;
                                if (lienWave) {
                                  window.location.href = lienWave;
                                }

                                toast.success('Commande passée avec succès ! Redirection vers Wave...');
                                if (res.data.montant_reduction > 0) {
                                  toast.success(`Code promo appliqué : -${Number(res.data.montant_reduction).toLocaleString('fr-FR')} FCFA !`);
                                }
                                setOrderResult(res.data);
                                setPanier([]);
                                setPromoCode(null);
                                setPromoResult(null);
                                setPromoCodeId(null);
                                setLoyaltyPointsToUse(0);
                                fetchCommandes();
                                fetchProduits();
                              } catch (err) {
                                toast.error(err.response?.data?.message || 'Erreur lors de la commande.');
                                setIsOrdering(false);
                              }
                            } else {
                              try {
                                const res = await API.get('/infos-paiement');
                                setPaiementInfos(res.data.data);
                                setShowPaymentScreen(true);
                              } catch {
                                toast.error("Impossible de récupérer les informations de paiement");
                              }
                            }
                          }}
                          disabled={panier.length === 0 || isOrdering}
                          className="w-full inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all justify-center cursor-pointer disabled:opacity-50"
                        >
                          {isOrdering ? (
                            <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Traitement en cours...</>
                          ) : paiementMode === 'Wave' ? (
                            <><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg> Payer avec Wave Business</>
                          ) : (
                            <><span className="text-lg">🟠</span> Payer avec Orange Money</>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total produits</p>
                          {(promoCode || loyaltyPointsToUse > 0) ? (
                            <>
                              <p className="text-lg font-black text-gray-400 line-through">{cartTotal.toLocaleString('fr-FR')} FCFA</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">{Math.max(0, cartTotal - (promoCode?.reduction || 0) - (loyaltyPointsToUse * 10)).toLocaleString('fr-FR')} FCFA</p>
                            </>
                          ) : (
                            <p className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">{cartTotal.toLocaleString('fr-FR')} FCFA</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">🛒</p>
                    <h4 className="text-base font-black text-gray-800">{t('cart.empty')}</h4>
                    <p className="text-xs text-gray-400 mt-1">Ajoutez des produits depuis le catalogue</p>
                    <button onClick={() => setActiveTab('catalogue')} className="mt-4 px-6 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition-all cursor-pointer">{t('nav.catalogue')}</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COMMANDES */}
          {activeTab === 'commandes' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">{t('order.title')} 📋</h3>
                {commandes.length > 0 ? (
                  <div className="space-y-4">
                    {commandes.map(cmd => (
                      <div key={cmd.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{t('order.number')}{cmd.id}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(cmd.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                              cmd.statut === 'livree' ? 'bg-emerald-100 text-emerald-700' :
                              cmd.statut === 'en_cours_livraison' ? 'bg-blue-100 text-blue-700' :
                              cmd.statut === 'payee' ? 'bg-emerald-100 text-emerald-700' :
                              cmd.statut === 'en_attente' && !cmd.valide_caissier ? 'bg-amber-100 text-amber-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {cmd.statut === 'livree' ? 'Livrée' :
                               cmd.statut === 'en_cours_livraison' ? 'En livraison' :
                               cmd.statut === 'payee' ? 'Paiement confirmé - Recherche livreur...' :
                               cmd.statut === 'en_attente' && !cmd.valide_caissier ? 'En cours de validation' :
                               cmd.statut}
                            </span>
                            {cmd.statut === 'en_cours_livraison' && (
                              <button onClick={() => setSelectedCommande(cmd)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer">
                                📍 {t('order.track')}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm font-black text-emerald-700">{Number(cmd.montant_total).toLocaleString('fr-FR')} FCFA</p>
                          {cmd.prix_livraison > 0 && (
                            <p className="text-xs text-gray-400">+ {Number(cmd.prix_livraison).toLocaleString('fr-FR')} FCFA livraison</p>
                          )}
                          {cmd.statut === 'livree' && (
                            <>
                              <button onClick={async () => {
                                try {
                                  const res = await API.get(`/commandes/${cmd.id}/facture`, { responseType: 'blob' });
                                  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `facture_${cmd.id}.pdf`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch {
                                  toast.error('Erreur lors du téléchargement de la facture.');
                                }
                              }}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1">
                                📄 {t('order.facture')}
                              </button>
                              {cmd.lignes?.map(l => (
                                <button key={l.id} onClick={() => setReturnModal({ open: true, commande: cmd, produit: l.produit })}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer">
                                  ↩️ Retour
                                </button>
                              ))}
                              {cmd.livraison && !ratedLivraisons.includes(cmd.livraison.id) && (
                                <button onClick={() => setRatingModal({ open: true, livraisonId: cmd.livraison.id })}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer">
                                  ⭐ Noter le livreur
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">📋</p>
                    <h4 className="text-base font-black text-gray-800">{t('order.empty')}</h4>
                    <p className="text-xs text-gray-400 mt-1">Passez votre première commande depuis le catalogue</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAVORIS */}
          {activeTab === 'favoris' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 mb-6">{t('favorite.title')}</h3>
              {favoris.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-4">❤️</p>
                  <h4 className="text-base font-black text-gray-800">{t('favorite.empty')}</h4>
                  <p className="text-xs text-gray-400 mt-1">Ajoutez des produits en favoris depuis le catalogue</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favoris.map(f => (
                    <div key={f.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm text-gray-900">{f.produit?.nom}</h4>
                        <p className="text-lg font-black text-blue-700">{Number(f.produit?.prix).toLocaleString('fr-FR')} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FIDELITE */}
          {activeTab === 'fidélite' && (
            <div className="space-y-6">
              <LoyaltyCard />
            </div>
          )}


          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-900">{t('message.adminTitle')}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{t('message.adminDesc')}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {adminMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-3">
                    <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p>{t('message.startMessage')}</p>
                  </div>
                ) : (
                  adminMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender_id === user?.id ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-700 rounded-bl-md'}`}>
                        <p className="text-[10px] font-bold opacity-60 mb-1">{msg.sender_id === user?.id ? t('message.you') : `${msg.sender?.prenom} ${msg.sender?.nom}`}</p>
                        <p className="text-sm">{msg.contenu}</p>
                        <p className="text-[9px] opacity-50 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-3">
                  <input
                    value={adminMsgInput}
                    onChange={e => setAdminMsgInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminMessage(); } }}
                    placeholder={t('message.placeholder')}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    onClick={sendAdminMessage}
                    disabled={adminMsgLoading || !adminMsgInput.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {adminMsgLoading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Écran de paiement Wave / Orange Money */}
        {showPaymentScreen && paiementInfos && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { if (!isOrdering && !orderResult) setShowPaymentScreen(false); }}>
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              {!orderResult ? (
                <div className="text-center space-y-6">
                  <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${paiementMode === 'Wave' ? 'bg-[#3be4b6]/10' : 'bg-orange-500/10'}`}>
                    {paiementMode === 'Wave' ? (
                      <svg className="w-10 h-10 text-[#3be4b6]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
                    ) : (
                      <span className="text-4xl">🟠</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      Payer avec {paiementMode}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Envoyez le montant ci-dessous au numéro {paiementMode === 'Wave' ? 'Wave' : 'Orange Money'} de SENFOIRE
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 space-y-3 border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Montant à payer</span>
                      <span className="text-2xl font-black text-gray-900">
                        {Math.max(0, cartTotal - (promoCode?.reduction || 0) - (loyaltyPointsToUse * 10)).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Destinataire</span>
                      <span className="font-bold text-gray-900">{paiementInfos[paiementMode === 'Wave' ? 'wave' : 'orange_money'].nom}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Numéro</span>
                      <span className="font-bold text-lg text-emerald-600">{paiementInfos[paiementMode === 'Wave' ? 'wave' : 'orange_money'].numero}</span>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={isOrdering}
                    className={`w-full inline-flex items-center gap-3 px-6 py-4 text-white text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all justify-center cursor-pointer disabled:opacity-50 ${paiementMode === 'Wave' ? 'bg-[#3be4b6] hover:bg-[#2cd3a5] shadow-[#3be4b6]/30' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'}`}
                  >
                    {isOrdering ? (
                      <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Traitement...</>
                    ) : (
                      <>{paiementMode === 'Wave' ? 'Payer avec Wave Business' : 'Confirmer la commande et payer'}</>
                    )}
                  </button>

                  <p className="text-xs text-gray-400">
                    En confirmant, vous allez être redirigé vers {paiementMode === 'Wave' ? 'Wave Business' : 'Orange Money'} pour effectuer le paiement.
                  </p>

                  {!isOrdering && (
                    <button onClick={() => setShowPaymentScreen(false)} className="text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer">
                      Annuler
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Commande confirmée !</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Votre commande #{orderResult.commande_id} a été enregistrée. Rendez-vous dans l'onglet commandes pour suivre son statut.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Montant</span>
                      <span className="font-bold">{Number(orderResult.montant_apres_reduction).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Livraison</span>
                      <span className="font-bold">{Number(orderResult.prix_livraison).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm">
                      <span className="text-gray-700 font-bold">Total</span>
                      <span className="font-black text-emerald-700">{Number(orderResult.montant_total).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowPaymentScreen(false); setActiveTab('commandes'); }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                  >
                    Voir mes commandes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModal.open && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setRatingModal({ open: false })}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">⭐ Noter le livreur</h3>
                <button onClick={() => setRatingModal({ open: false })} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRatingNote(star)}
                    className="text-3xl transition-all cursor-pointer hover:scale-110">
                    <svg className={`w-10 h-10 ${star <= ratingNote ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)}
                placeholder="Ajouter un commentaire (optionnel)..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                rows={3} maxLength={500} />
              <button onClick={async () => {
                if (ratingNote === 0) return;
                setRatingSubmitting(true);
                try {
                  await API.post(`/livraisons/${ratingModal.livraisonId}/noter`, {
                    note: ratingNote,
                    commentaire: ratingComment || undefined,
                  });
                  toast.success('Merci pour votre évaluation !');
                  setRatedLivraisons(prev => [...prev, ratingModal.livraisonId]);
                  setRatingModal({ open: false });
                  setRatingNote(0);
                  setRatingComment('');
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Erreur lors de la notation.');
                }
                setRatingSubmitting(false);
              }}
                disabled={ratingNote === 0 || ratingSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                {ratingSubmitting ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Envoi...</>
                ) : 'Envoyer la note'}
              </button>
            </div>
          </div>
        )}
      </main>

      <ReviewModal isOpen={reviewModal.open} onClose={() => setReviewModal({ open: false, type: '', id: null })}
        avisableType={reviewModal.type} avisableId={reviewModal.id} onReviewSubmitted={() => {}} />
      <MessageModal isOpen={messageModal.open} onClose={() => setMessageModal({ open: false, commandeId: null, vendeurId: null, vendeurNom: '' })}
        commandeId={messageModal.commandeId} vendeurId={messageModal.vendeurId} vendeurNom={messageModal.vendeurNom} />
      <ReturnModal open={returnModal.open} onClose={() => setReturnModal({ open: false, commande: null, produit: null })}
        commande={returnModal.commande} produit={returnModal.produit} />

    </div>
  );
}
