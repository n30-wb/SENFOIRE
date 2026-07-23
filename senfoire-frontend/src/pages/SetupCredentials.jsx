import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuroraBackground from '../components/AuroraBackground';

export default function SetupCredentials() {
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithData } = useAuth();
    const { inscriptionId, role } = location.state || {};
    const [identifiant, setIdentifiant] = useState('');
    const [identifiantType, setIdentifiantType] = useState('email');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!inscriptionId) {
            navigate('/inscription');
        }
    }, [inscriptionId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await API.post(`/inscriptions/${inscriptionId}/finaliser`, {
                identifiant,
                password,
            });

            if (response.data.success) {
                const { access_token, user } = response.data;
                localStorage.setItem('senfoire_token', access_token);

                if (role === 'vendeur') {
                    navigate('/vendeur-dashboard');
                } else if (role === 'livreur') {
                    navigate('/livreur-dashboard');
                }
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError(err.response?.data?.message || 'Erreur lors de la finalisation.');
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex bg-[#0a0f1e]">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#0a0f1e]" />
                <AuroraBackground colors="success" />

                <div className="relative z-10 px-12 max-w-lg">
                    <div className="flex items-center gap-4 mb-10 animate-slide-in-field field-stagger-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-30 animate-pulse-glow" />
                            <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white font-black text-2xl shadow-2xl">
                                SF
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                SEN<span className="text-emerald-300">FOIRE</span>
                            </h1>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Finalisation</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight mb-4 animate-slide-in-field field-stagger-2">
                        Votre compte<br />
                        <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">est validé !</span>
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-10 animate-slide-in-field field-stagger-3">
                        Configurez vos identifiants de connexion pour accéder à votre espace {role}.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: '✅', text: 'Votre inscription a été approuvée', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/10' },
                            { icon: '🔐', text: 'Choisissez un email ou téléphone', color: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/10' },
                            { icon: '🚀', text: 'Accédez à votre espace personnel', color: 'from-teal-500/10 to-cyan-500/10', border: 'border-teal-500/10' },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${item.color} border ${item.border} animate-slide-in-field field-stagger-${i + 4}`}>
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm font-medium text-white/60">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative overflow-hidden">
                <AuroraBackground colors="success" className="opacity-50" />

                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-emerald-900/30">
                                SF
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                SEN<span className="text-emerald-300">FOIRE</span>
                            </h1>
                        </Link>
                    </div>

                    <div className="card-glass rounded-3xl p-8 sm:p-10 relative">
                        <div className="text-center mb-8 animate-slide-in-field field-stagger-1">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-xl opacity-30" />
                                <div className="relative w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl">
                                    🎉
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm font-bold mb-4">
                                ✅ Compte validé !
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Finalisez votre compte</h2>
                            <p className="text-sm text-white/40 mt-2">
                                Configurez vos identifiants de connexion
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

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="animate-slide-in-field field-stagger-2">
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Identifiant de connexion</label>
                                <div className="flex gap-3 mb-3">
                                    <button type="button" onClick={() => setIdentifiantType('email')}
                                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${identifiantType === 'email' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] border border-white/[0.08]'}`}>
                                        📧 Email
                                    </button>
                                    <button type="button" onClick={() => setIdentifiantType('telephone')}
                                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${identifiantType === 'telephone' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] border border-white/[0.08]'}`}>
                                        📱 Téléphone
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            {identifiantType === 'email' ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            )}
                                        </svg>
                                    </div>
                                    <input
                                        type={identifiantType === 'email' ? 'email' : 'tel'}
                                        required
                                        value={identifiant}
                                        onChange={(e) => setIdentifiant(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                        placeholder={identifiantType === 'email' ? 'votre@email.com' : '77 123 45 67'}
                                    />
                                </div>
                            </div>

                            <div className="animate-slide-in-field field-stagger-3">
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Mot de passe</label>
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
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="animate-slide-in-field field-stagger-4">
                                <button type="submit" disabled={isSubmitting}
                                    className="btn-shimmer w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 text-sm">
                                    {isSubmitting ? 'Finalisation en cours...' : 'Accéder à mon espace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
