import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuroraBackground from '../components/AuroraBackground';
import { useI18n } from '../context/I18nContext';
import LangSelector from '../components/LangSelector';

export default function Login() {
    const [identifiant, setIdentifiant] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useI18n();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = await login(identifiant, password);

            if (result && result.success) {
                const userRole = result.role?.toLowerCase().trim();

                if (userRole === 'admin') {
                    navigate('/admin-dashboard');
                } else if (userRole === 'vendeur') {
                    navigate('/vendeur-dashboard');
                } else if (userRole === 'client') {
                    navigate('/client-dashboard');
                } else if (userRole === 'livreur') {
                    navigate('/livreur-dashboard');
                } else if (userRole === 'caissier') {
                    navigate('/caissier-dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError(result.message || "Erreur lors de la connexion");
                setIsSubmitting(false);
            }
        } catch (err) {
            setError("Une erreur inattendue est survenue.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0a0f1e] relative">
            <div className="absolute top-4 right-4 z-50">
                <LangSelector />
            </div>
            {/* LEFT PANEL - Branding */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#3b0764] to-[#1e1b4b]" />
                <AuroraBackground colors="blue" />

                <div className="relative z-10 px-12 max-w-lg">
                    <div className="flex items-center gap-4 mb-10 animate-slide-in-field field-stagger-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-30 animate-pulse-glow" />
                            <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white font-black text-2xl shadow-2xl">
                                SF
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                SEN<span className="text-purple-300">FOIRE</span>
                            </h1>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">{t('app.subtitle')}</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight mb-4 animate-slide-in-field field-stagger-2">
                        Bienvenue sur<br />
                        <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">votre marketplace</span>
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-10 animate-slide-in-field field-stagger-3">
                        Connectez-vous pour accéder à votre espace personnalisé et découvrir des milliers de produits.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: '🌍', text: 'Des vendeurs du monde entier', color: 'from-blue-500/10 to-purple-500/10', border: 'border-blue-500/10' },
                            { icon: '🚚', text: 'Livraison rapide et fiable', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/10' },
                            { icon: '🔒', text: 'Paiement 100% sécurisé', color: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/10' },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-2 p-2 lg:gap-3 lg:p-3 rounded-xl bg-gradient-to-r ${item.color} border ${item.border} animate-slide-in-field field-stagger-${i + 4}`}>
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm font-medium text-white/60">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 lg:py-12 relative overflow-hidden overflow-y-auto">
                <AuroraBackground colors="purple" className="opacity-50" />

                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-4 sm:mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#7c3aed] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-900/30">
                                SF
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                SEN<span className="text-purple-300">FOIRE</span>
                            </h1>
                        </Link>
                    </div>

                    <div className="card-glass rounded-3xl p-5 sm:p-6 relative">
                        <div className="text-center mb-4 sm:mb-8 animate-slide-in-field field-stagger-1">
                            <div className="relative w-14 h-14 mx-auto mb-4">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-40" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/25">
                                    👋
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">{t('auth.login')}</h2>
                            <p className="text-sm text-white/40 mt-2">
                                Accédez à votre espace SENFOIRE
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-sm text-red-300 mb-6 flex items-center gap-3 animate-fade-in-scale">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form className="space-y-3 sm:space-y-5" onSubmit={handleSubmit}>
                            <div className="animate-slide-in-field field-stagger-2">
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Identifiant</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={identifiant}
                                        onChange={(e) => setIdentifiant(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 glow-focus"
                                        placeholder={t('auth.identifiant')}
                                    />
                                </div>
                            </div>

                            <div className="animate-slide-in-field field-stagger-3">
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{t('auth.password')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all duration-300 glow-focus"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end animate-slide-in-field field-stagger-3">
                              <Link to="/forgot-password" className="text-xs text-white/30 hover:text-white/50 transition-colors">
                                {t('auth.forgotPassword')}
                              </Link>
                            </div>

                            <div className="animate-slide-in-field field-stagger-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-shimmer w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Connexion en cours...
                                        </>
                                    ) : t('auth.login')}
                                </button>
                            </div>
                        </form>

                        <div className="mt-5 pt-4 sm:mt-8 sm:pt-6 border-t border-white/[0.06] text-center animate-slide-in-field field-stagger-5">
                            <p className="text-sm text-white/30">
                                Pas encore de compte ?{' '}
                                <Link to="/inscription" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                    {t('auth.register')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
