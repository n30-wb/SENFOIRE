import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import API from '../services/api';
import ProductCard from './ProductCard';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ConfirmDialog from './ConfirmDialog';
import NotificationBell from './NotificationBell';
import ReviewsList from './ReviewsList';
import StarRating from './StarRating';
import LocationPicker from './LocationPicker';
import { useI18n } from '../context/I18nContext';
import LangSelector from './LangSelector';

const StatCard = ({ icon, title, value, trend, gradient, delay }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-default"
    style={{ background: gradient, animationDelay: `${delay}ms` }}
  >
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
    <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
    <div className="relative z-10">
      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">{title}</p>
      <div className="flex items-baseline justify-between mt-1">
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default function VendeurDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: '📊' },
    { id: 'stats', label: 'Stats', icon: '📈' },
    { id: 'stand', label: t('nav.stand'), icon: '🏪' },
    { id: 'produits', label: t('nav.produits'), icon: '📦' },
    { id: 'commandes', label: t('nav.commandes'), icon: '🧾' },
    { id: 'messages', label: t('nav.messages'), icon: '💬' },
  ];
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProduits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/mes-produits');
      const data = response.data?.data || response.data;
      setProduits(Array.isArray(data) ? data : []);
    } catch {
      setError("Impossible de charger vos articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProduits = useCallback(async () => {
    try {
      const response = await API.get('/mes-produits');
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) setProduits(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchProduits(); }, [fetchProduits]);

  const handleNewProduct = useCallback((p) => {
    if (!p) return;
    setProduits(prev => [p, ...prev]);
    refreshProduits();
  }, [refreshProduits]);

  const handleUpdatedProduct = useCallback((p) => {
    if (!p) return;
    setProduits(prev => prev.map(x => x.id === p.id ? { ...x, ...p } : x));
  }, []);

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    try {
      await API.delete(`/produits/${deleteProduct.id}`);
      setProduits(prev => prev.filter(p => p.id !== deleteProduct.id));
      toast.success('Produit supprimé.');
      setDeleteProduct(null);
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const [commandes, setCommandes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [standInfo, setStandInfo] = useState(null);
  const [editingStand, setEditingStand] = useState(false);
  const [standForm, setStandForm] = useState({ nom: '', description: '', localisation: '', latitude: null, longitude: null });
  const [standLogo, setStandLogo] = useState(null);
  const [standLogoPreview, setStandLogoPreview] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);

  useEffect(() => {
    if (activeNav === 'commandes') {
      API.get('/mes-commandes').then(r => setCommandes(r.data.data || [])).catch(e => { console.error('Erreur commandes vendeur:', e?.response?.data || e.message); });
    }
    if (activeNav === 'messages') {
      loadConversations();
    }
    if (activeNav === 'stats') {
      API.get('/vendeur/stats').then(r => setVendorStats(r.data?.data || null)).catch(() => {});
    }
  }, [activeNav]);

  useEffect(() => {
    API.get('/mes-produits').then(r => {
      const data = r.data?.data || r.data;
      if (Array.isArray(data) && data.length > 0 && data[0].stand) {
        const s = data[0].stand;
        setStandInfo(s);
        setStandForm({ nom: s.nom, description: s.description || '', localisation: s.localisation || '', latitude: s.latitude || null, longitude: s.longitude || null });
        if (s.logo) setStandLogoPreview(`http://127.0.0.1:8000/storage/${s.logo}`);
      }
    }).catch(() => {});

    API.get('/mon-stand').then(r => {
      const s = r.data?.data;
      if (s) {
        setStandInfo(s);
        setStandForm({ nom: s.nom, description: s.description || '', localisation: s.localisation || '', latitude: s.latitude || null, longitude: s.longitude || null });
        if (s.logo) setStandLogoPreview(`http://127.0.0.1:8000/storage/${s.logo}`);
      }
    }).catch(() => {});
  }, []);

  const loadConversations = async () => {
    try {
      const res = await API.get('/conversations');
      setMessages(res.data.data);
    } catch {}
  };

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const res = await API.get(`/conversations/${conv.id}/messages`);
      setConvMessages(res.data.data);
    } catch {}
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConv) return;
    try {
      const res = await API.post('/messages/envoyer', { conversation_id: selectedConv.id, contenu: messageInput.trim() });
      setConvMessages(prev => [...prev, res.data.data]);
      setMessageInput('');
    } catch {}
  };

  const handleSaveStand = async () => {
    try {
      const formData = new FormData();
      formData.append('nom', standForm.nom);
      formData.append('description', standForm.description);
      formData.append('localisation', standForm.localisation);
      if (standForm.latitude) formData.append('latitude', standForm.latitude);
      if (standForm.longitude) formData.append('longitude', standForm.longitude);
      if (standLogo) formData.append('logo', standLogo);

      let res;
      if (standInfo?.id) {
        res = await API.put(`/stands/${standInfo.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await API.post('/mon-stand', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      const updatedStand = res.data?.data;
      if (updatedStand) {
        setStandInfo(updatedStand);
        if (updatedStand.logo) setStandLogoPreview(`http://127.0.0.1:8000/storage/${updatedStand.logo}`);
      }
      setEditingStand(false);
      setStandLogo(null);
      toast.success(standInfo?.id ? 'Stand mis à jour !' : 'Stand créé !');
    } catch { toast.error('Erreur lors de la sauvegarde du stand.'); }
  };

  const filtered = produits.filter(p =>
    p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = produits.reduce((s, p) => s + (p.stock || 0), 0);
  const dispCount = produits.filter(p => p.disponibilite).length;

  function CommandesVendeur() {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
        <h3 className="text-lg font-black text-gray-900 mb-6">{t('nav.commandes')}</h3>
        {commandes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('order.empty')}</div>
        ) : (
          <div className="space-y-4">
            {commandes.map(cmd => (
              <div key={cmd.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-gray-700">{t('order.number')}{cmd.id}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    cmd.statut === 'livree' ? 'bg-emerald-100 text-emerald-700' :
                    cmd.statut === 'en_cours_livraison' ? 'bg-orange-100 text-orange-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{cmd.statut?.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Client: {cmd.client?.nom} {cmd.client?.prenom}</p>
                <p className="text-sm font-bold text-gray-700">{Number(cmd.montant_total).toLocaleString('fr-FR')} FCFA</p>
                <div className="mt-2 space-y-1">
                  {cmd.lignes?.map(l => (
                    <p key={l.id} className="text-xs text-gray-400">x{l.quantite} {l.produit?.nom}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function MessagesVendeur() {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex h-[600px]">
        <div className="w-80 border-r border-gray-100 p-4 overflow-y-auto">
          <h3 className="text-lg font-black text-gray-900 mb-4">{t('message.title')}</h3>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('message.empty')}</p>
          ) : messages.map(conv => (
            <button key={conv.id} onClick={() => openConversation(conv)}
              className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer mb-2 ${
                selectedConv?.id === conv.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
              }`}>
              <p className="text-sm font-bold text-gray-700">{conv.client?.prenom} {conv.client?.nom}</p>
              <p className="text-xs text-gray-400 truncate">{conv.dernier_message?.contenu || 'Commencez une conversation'}</p>
              {conv.commande && <p className="text-[10px] text-gray-400 mt-1">{t('order.number')}{conv.commande.id}</p>}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {convMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <p className="text-sm">{msg.contenu}</p>
                      <p className="text-[10px] mt-1 opacity-60">{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <input value={messageInput} onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={t('message.placeholder')} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <button onClick={sendMessage} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-50" disabled={!messageInput.trim()}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">{t('message.empty')}</div>
          )}
        </div>
      </div>
    );
  }

  function StandEditor() {
    if (!standInfo && !editingStand) {
      return (
        <div className="mt-6 text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="text-4xl mb-4">🏪</div>
          <h4 className="font-bold text-gray-700 mb-2">Aucun stand configuré</h4>
          <p className="text-sm text-gray-400 mb-5">Créez votre stand pour commencer à vendre.</p>
          <button onClick={() => setEditingStand(true)} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-200 transition-all">Créer mon stand</button>
        </div>
      );
    }
    return (
      <div className="mt-6">
        {editingStand ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Logo du stand</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0];
                    if (file) { setStandLogo(file); setStandLogoPreview(URL.createObjectURL(file)); }
                  }} className="hidden" id="stand-logo-upload" />
                  <label htmlFor="stand-logo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer overflow-hidden">
                    {standLogoPreview ? (
                      <img src={standLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-xs text-gray-400 font-medium">Cliquez pour ajouter un logo</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nom du stand *</label>
                  <input value={standForm.nom} onChange={e => setStandForm({...standForm, nom: e.target.value})} placeholder="Nom du stand" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea value={standForm.description} onChange={e => setStandForm({...standForm, description: e.target.value})} placeholder="Décrivez votre stand..." rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Adresse / Localisation</label>
                  <input value={standForm.localisation} onChange={e => setStandForm({...standForm, localisation: e.target.value})} placeholder="Ex: Marché Sandaga, Dakar" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">📍 Position GPS du stand</label>
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <LocationPicker
                  initialPosition={standForm.latitude && standForm.longitude ? [standForm.latitude, standForm.longitude] : null}
                  onLocationSelected={(lat, lng) => setStandForm({...standForm, latitude: lat, longitude: lng})}
                />
              </div>
              {standForm.latitude && standForm.longitude && (
                <p className="text-[10px] text-gray-400 mt-1.5">Coordonnées : {standForm.latitude.toFixed(6)}, {standForm.longitude.toFixed(6)}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveStand} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-200 transition-all">{t('common.save')}</button>
              <button onClick={() => { setEditingStand(false); setStandLogo(null); if (standInfo?.logo) setStandLogoPreview(`http://127.0.0.1:8000/storage/${standInfo.logo}`); else setStandLogoPreview(null); }} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl cursor-pointer transition-all">{t('common.cancel')}</button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-start gap-5">
              {standInfo.logo ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100">
                  <img src={`http://127.0.0.1:8000/storage/${standInfo.logo}`} alt={standInfo.nom} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0">
                  <span className="text-3xl">🏪</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-base text-gray-900">{standInfo.nom}</h4>
                <p className="text-sm text-gray-500 mt-1">{standInfo.description || 'Aucune description'}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">📍 {standInfo.localisation || 'Non définie'}</span>
                  {standInfo.latitude && standInfo.longitude && (
                    <span className="text-xs text-gray-400">🗺️ GPS actif</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setEditingStand(true)} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-200 transition-all">{t('product.edit')} le stand</button>
          </div>
        )}
      </div>
    );
  }

  function CatalogueSection() {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Mes Produits</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={t('common.search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400" />
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} onEdit={setEditProduct} onDelete={setDeleteProduct} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 text-sm">{t('common.noData')}</div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex font-sans antialiased">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative z-10 p-6 space-y-8 flex-1 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/30">
                  SF
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-none">{t('app.name')}</h2>
                  <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-[0.2em]">Espace Vendeur</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    activeNav === item.id
                      ? 'bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-sm'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  {activeNav === item.id && <span className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20 ring-2 ring-white/20">
                {user?.nom?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-extrabold text-white text-sm truncate">{user?.nom}</p>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
            <button onClick={logout} className="w-full py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* HEADER */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">
                  Bonjour, <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">{user?.nom}</span> 👋
                </h1>
                <p className="text-xs text-gray-400 font-medium">Voici le résumé de votre stand virtuel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LangSelector />
              <NotificationBell />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="hidden sm:flex px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                {t('product.add')}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="sm:hidden w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#7c3aed] p-8 md:p-10 text-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Dalal ak jamm ! 🌟</h2>
                <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">
                  Pilotez votre stand virtuel, gérez vos produits et suivez vos performances en temps réel sur la foire SENFOIRE.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black">{produits.length}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Produits</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black">{totalStock}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">En stock</p>
                </div>
              </div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              icon="📦"
              title="Total Produits"
              value={produits.length}
              gradient="linear-gradient(135deg, #2563eb, #1d4ed8)"
              delay={0}
            />
            <StatCard
              icon="✅"
              title="Disponibles"
              value={dispCount}
              trend={produits.length > 0 ? `${Math.round((dispCount / produits.length) * 100)}%` : null}
              gradient="linear-gradient(135deg, #10b981, #059669)"
              delay={100}
            />
            <StatCard
              icon="💰"
              title="Stock Total"
              value={totalStock.toLocaleString('fr-FR')}
              gradient="linear-gradient(135deg, #f59e0b, #d97706)"
              delay={200}
            />
          </div>

          {activeNav === 'commandes' && <CommandesVendeur />}
          {activeNav === 'stats' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 mb-6">Statistiques du stand</h3>
              {vendorStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase">CA Total</p>
                      <p className="text-xl font-black text-blue-700">{Number(vendorStats.chiffre_affaires_total).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">CA Mois</p>
                      <p className="text-xl font-black text-emerald-700">{Number(vendorStats.chiffre_affaires_mois).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-bold text-amber-400 uppercase">Commandes</p>
                      <p className="text-xl font-black text-amber-700">{vendorStats.nb_commandes_total}</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-bold text-purple-400 uppercase">Note moyenne</p>
                      <p className="text-xl font-black text-purple-700">{vendorStats.note_moyenne}/5</p>
                      <p className="text-[10px] text-purple-400">{vendorStats.nb_avis} avis</p>
                    </div>
                  </div>

                  {vendorStats.produits_vendus?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Produits les plus vendus</h4>
                      <div className="space-y-2">
                        {vendorStats.produits_vendus.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="text-lg font-black text-gray-300 w-6 text-center">{i + 1}</span>
                            <span className="text-sm font-bold text-gray-800 flex-1">{p.nom}</span>
                            <span className="text-xs font-bold text-blue-600">{p.total_vendu} vendus</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {vendorStats.commandes_recentes?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Commandes récentes</h4>
                      <div className="space-y-2">
                        {vendorStats.commandes_recentes.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <span className="text-sm font-bold text-gray-800">#{c.id}</span>
                              <span className="text-xs text-gray-400 ml-2">{c.prenom} {c.nom}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-800">{Number(c.montant_total).toLocaleString('fr-FR')} FCFA</p>
                              <p className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">Chargement des statistiques...</div>
              )}
            </div>
          )}
          {activeNav === 'messages' && <MessagesVendeur />}
          {activeNav === 'stand' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
              <h3 className="text-lg font-black text-gray-900 mb-4">{t('nav.stand')}</h3>
              <p className="text-sm text-gray-500">Gérez les informations de votre stand ici.</p>
              <StandEditor onUpdated={refreshProduits} />
            </div>
          )}
          {activeNav === 'produits' && <CatalogueSection />}

          {/* CATALOGUE */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Mon Catalogue</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{filtered.length} article{filtered.length !== 1 ? 's' : ''} sur votre stand</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="border border-gray-100 rounded-2xl p-4 space-y-4 animate-pulse bg-white">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl" />
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
                  <p className="text-sm font-bold text-red-700">{error}</p>
                  <button onClick={fetchProduits} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-all cursor-pointer">{t('common.retry')}</button>
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(product => (
                    <ProductCard key={product.id} product={product} onEdit={setEditProduct} onDelete={setDeleteProduct} />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
                  <h4 className="text-sm font-bold text-gray-600">Aucun résultat</h4>
                  <p className="text-xs text-gray-400 mt-1">Aucun produit ne correspond à "{searchQuery}"</p>
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-b from-amber-50/50 to-white border-2 border-dashed border-amber-200 rounded-2xl">
                  <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl">🏪</div>
                  <h4 className="text-base font-black text-gray-800">Votre vitrine est prête à briller !</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
                    Ajoutez votre premier produit pour commencer à vendre sur la foire SENFOIRE.
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Ajouter mon premier produit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onProductAdded={handleNewProduct} toast={toast} />
      <EditProductModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onProductUpdated={handleUpdatedProduct} toast={toast} />
      <ConfirmDialog isOpen={!!deleteProduct} title="Supprimer le produit" message={`Supprimer "${deleteProduct?.nom}" ? Cette action est irréversible.`} onConfirm={handleDeleteProduct} onCancel={() => setDeleteProduct(null)} danger />
    </div>
  );
}
