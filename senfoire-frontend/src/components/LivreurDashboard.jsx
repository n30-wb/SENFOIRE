import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import API from '../services/api';
import NotificationBell from './NotificationBell';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useI18n } from '../context/I18nContext';
import LangSelector from './LangSelector';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const clientIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function LivreurDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const navItems = [
    { id: 'available', label: t('nav.orders') + ' dispo', icon: '📦' },
    { id: 'active', label: t('nav.deliveries') + ' en cours', icon: '🚚' },
    { id: 'history', label: 'Historique', icon: '📋' },
  ];
  const statusConfig = {
    disponible: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    prise_en_charge: { label: 'En cours', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    en_cours: { label: 'En route', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
    livree: { label: 'Livrée', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  };
  const [activeTab, setActiveTab] = useState('available');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get('/livreur/profile');
      setProfile(res.data?.data || null);
    } catch { /* */ }
  }, []);

  const fetchDisponibles = useCallback(async () => {
    try {
      const res = await API.get('/livreur/livraisons-disponibles');
      const data = res.data?.data || [];
      setOrders(prev => {
        const autres = prev.filter(o => o.statut !== 'disponible');
        return [...autres, ...(Array.isArray(data) ? data : [])];
      });
    } catch { /* */ }
  }, []);

  const fetchMesLivraisons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/livreur/mes-livraisons');
      const data = res.data?.data || [];
      setOrders(prev => {
        const disponibles = prev.filter(o => o.statut === 'disponible');
        const livreurLivraisons = Array.isArray(data) ? data : [];
        return [...disponibles, ...livreurLivraisons];
      });
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchDisponibles();
    fetchMesLivraisons();
  }, [fetchProfile, fetchDisponibles, fetchMesLivraisons]);

  const acceptOrder = async (order) => {
    try {
      await API.post(`/livreur/accepter/${order.id}`);
      toast.success(`Commande #${order.commande_id} acceptée !`);
      fetchDisponibles();
      fetchMesLivraisons();
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'acceptation.');
    }
  };

  const deliveredOrder = async (order) => {
    try {
      await API.post(`/livreur/livree/${order.id}`);
      toast.success(`Commande #${order.commande_id} marquée comme livrée !`);
      fetchMesLivraisons();
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la livraison.');
    }
  };

  const toggleDisponibilite = async () => {
    try {
      const res = await API.put('/livreur/disponibilite');
      setProfile(res.data?.data || profile);
      toast.success(res.data?.message || 'Disponibilité mise à jour.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    }
  };

  const shareMyLocation = async (commandeId) => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const payload = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          if (commandeId) {
            payload.commande_id = commandeId;
          }
          await API.put('/livreur/location', payload);
          toast.success('Position partagée !');
        } catch {
          toast.error('Erreur lors du partage de position.');
        }
      },
      () => toast.error('Impossible d\'obtenir votre position.')
    );
  };

  const locationWatchRef = useRef(null);

  const startContinuousLocationSharing = useCallback((commandeId) => {
    if (!navigator.geolocation) return;
    if (locationWatchRef.current) navigator.geolocation.clearWatch(locationWatchRef.current);
    locationWatchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await API.put('/livreur/location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            commande_id: commandeId,
          });
        } catch { /* silent */ }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }, []);

  const stopContinuousLocationSharing = useCallback(() => {
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopContinuousLocationSharing();
  }, [stopContinuousLocationSharing]);

  const available = orders.filter(o => o.statut === 'disponible');
  const active = orders.filter(o => o.statut === 'prise_en_charge' || o.statut === 'en_cours');
  const history = orders.filter(o => o.statut === 'livree');

  useEffect(() => {
    if (active.length === 0) return;
    const activeOrder = active[0];
    if (activeOrder?.commande_id) {
      startContinuousLocationSharing(activeOrder.commande_id);
    }
  }, [active, startContinuousLocationSharing, stopContinuousLocationSharing]);

  const displayOrders = activeTab === 'available' ? available : activeTab === 'active' ? active : history;

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex font-sans antialiased">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900">📍 Client à livrer</h3>
              <button onClick={() => setSelectedClient(null)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm">
                {selectedClient.client_prenom?.charAt(0) || selectedClient.client?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm">{selectedClient.client_prenom} {selectedClient.client}</p>
                <p className="text-xs text-gray-400">📞 {selectedClient.telephone}</p>
              </div>
            </div>
            {selectedClient.prix_livraison > 0 && (
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <p className="text-[10px] font-bold text-blue-500 uppercase">Prix livraison</p>
                <p className="text-xl font-black text-blue-700">{Number(selectedClient.prix_livraison).toLocaleString('fr-FR')} FCFA</p>
              </div>
            )}
            {selectedClient.client_latitude && selectedClient.client_longitude ? (
              <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '250px' }}>
                <MapContainer center={[selectedClient.client_latitude, selectedClient.client_longitude]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[selectedClient.client_latitude, selectedClient.client_longitude]} icon={clientIcon}>
                    <Popup>{selectedClient.client_prenom} {selectedClient.client}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Position du client non disponible</p>
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12] via-[#c2410c] to-[#7c2d12]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 p-6 space-y-8 flex-1 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/30">SF</div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-none">{t('app.name')}</h2>
                  <span className="text-[9px] font-bold text-orange-300/80 uppercase tracking-[0.2em]">Espace Livreur</span>
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
                  {item.id === 'available' && available.length > 0 && <span className="ml-auto bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">{available.length}</span>}
                  {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center font-black text-white shadow-lg ring-2 ring-white/20">{user?.prenom?.charAt(0).toUpperCase() || user?.nom?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-extrabold text-white text-sm truncate">{user?.prenom} {user?.nom}</p>
                <span className="text-[10px] bg-orange-400/20 text-orange-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Points mensuels</p>
              <p className="text-xl font-black text-amber-400">{profile?.points_mensuels || 0} pts</p>
            </div>
            <button onClick={() => shareMyLocation(active.length > 0 ? active[0].commande_id : null)} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2">
              📍 Partager ma position
            </button>
            <button onClick={toggleDisponibilite} className={`w-full py-2.5 border font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${profile?.disponibilite ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-300' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60'}`}>
              <span className={`w-2 h-2 rounded-full ${profile?.disponibilite ? 'bg-emerald-400' : 'bg-gray-400'}`} />
              {profile?.disponibilite ? 'Disponible' : 'Hors ligne'}
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
                  Bonjour, <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{user?.prenom || user?.nom}</span> 🚚
                </h1>
                <p className="text-xs text-gray-400 font-medium">Gérez vos livraisons en temps réel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LangSelector />
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316] p-8 md:p-10 text-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t('nav.deliveries')} 🚚</h2>
                <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">Acceptez les commandes et livrez les articles aux clients de la foire SENFOIRE.</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-amber-400">{profile?.points_mensuels || 0}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Points</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black">{available.length}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Dispo</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className={`text-2xl font-black ${profile?.disponibilite ? 'text-emerald-400' : 'text-gray-400'}`}>{profile?.disponibilite ? 'ON' : 'OFF'}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Statut</p>
                </div>
              </div>
            </div>
          </div>

          {/* ORDERS LIST */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-900">
              {activeTab === 'available' ? 'Commandes disponibles' : activeTab === 'active' ? 'Livraisons en cours' : 'Historique des livraisons'}
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayOrders.length > 0 ? (
              displayOrders.map(order => {
                const config = statusConfig[order.statut] || statusConfig.disponible;
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-lg font-black text-orange-700">#{order.commande_id}</div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{order.client_prenom} {order.client}</p>
                          <p className="text-xs text-gray-400">📞 {order.telephone}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.articles} article{order.articles > 1 ? 's' : ''} • {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {order.prix_livraison > 0 && (
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                            🚚 {Number(order.prix_livraison).toLocaleString('fr-FR')} FCFA
                          </span>
                        )}
                        <span className="text-lg font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{Number(order.montant).toLocaleString('fr-FR')} FCFA</span>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                        {order.client_latitude && order.client_longitude && (
                          <button onClick={() => setSelectedClient(order)} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer">
                            📍 Voir sur carte
                          </button>
                        )}
                        {order.statut === 'disponible' && (
                          <button onClick={() => acceptOrder(order)} className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all cursor-pointer">
                            Accepter
                          </button>
                        )}
                        {order.statut === 'prise_en_charge' && (
                          <button onClick={() => deliveredOrder(order)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all cursor-pointer">
                            Livrée ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-5xl mb-4">{activeTab === 'available' ? '📦' : activeTab === 'active' ? '🚚' : '📋'}</p>
                <h4 className="text-base font-black text-gray-800">
                  {activeTab === 'available' ? 'Aucune commande disponible' : activeTab === 'active' ? 'Aucune livraison en cours' : 'Aucune livraison effectuée'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {activeTab === 'available' ? 'Revenez plus tard pour de nouvelles commandes' : activeTab === 'active' ? 'Acceptez une commande pour commencer' : 'Vos livraisons terminées apparaîtront ici'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
