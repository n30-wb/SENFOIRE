import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import API from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import { useI18n } from '../context/I18nContext';
import LangSelector from './LangSelector';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700',
  vendeur: 'bg-blue-100 text-blue-700',
  client: 'bg-emerald-100 text-emerald-700',
  livreur: 'bg-amber-100 text-amber-700',
  caissier: 'bg-cyan-100 text-cyan-700',
};

const statusColors = {
  en_attente: 'bg-amber-100 text-amber-700',
  payee: 'bg-blue-100 text-blue-700',
  en_preparation: 'bg-indigo-100 text-indigo-700',
  prete: 'bg-purple-100 text-purple-700',
  en_cours_livraison: 'bg-orange-100 text-orange-700',
  livree: 'bg-emerald-100 text-emerald-700',
};

const statusLabels = {
  en_attente: 'En attente',
  payee: 'Payée',
  en_preparation: 'En préparation',
  prete: 'Prête',
  en_cours_livraison: 'En livraison',
  livree: 'Livrée',
};

const inscriptionStatutColors = {
  en_attente: 'bg-amber-100 text-amber-700',
  approuve: 'bg-emerald-100 text-emerald-700',
  rejete: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const navItems = [
    { id: 'overview', label: t('nav.overview'), icon: '📊' },
    { id: 'inscriptions', label: t('nav.inscriptions'), icon: '📝' },
    { id: 'users', label: t('nav.users'), icon: '👥' },
    { id: 'stands', label: t('nav.stands'), icon: '🏪' },
    { id: 'categories', label: t('nav.categories'), icon: '🏷️' },
    { id: 'promo', label: t('nav.promo'), icon: '🎫' },
    { id: 'orders', label: t('nav.orders'), icon: '🧾' },
    { id: 'deliveries', label: t('nav.deliveries'), icon: '🚚' },
    { id: 'messages', label: t('nav.messages'), icon: '💬' },
    { id: 'retours', label: t('nav.retours'), icon: '↩️' },
  ];
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stands, setStands] = useState([]);
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({ users: 0, stands: 0, produits: 0, commandes: 0 });
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [rejetMotif, setRejetMotif] = useState('');
  const [showRejetModal, setShowRejetModal] = useState(null);
  const [createForm, setCreateForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '', password_confirmation: '', role: 'client', pseudo: '' });
  const [adminConvs, setAdminConvs] = useState([]);
  const [selectedAdminConv, setSelectedAdminConv] = useState(null);
  const [adminConvMessages, setAdminConvMessages] = useState([]);
  const [adminConvInput, setAdminConvInput] = useState('');
  const [adminConvLoading, setAdminConvLoading] = useState(false);
  const [adminMsgUnread, setAdminMsgUnread] = useState(0);
  const [retours, setRetours] = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, standsRes, prodRes, cmdRes, statsRes, inscRes, notifRes, unreadRes, msgUnreadRes] = await Promise.allSettled([
        API.get('/admin/users'),
        API.get('/admin/stands'),
        API.get('/produits'),
        API.get('/admin/commandes'),
        API.get('/admin/stats'),
        API.get('/admin/inscriptions'),
        API.get('/notifications'),
        API.get('/notifications/unread-count'),
        API.get('/messages/non-lu'),
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data?.data || []);
      if (standsRes.status === 'fulfilled') setStands(standsRes.value.data?.data || []);
      if (prodRes.status === 'fulfilled') {
        const prods = prodRes.value.data?.data || [];
        setProduits(Array.isArray(prods) ? prods : []);
      }
      if (cmdRes.status === 'fulfilled') setCommandes(cmdRes.value.data?.data || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || {});
      if (inscRes.status === 'fulfilled') setInscriptions(inscRes.value.data?.data || []);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.data || []);
      if (unreadRes.status === 'fulfilled') setUnreadCount(unreadRes.value.data?.count || 0);
      if (msgUnreadRes.status === 'fulfilled') setAdminMsgUnread(msgUnreadRes.value.data?.non_lu || 0);
    } catch { /* partial load is fine */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [notifRes, unreadRes] = await Promise.all([
          API.get('/notifications'),
          API.get('/notifications/unread-count'),
        ]);
        setNotifications(notifRes.data?.data || []);
        setUnreadCount(unreadRes.data?.count || 0);
      } catch { /* */ }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/users/${confirmDelete.id}`);
      setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
      toast.success(`${confirmDelete.nom} supprimé.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
    setConfirmDelete(null);
  };

  const handleApprouver = async (id) => {
    try {
      await API.post(`/admin/inscriptions/${id}/approuver`);
      setInscriptions(prev => prev.map(i => i.id === id ? { ...i, statut: 'approuve' } : i));
      toast.success('Inscription approuvée !');
      setSelectedInscription(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'approbation.');
    }
  };

  const handleRejeter = async () => {
    if (!showRejetModal) return;
    try {
      await API.post(`/admin/inscriptions/${showRejetModal.id}/rejeter`, { motif_rejet: rejetMotif });
      setInscriptions(prev => prev.map(i => i.id === showRejetModal.id ? { ...i, statut: 'rejete', motif_rejet: rejetMotif } : i));
      toast.success('Inscription rejetée.');
      setShowRejetModal(null);
      setRejetMotif('');
      setSelectedInscription(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du rejet.');
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/lu`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setUnreadCount(0);
    } catch { /* */ }
  };

  const loadAdminConversations = async () => {
    try {
      const res = await API.get('/conversations');
      setAdminConvs(res.data.data || []);
    } catch {}
  };

  const openAdminConversation = async (conv) => {
    setSelectedAdminConv(conv);
    try {
      const res = await API.get(`/conversations/${conv.id}/messages`);
      setAdminConvMessages(res.data.data || []);
    } catch {}
  };

  const sendAdminReply = async () => {
    if (!adminConvInput.trim() || !selectedAdminConv) return;
    setAdminConvLoading(true);
    try {
      const res = await API.post('/messages/envoyer', {
        conversation_id: selectedAdminConv.id,
        contenu: adminConvInput.trim(),
      });
      setAdminConvMessages(prev => [...prev, res.data.data]);
      setAdminConvInput('');
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setAdminConvLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      loadAdminConversations();
    }
    if (activeTab === 'retours') {
      API.get('/admin/retours').then(r => setRetours(r.data?.data || [])).catch(() => {});
    }
    if (activeTab === 'orders' || activeTab === 'overview') {
      API.get('/admin/commandes').then(r => setCommandes(r.data?.data || [])).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'messages' || !selectedAdminConv) return;
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/conversations/${selectedAdminConv.id}/messages`);
        setAdminConvMessages(res.data.data || []);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab, selectedAdminConv]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/users', createForm);
      if (res.data.success) {
        toast.success('Utilisateur créé avec succès.');
        setShowCreateUser(false);
        setCreateForm({ nom: '', prenom: '', email: '', telephone: '', password: '', password_confirmation: '', role: 'client', pseudo: '' });
        fetchAll();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de la création.');
      }
    }
  };

  const pendingInscriptions = inscriptions.filter(i => i.statut === 'en_attente');

  function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState({ nom: '', description: '' });
    const [editingCat, setEditingCat] = useState(null);
    const load = async () => { try { const r = await API.get('/categories'); setCategories(r.data.data); } catch {} };
    useEffect(() => { load(); }, []);
    const create = async () => { try { await API.post('/categories', newCat); setNewCat({ nom: '', description: '' }); toast.success('Catégorie créée'); load(); } catch { toast.error('Erreur'); } };
    const update = async () => { if (!editingCat) return; try { await API.put(`/categories/${editingCat.id}`, editingCat); setEditingCat(null); toast.success('Catégorie modifiée'); load(); } catch { toast.error('Erreur'); } };
    const [deleteCatId, setDeleteCatId] = useState(null);
    const remove = async (id) => { try { await API.delete(`/categories/${id}`); toast.success('Catégorie supprimée'); load(); } catch { toast.error('Erreur'); } };
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
        <h3 className="text-lg font-black text-gray-900 mb-6">{t('nav.categories')}</h3>
        <div className="flex gap-3 mb-6">
          <input value={newCat.nom} onChange={e => setNewCat({...newCat, nom: e.target.value})} placeholder="Nom de la catégorie" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
          <input value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} placeholder="Description" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
          <button onClick={create} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm rounded-xl cursor-pointer">{t('product.add')}</button>
        </div>
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              {editingCat?.id === c.id ? (
                <div className="flex gap-2 flex-1 items-center">
                  <input value={editingCat.nom} onChange={e => setEditingCat({...editingCat, nom: e.target.value})} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input value={editingCat.description || ''} onChange={e => setEditingCat({...editingCat, description: e.target.value})} placeholder="Description" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <button onClick={update} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer">OK</button>
                  <button onClick={() => setEditingCat(null)} className="px-4 py-2 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer">{t('common.cancel')}</button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-bold text-gray-700">{c.nom}</span>
                    {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                    <span className="text-[10px] text-gray-400">{c.produits_count || 0} produit(s)</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingCat(c)} className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer">✏️</button>
                    <button onClick={() => setDeleteCatId(c.id)} className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center cursor-pointer">🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <ConfirmDialog
          open={!!deleteCatId}
          onClose={() => setDeleteCatId(null)}
          onConfirm={() => { remove(deleteCatId); setDeleteCatId(null); }}
          title="Supprimer la catégorie ?"
          message="Les produits associés seront dissociés de cette catégorie."
          confirmText="Supprimer"
          cancelText={t('common.cancel')}
          variant="danger"
        />
      </div>
    );
  }

  function AdminPromoCodes() {
    const [promos, setPromos] = useState([]);
    const [form, setForm] = useState({ code: '', type: 'pourcentage', valeur: '', montant_min_commande: '0', utilisation_max: '', date_fin: '', est_actif: true });
    const [editingPromo, setEditingPromo] = useState(null);
    const load = async () => { try { const r = await API.get('/promo'); setPromos(r.data.data); } catch {} };
    useEffect(() => { load(); }, []);
    const submit = async () => {
      if (!form.code.trim()) { toast.error('Le code est requis'); return; }
      if (!form.valeur || form.valeur === '') { toast.error('La valeur est requise'); return; }
      try {
        const payload = {
          code: form.code.trim(),
          type: form.type,
          valeur: Number(form.valeur),
          montant_min_commande: form.montant_min_commande !== '' ? Number(form.montant_min_commande) : null,
          utilisation_max: form.utilisation_max !== '' ? Number(form.utilisation_max) : null,
          date_fin: form.date_fin !== '' ? form.date_fin : null,
          est_actif: !!form.est_actif,
        };
        if (editingPromo) { await API.put(`/promo/${editingPromo.id}`, payload); toast.success('Code promo modifié'); }
        else { await API.post('/promo', payload); toast.success('Code promo créé'); }
        setForm({ code: '', type: 'pourcentage', valeur: '', montant_min_commande: '0', utilisation_max: '', date_fin: '', est_actif: true });
        setEditingPromo(null); load();
      } catch (err) {
        const errors = err.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(err.response?.data?.message || 'Erreur lors de la création du code promo');
        }
      }
    };
    const edit = (p) => { setEditingPromo(p); setForm({ code: p.code, type: p.type, valeur: p.valeur, montant_min_commande: p.montant_min_commande, utilisation_max: p.utilisation_max || '', date_fin: p.date_fin ? p.date_fin.slice(0, 10) : '', est_actif: p.est_actif }); };
    const remove = async (id) => { try { await API.delete(`/promo/${id}`); toast.success('Supprimé'); load(); } catch { toast.error('Erreur'); } };
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8">
        <h3 className="text-lg font-black text-gray-900 mb-6">{editingPromo ? t('promo.edit') : t('promo.create')} un code promo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="CODE" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase" />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
            <option value="pourcentage">Pourcentage</option><option value="montant_fixe">Montant fixe</option>
          </select>
          <input value={form.valeur} onChange={e => setForm({...form, valeur: e.target.value})} placeholder={form.type === 'pourcentage' ? '% réduction' : 'Montant FCFA'} type="number" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
          <input value={form.date_fin} onChange={e => setForm({...form, date_fin: e.target.value})} type="date" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
        </div>
        <div className="flex gap-3 mb-6">
          <input value={form.montant_min_commande} onChange={e => setForm({...form, montant_min_commande: e.target.value})} placeholder="Montant min commande" type="number" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm w-48" />
          <input value={form.utilisation_max} onChange={e => setForm({...form, utilisation_max: e.target.value})} placeholder="Utilisations max" type="number" className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm w-48" />
          <button onClick={submit} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm rounded-xl cursor-pointer">{editingPromo ? t('promo.edit') : t('promo.create')}</button>
          {editingPromo && <button onClick={() => { setEditingPromo(null); setForm({ code: '', type: 'pourcentage', valeur: '', montant_min_commande: '0', utilisation_max: '', date_fin: '', est_actif: true }); }} className="px-5 py-2.5 bg-gray-200 text-gray-600 font-bold text-sm rounded-xl cursor-pointer">{t('common.cancel')}</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase">Code</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase">Type</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase">Valeur</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase">Utilisé</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase">Actif</th>
              <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {promos.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-4 px-4 font-bold text-sm text-gray-800">{p.code}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{p.type === 'pourcentage' ? '%' : 'FCFA'}</td>
                  <td className="py-4 px-4 text-sm font-bold text-blue-700">{Number(p.valeur).toLocaleString('fr-FR')}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{p.utilisation_count}/{p.utilisation_max || '∞'}</td>
                  <td className="py-4 px-4"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${p.est_actif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{p.est_actif ? 'Oui' : 'Non'}</span></td>
                  <td className="py-4 px-4 flex gap-2">
                    <button onClick={() => edit(p)} className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer text-xs">✏️</button>
                    <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center cursor-pointer text-xs">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex font-sans antialiased">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {confirmDelete && (
        <ConfirmDialog
          message={`Supprimer ${confirmDelete.nom} ? Cette action est irréversible.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {showRejetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-black text-gray-900">{t('admin.reject')} l'inscription</h3>
            <textarea
              value={rejetMotif}
              onChange={(e) => setRejetMotif(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Motif du rejet (optionnel)"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowRejetModal(null); setRejetMotif(''); }} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer">{t('common.cancel')}</button>
              <button onClick={handleRejeter} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer">{t('admin.reject')}</button>
            </div>
          </div>
        </div>
      )}

      {selectedInscription && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedInscription(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-black text-gray-900">Détail de l'inscription</h3>
              <button onClick={() => setSelectedInscription(null)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
                {selectedInscription.photo_cni ? (
                  <img src={`/storage/${selectedInscription.photo_cni}`} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xl">{selectedInscription.prenom?.charAt(0)}{selectedInscription.nom?.charAt(0)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-base text-gray-900">{selectedInscription.prenom} {selectedInscription.nom}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${roleColors[selectedInscription.role]}`}>{selectedInscription.role}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${inscriptionStatutColors[selectedInscription.statut]}`}>{selectedInscription.statut}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <div><span className="text-gray-400 font-bold">Email :</span> {selectedInscription.email}</div>
                  <div><span className="text-gray-400 font-bold">Tél :</span> {selectedInscription.telephone}</div>
                  {selectedInscription.pseudo && <div><span className="text-gray-400 font-bold">Pseudo :</span> {selectedInscription.pseudo}</div>}
                  {selectedInscription.cni && <div><span className="text-gray-400 font-bold">CNI :</span> {selectedInscription.cni}</div>}
                  {selectedInscription.date_naissance && <div><span className="text-gray-400 font-bold">Date naiss. :</span> {selectedInscription.date_naissance}</div>}
                  {selectedInscription.lieu_naissance && <div><span className="text-gray-400 font-bold">Lieu naiss. :</span> {selectedInscription.lieu_naissance}</div>}
                </div>
              </div>
            </div>

            {selectedInscription.role === 'vendeur' && (selectedInscription.nom_stand || selectedInscription.description_stand) && (
              <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Informations du stand</p>
                {selectedInscription.nom_stand && <p className="text-sm text-blue-900 font-bold">🏪 {selectedInscription.nom_stand}</p>}
                {selectedInscription.description_stand && <p className="text-sm text-blue-700">{selectedInscription.description_stand}</p>}
              </div>
            )}

            {selectedInscription.statut === 'en_attente' && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => handleApprouver(selectedInscription.id)} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                  ✅ Approuver
                </button>
                <button onClick={() => { setShowRejetModal(selectedInscription); setSelectedInscription(null); }} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                  ❌ Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowCreateUser(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900">{t('admin.createUser')}</h3>
            <form className="space-y-3" onSubmit={handleCreateUser}>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nom *" required value={createForm.nom} onChange={e => setCreateForm({...createForm, nom: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <input type="text" placeholder="Prénom" value={createForm.prenom} onChange={e => setCreateForm({...createForm, prenom: e.target.value})} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <input type="email" placeholder="Email *" required value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="tel" placeholder="Téléphone *" required value={createForm.telephone} onChange={e => setCreateForm({...createForm, telephone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="text" placeholder="Pseudo (si client)" value={createForm.pseudo} onChange={e => setCreateForm({...createForm, pseudo: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="client">Client</option>
                <option value="vendeur">Vendeur</option>
                <option value="livreur">Livreur</option>
                <option value="caissier">Caissier</option>
                <option value="admin">Admin</option>
              </select>
              <input type="password" placeholder="Mot de passe *" required value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="password" placeholder="Confirmer *" required value={createForm.password_confirmation} onChange={e => setCreateForm({...createForm, password_confirmation: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateUser(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-xl text-sm cursor-pointer">{t('common.confirm')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72 flex flex-col overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#312e81] via-[#4338ca] to-[#312e81]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-500/30">SF</div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight leading-none">{t('app.name')}</h2>
                <span className="text-[9px] font-bold text-purple-300/80 uppercase tracking-[0.2em]">Administration</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${activeTab === item.id ? 'bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-sm' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}>
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'inscriptions' && pendingInscriptions.length > 0 && (
                  <span className="ml-auto bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">{pendingInscriptions.length}</span>
                )}
                {item.id === 'messages' && adminMsgUnread > 0 && (
                  <span className="ml-auto bg-red-400 text-red-900 text-[10px] font-black px-2 py-0.5 rounded-full">{adminMsgUnread}</span>
                )}
                {item.id === 'retours' && retours.filter(r => r.statut === 'en_attente').length > 0 && (
                  <span className="ml-auto bg-orange-400 text-orange-900 text-[10px] font-black px-2 py-0.5 rounded-full">{retours.filter(r => r.statut === 'en_attente').length}</span>
                )}
                {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />}
              </button>
            ))}
          </nav>
          <div className="mt-4 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl space-y-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-400 to-violet-600 flex items-center justify-center font-black text-white shadow-lg ring-2 ring-white/20">{user?.nom?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-extrabold text-white text-sm truncate">{user?.nom}</p>
                <span className="text-[10px] bg-purple-400/20 text-purple-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
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
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 md:px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-900 tracking-tight">
                  Administration <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{t('app.name')}</span> 👑
                </h1>
                <p className="text-xs text-gray-400 font-medium">Gestion de la plateforme</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LangSelector />
              <button onClick={() => setShowCreateUser(true)} className="hidden sm:flex px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all cursor-pointer items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                {t('admin.createUser')}
              </button>
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-black text-sm text-gray-900">{t('message.title')}</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-foire-primary hover:text-blue-900 cursor-pointer">Tout marquer lu</button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifications.slice(0, 20).map(n => (
                          <div key={n.id} onClick={() => handleMarkNotifRead(n.id)} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.lu ? 'bg-purple-50/50' : ''}`}>
                            <p className={`text-sm ${!n.lu ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        <p className="text-3xl mb-2">🔔</p>
                        <p className="text-sm font-bold">{t('common.noData')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4338ca] via-[#7c3aed] to-[#a855f7] p-8 md:p-10 text-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t('nav.dashboard')} Admin 🎛️</h2>
              <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">
                Supervisez l'ensemble de la plateforme SENFOIRE : utilisateurs, stands, commandes et livraisons.
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Utilisateurs</p>
              <h3 className="text-2xl font-black mt-1">{stats.users || users.length}</h3>
            </div>
            <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Stands</p>
              <h3 className="text-2xl font-black mt-1">{stats.stands || stands.length}</h3>
            </div>
            <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Produits</p>
              <h3 className="text-2xl font-black mt-1">{stats.produits || produits.length}</h3>
            </div>
            <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Commandes</p>
              <h3 className="text-2xl font-black mt-1">{stats.commandes || commandes.length}</h3>
            </div>
            <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">En attente</p>
              <h3 className="text-2xl font-black mt-1">{pendingInscriptions.length}</h3>
            </div>
          </div>

          {/* INSCRIPTIONS */}
          {(activeTab === 'overview' || activeTab === 'inscriptions') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{t('nav.inscriptions')} en attente</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{pendingInscriptions.length} demande{pendingInscriptions.length !== 1 ? 's' : ''} en attente</p>
                  </div>
                </div>
                {pendingInscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {pendingInscriptions.map(i => (
                      <div key={i.id} onClick={() => setSelectedInscription(i)} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition-all">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
                          {i.photo_cni ? (
                            <img src={`/storage/${i.photo_cni}`} alt={i.nom} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-lg">{i.prenom?.charAt(0)}{i.nom?.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-gray-900">{i.prenom} {i.nom}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${roleColors[i.role]}`}>{i.role}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{i.email} • {i.telephone}</p>
                          {i.role === 'vendeur' && i.nom_stand && (
                            <p className="text-xs text-blue-500 mt-0.5 font-medium">🏪 {i.nom_stand}{i.description_stand ? ` — ${i.description_stand}` : ''}</p>
                          )}
                          {i.role === 'livreur' && i.date_naissance && (
                            <p className="text-xs text-gray-400 mt-0.5">📅 {i.date_naissance}{i.lieu_naissance ? ` — ${i.lieu_naissance}` : ''}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${inscriptionStatutColors[i.statut]}`}>{i.statut}</span>
                          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">✅</p>
                    <p className="text-sm font-bold">Aucune inscription en attente</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USERS TABLE */}
          {(activeTab === 'overview' || activeTab === 'users') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{t('nav.users')}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{users.length} compte{users.length !== 1 ? 's' : ''} sur la plateforme</p>
                  </div>
                </div>
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nom</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Téléphone</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Rôle</th>
                          <th className="text-right py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">{u.nom?.charAt(0)}</div>
                                <span className="font-bold text-sm text-gray-800">{u.nom}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-500">{u.email}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{u.telephone}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${roleColors[u.role]}`}>{u.role}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {u.role !== 'admin' && (
                                <button onClick={() => setConfirmDelete(u)} className="text-xs font-bold text-red-400 hover:text-red-600 cursor-pointer transition-colors">
                                  {t('product.delete')}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-sm font-bold">Aucun utilisateur</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STANDS TABLE */}
          {(activeTab === 'overview' || activeTab === 'stands') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">{t('nav.stands')}</h3>
                {stands.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nom</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Localisation</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vendeur</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stands.map(s => (
                          <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-sm text-gray-800">{s.nom}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{s.localisation}</td>
                            <td className="py-4 px-4 text-sm text-gray-500">{s.vendeur?.nom || 'N/A'}</td>
                            <td className="py-4 px-4 text-sm text-gray-500 max-w-xs truncate">{s.description || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">🏪</p>
                    <p className="text-sm font-bold">Aucun stand enregistré</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {activeTab === 'categories' && <AdminCategories />}

          {/* PROMO CODES */}
          {activeTab === 'promo' && <AdminPromoCodes />}

          {/* PRODUITS TABLE */}
          {(activeTab === 'overview' || activeTab === 'stands') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">{t('nav.produits')} de la plateforme</h3>
                {produits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nom</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Prix</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produits.map(p => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-sm text-gray-800">{p.nom}</td>
                            <td className="py-4 px-4 text-sm font-bold text-blue-700">{Number(p.prix).toLocaleString('fr-FR')} FCFA</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{p.stock}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${p.disponibilite ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {p.disponibilite ? 'Disponible' : 'Indisponible'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-sm font-bold">Aucun produit sur la plateforme</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TABLE */}
          {(activeTab === 'overview' || activeTab === 'orders') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">{t('nav.orders')}</h3>
                {commandes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paiement</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                          <th className="text-left py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commandes.map(cmd => (
                          <tr key={cmd.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-sm text-gray-800">#{cmd.id}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{cmd.client?.nom || 'N/A'}</td>
                            <td className="py-4 px-4 text-sm font-bold text-blue-700">{Number(cmd.montant_total).toLocaleString('fr-FR')} FCFA</td>
                            <td className="py-4 px-4 text-sm text-gray-500 capitalize">{cmd.mode_paiement}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${statusColors[cmd.statut] || 'bg-gray-100 text-gray-500'}`}>
                                {statusLabels[cmd.statut] || cmd.statut}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-400">{new Date(cmd.created_at).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-b from-gray-50/50 to-white border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-4xl mb-3">🧾</p>
                    <p className="text-sm font-bold text-gray-600">{t('order.empty')}</p>
                    <p className="text-xs text-gray-400 mt-1">Les commandes apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RETOURS */}
          {activeTab === 'retours' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-black text-gray-900 mb-6">Demandes de retour / remboursement</h3>
                {retours.length > 0 ? (
                  <div className="space-y-4">
                    {retours.map(r => (
                      <div key={r.id} className={`rounded-2xl border-2 p-6 transition-all ${
                        r.statut === 'en_attente' ? 'border-amber-200 bg-amber-50/50' :
                        r.statut === 'approuve' ? 'border-emerald-200 bg-emerald-50/50' :
                        r.statut === 'refuse' ? 'border-red-200 bg-red-50/50' :
                        'border-blue-200 bg-blue-50/50'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-lg">#{r.id}</div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{r.produit?.nom}</p>
                              <p className="text-xs text-gray-400">Commande #{r.commande_id}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${
                            r.statut === 'approuve' ? 'bg-emerald-100 text-emerald-700' :
                            r.statut === 'refuse' ? 'bg-red-100 text-red-700' :
                            r.statut === 'rembourse' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>{r.statut?.replace(/_/g, ' ')}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <span className="text-lg">👤</span>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Client</p>
                              <p className="text-xs font-bold text-gray-700">{r.client?.prenom} {r.client?.nom}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <span className="text-lg">📦</span>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Quantité</p>
                              <p className="text-xs font-bold text-gray-700">{r.quantite} unité(s)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <span className="text-lg">📋</span>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Motif</p>
                              <p className="text-xs font-bold text-gray-700 capitalize">{r.motif?.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                            <span className="text-lg">📅</span>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">Date</p>
                              <p className="text-xs font-bold text-gray-700">{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'}</p>
                            </div>
                          </div>
                        </div>

                        {r.description && (
                          <div className="p-3 bg-white rounded-xl border border-gray-100 mb-4">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description du client</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{r.description}</p>
                          </div>
                        )}

                        {r.statut !== 'en_attente' && r.decision_admin && (
                          <div className="p-3 bg-white rounded-xl border border-gray-100 mb-4">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Note admin</p>
                            <p className="text-xs text-gray-600">{r.decision_admin}</p>
                          </div>
                        )}

                        {r.statut === 'en_attente' ? (
                          <div className="border-t border-gray-200 pt-4 space-y-3">
                            <div className="flex gap-2">
                              {[
                                { key: 'approuve', label: 'Approuver', icon: '✅', color: 'emerald' },
                                { key: 'refuse', label: 'Refuser', icon: '❌', color: 'red' },
                                { key: 'rembourse', label: 'Rembourser', icon: '💰', color: 'blue' },
                              ].map(opt => (
                                <button key={opt.key}
                                  onClick={() => setRetours(prev => prev.map(item => item.id === r.id ? { ...item, _decision: opt.key } : (item.id !== r.id ? { ...item, _decision: undefined } : item)))}
                                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                                    r._decision === opt.key
                                      ? `bg-${opt.color}-500 text-white shadow-lg shadow-${opt.color}-500/25`
                                      : `bg-${opt.color}-50 text-${opt.color}-700 hover:bg-${opt.color}-100`
                                  }`}>
                                  <span>{opt.icon}</span>
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                            {r._decision && (
                              <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100">
                                {r._decision === 'rembourse' && (
                                  <input type="number" placeholder="Montant remboursement (FCFA)"
                                    value={r._montant || ''}
                                    onChange={e => setRetours(prev => prev.map(item => item.id === r.id ? { ...item, _montant: e.target.value } : item))}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                                )}
                                <textarea placeholder="Note admin (optionnel)"
                                  value={r._note || ''}
                                  onChange={e => setRetours(prev => prev.map(item => item.id === r.id ? { ...item, _note: e.target.value } : item))}
                                  rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none" />
                                <div className="flex gap-2">
                                  <button onClick={() => setRetours(prev => prev.map(item => item.id === r.id ? { ...item, _decision: undefined, _montant: '', _note: '' } : item))}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">Annuler</button>
                                  <button onClick={async () => {
                                    try {
                                      await API.put(`/admin/retours/${r.id}/decision`, {
                                        statut: r._decision,
                                        decision_admin: r._note || undefined,
                                        montant_remboursement: r._decision === 'rembourse' ? Number(r._montant) : undefined,
                                      });
                                      setRetours(prev => prev.map(item => item.id === r.id ? { ...item, statut: r._decision, decision_admin: r._note, montant_remboursement: r._decision === 'rembourse' ? r._montant : undefined, _decision: undefined, _montant: '', _note: '' } : item));
                                      toast.success('Décision enregistrée.');
                                    } catch (err) {
                                      toast.error(err.response?.data?.message || 'Erreur.');
                                    }
                                  }} className="flex-1 py-2.5 bg-purple-500 text-white font-bold rounded-xl text-sm cursor-pointer hover:bg-purple-600 transition-all">Confirmer</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : r.statut === 'rembourse' && r.montant_remboursement ? (
                          <div className="border-t border-gray-200 pt-3">
                            <p className="text-xs text-blue-600 font-bold">💰 Remboursé : {Number(r.montant_remboursement).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-3">↩️</p>
                    <p className="text-sm font-bold">Aucune demande de retour</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MESSAGES (Admin side) */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="w-80 border-r border-gray-100 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-black text-gray-900">{t('message.title')}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">{adminConvs.length} conversation{adminConvs.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {adminConvs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">{t('message.empty')}</div>
                  ) : (
                    adminConvs.map(c => (
                      <button key={c.id} onClick={() => openAdminConversation(c)}
                        className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${selectedAdminConv?.id === c.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-xs font-bold text-purple-700">
                            {c.client?.prenom?.charAt(0)}{c.client?.nom?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{c.client?.prenom} {c.client?.nom}</p>
                            {c.dernierMessage && <p className="text-[10px] text-gray-400 truncate">{c.dernierMessage.contenu}</p>}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                {!selectedAdminConv ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <p>Sélectionnez une conversation</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                          {selectedAdminConv.client?.prenom?.charAt(0)}{selectedAdminConv.client?.nom?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{selectedAdminConv.client?.prenom} {selectedAdminConv.client?.nom}</p>
                          <p className="text-[10px] text-gray-400">{selectedAdminConv.client?.telephone || selectedAdminConv.client?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {adminConvMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender_id === user?.id ? 'bg-purple-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-700 rounded-bl-md'}`}>
                            <p className="text-[10px] font-bold opacity-60 mb-1">{msg.sender_id === user?.id ? 'Vous' : `${msg.sender?.prenom} ${msg.sender?.nom}`}</p>
                            <p className="text-sm">{msg.contenu}</p>
                            <p className="text-[9px] opacity-50 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex gap-3">
                        <input
                          value={adminConvInput}
                          onChange={e => setAdminConvInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminReply(); } }}
                          placeholder={t('message.placeholder')}
                          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                        <button
                          onClick={sendAdminReply}
                          disabled={adminConvLoading || !adminConvInput.trim()}
                          className="px-5 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {adminConvLoading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
