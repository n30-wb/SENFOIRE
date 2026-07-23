import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import API from '../services/api';
import { useI18n } from '../context/I18nContext';
import LangSelector from './LangSelector';

const paymentMethodIcons = {
  Wave: '💳',
  'Orange Money': '🟠',
  Espèces: '💵',
};

const paymentMethodColors = {
  Wave: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Orange Money': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Espèces: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function CaissierDashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useI18n();

  const navItems = [
    { id: 'pending', label: t('caissier.pending'), icon: '⏳' },
    { id: 'history', label: t('caissier.history'), icon: '📋' },
  ];

  const [activeTab, setActiveTab] = useState('pending');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [validatedOrders, setValidatedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/caissier/commandes-en-attente');
      setPendingOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/caissier/historique');
      setValidatedOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') fetchPending();
    else fetchHistory();
  }, [activeTab, fetchPending, fetchHistory]);

  const validatePayment = async (order) => {
    try {
      setValidatingId(order.id);
      await API.post(`/caissier/valider-paiement/${order.id}`);
      toast.success(t('caissier.paymentValidated'));
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation.');
    } finally {
      setValidatingId(null);
    }
  };

  const displayOrders = activeTab === 'pending' ? pendingOrders : validatedOrders;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex font-sans antialiased text-white">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-72 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a3e] via-[#0f1629] to-[#0a0f1e]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 p-6 space-y-8 flex-1 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/30">SF</div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-none">{t('app.name')}</h2>
                  <span className="text-[9px] font-bold text-emerald-300/80 uppercase tracking-[0.2em]">Espace Caissier</span>
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
                  {item.id === 'pending' && pendingOrders.length > 0 && <span className="ml-auto bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">{pendingOrders.length}</span>}
                  {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-black text-white shadow-lg ring-2 ring-white/20">{user?.prenom?.charAt(0).toUpperCase() || user?.nom?.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="font-extrabold text-white text-sm truncate">{user?.prenom} {user?.nom}</p>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">{user?.role}</span>
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
        <div className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 md:px-10 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-all cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">
                  {t('nav.dashboard')}, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user?.prenom || user?.nom}</span> 💰
                </h1>
                <p className="text-xs text-white/40 font-medium">{activeTab === 'pending' ? t('caissier.pending') : t('caissier.history')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LangSelector />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#16a34a] via-[#059669] to-[#14b8a6] p-8 md:p-10 text-white">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{t('caissier.pending')} ⏳</h2>
                <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">Validez les paiements des commandes de la foire SENFOIRE.</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-amber-300">{pendingOrders.length}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{t('caissier.pending')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                  <p className="text-2xl font-black text-emerald-300">{validatedOrders.length}</p>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{t('caissier.history')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ORDERS LIST */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white">
              {activeTab === 'pending' ? t('caissier.pending') : t('caissier.history')}
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white/5 rounded-2xl border border-white/10 p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-3 bg-white/10 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayOrders.length > 0 ? (
              displayOrders.map(order => (
                <div key={order.id} className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-sm hover:shadow-lg hover:shadow-black/20 transition-all backdrop-blur-sm">
                  <div className="flex flex-col gap-4">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-lg font-black text-emerald-400 border border-emerald-500/20">#{order.id}</div>
                        <div>
                          <p className="font-bold text-sm text-white">{order.client_prenom} {order.client_nom}</p>
                          <p className="text-xs text-white/40">📞 {order.client_telephone || order.telephone}</p>
                          <p className="text-xs text-white/40 mt-0.5">{formatDate(order.date_commande || order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          {Number(order.montant_reduction || 0) > 0 ? (
                            <>
                              <span className="line-through text-white/30 text-sm mr-2">{Number(order.montant_total || 0).toLocaleString('fr-FR')}</span>
                              {Number(order.montant_total_apres_reduction || 0).toLocaleString('fr-FR')}
                            </>
                          ) : Number(order.montant_total || order.montant || 0).toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${paymentMethodColors[order.mode_paiement] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {paymentMethodIcons[order.mode_paiement] || '💰'} {order.mode_paiement}
                        </span>
                        {activeTab === 'history' && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {t('caissier.paymentValidated')}
                          </span>
                        )}
                        {activeTab === 'pending' && (
                          <button onClick={() => validatePayment(order)} disabled={validatingId === order.id} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {validatingId === order.id ? '...' : t('caissier.validatePayment')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Discount info */}
                    {Number(order.montant_reduction || 0) > 0 && (
                      <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Réduction appliquée</p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {order.promo_code && (
                            <span className="flex items-center gap-1.5 text-amber-300">
                              🏷️ Code promo <span className="font-bold">{order.promo_code.code}</span>
                              {order.promo_code.type === 'pourcentage' ? (
                                <span className="text-amber-400/70">(-{order.promo_code.valeur}%)</span>
                              ) : (
                                <span className="text-amber-400/70">(-{Number(order.promo_code.valeur).toLocaleString('fr-FR')} FCFA)</span>
                              )}
                            </span>
                          )}
                          {order.fidelite_points_used > 0 && (
                            <span className="flex items-center gap-1.5 text-amber-300">
                              ⭐ Points fidélité <span className="font-bold">{order.fidelite_points_used} pts</span>
                              <span className="text-amber-400/70">(-{Number(order.fidelite_points_used * 10).toLocaleString('fr-FR')} FCFA)</span>
                            </span>
                          )}
                          <span className="font-bold text-amber-300">
                            Total réduction : -{Number(order.montant_reduction).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Items list */}
                    {order.articles && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">{t('caissier.items')}</p>
                        <div className="space-y-2">
                          {(Array.isArray(order.articles) ? order.articles : []).map((article, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-white/80 font-medium">{article.produit_nom || article.nom || article.name}</span>
                                <span className="text-white/30 text-xs">×{article.quantite || article.quantity || 1}</span>
                              </div>
                              {article.stand_nom && <span className="text-[10px] text-white/30 font-medium">📍 {article.stand_nom}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stands involved */}
                    {order.stands && order.stands.length > 0 && (
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-3">{t('caissier.stands')}</p>
                        <div className="flex flex-wrap gap-2">
                          {[...new Set(order.stands)].map((stand, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-white/60">
                              📍 {typeof stand === 'string' ? stand : stand.nom || stand.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-5xl mb-4">{activeTab === 'pending' ? '⏳' : '📋'}</p>
                <h4 className="text-base font-black text-white/80">
                  {activeTab === 'pending' ? t('caissier.noPending') : 'Aucun historique'}
                </h4>
                <p className="text-xs text-white/30 mt-1">
                  {activeTab === 'pending' ? 'Aucune commande en attente de validation' : 'Vos paiements validés apparaîtront ici'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
