import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

export default function VisiteurCatalogue() {
    const navigate = useNavigate();
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const fetchProduits = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await API.get('/produits');
            const data = response.data?.data || response.data;
            setProduits(Array.isArray(data) ? data : []);
        } catch {
            setError("Impossible de charger les produits.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProduits(); }, [fetchProduits]);

    const filtered = produits.filter(p =>
        p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCommander = () => {
        setShowAuthModal(true);
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] font-sans antialiased">
            {/* HEADER */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#7c3aed] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-900/20">
                                SF
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#1e3a8a] tracking-tight leading-none">
                                    SEN<span className="text-[#7c3aed]">FOIRE</span>
                                </h1>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Mode Visiteur</span>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] text-xs font-bold rounded-xl hover:bg-blue-50 transition-all"
                        >
                            Se connecter
                        </Link>
                        <Link
                            to="/inscription"
                            className="px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#7c3aed] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </div>

            {/* HERO */}
            <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#7c3aed] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                            Explorez la foire SENFOIRE 🌍
                        </h2>
                        <p className="text-white/70 mt-3 text-sm leading-relaxed">
                            Découvrez des milliers de produits proposés par nos vendeurs du monde entier.
                            Trouvez ce dont vous avez besoin et commandez en quelques clics.
                        </p>
                        <div className="mt-6 flex items-center gap-4 text-white/60 text-xs font-bold">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                {produits.length} produits disponibles
                            </span>
                            <span>|</span>
                            <span>Livraison rapide</span>
                            <span>|</span>
                            <span>Paiement sécurisé</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* SEARCH */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
                    <div className="relative max-w-md">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all"
                        />
                    </div>
                </div>

                {/* PRODUCTS GRID */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Tous les produits</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {filtered.length} produit{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <div key={n} className="border border-gray-100 rounded-2xl p-4 space-y-4 animate-pulse bg-white">
                                    <div className="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl" />
                                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
                            <p className="text-sm font-bold text-red-700">{error}</p>
                            <button onClick={fetchProduits} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-all cursor-pointer">
                                Réessayer
                            </button>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    visitorMode
                                    onCommander={handleCommander}
                                />
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
                            <h4 className="text-sm font-bold text-gray-600">Aucun résultat</h4>
                            <p className="text-xs text-gray-400 mt-1">Aucun produit ne correspond à "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
                            <h4 className="text-sm font-bold text-gray-600">Aucun produit disponible</h4>
                            <p className="text-xs text-gray-400 mt-1">Revenez plus tard, les vendeurs sont en train de préparer leurs stands !</p>
                        </div>
                    )}
                </div>

                {/* CTA BANNER */}
                <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#7c3aed] rounded-3xl p-8 md:p-10 text-white text-center">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight">Prêt à commander ? 🛒</h3>
                    <p className="text-white/70 text-sm mt-2 max-w-md mx-auto">
                        Connectez-vous ou créez un compte client pour passer vos commandes et suivre vos livraisons.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <Link
                            to="/login"
                            className="px-6 py-3 bg-white text-[#1e3a8a] text-xs font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Se connecter
                        </Link>
                        <Link
                            to="/inscription"
                            className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-all"
                        >
                            Créer un compte
                        </Link>
                    </div>
                </div>
            </div>

            {/* AUTH MODAL */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 space-y-6">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1e3a8a] to-[#7c3aed] rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg mx-auto">
                                SF
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mt-4">Connexion requise</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Pour commander ce produit, vous devez avoir un compte client.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="block w-full py-3 px-4 bg-gradient-to-r from-[#1e3a8a] to-blue-800 hover:from-blue-900 hover:to-blue-900 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl text-center transition-all"
                            >
                                Se connecter
                            </Link>
                            <Link
                                to="/inscription"
                                className="block w-full py-3 px-4 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] text-xs font-bold rounded-xl hover:bg-blue-50 text-center transition-all"
                            >
                                Créer un compte client
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
