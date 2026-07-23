import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import LocationPicker from '../components/LocationPicker';
import AuroraBackground from '../components/AuroraBackground';

export default function FormulaireClient() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        pseudo: '',
        password: '',
        password_confirmation: '',
        cni: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState({ latitude: null, longitude: null });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('nom', form.nom);
            formData.append('prenom', form.prenom);
            formData.append('email', form.email);
            formData.append('telephone', form.telephone);
            formData.append('pseudo', form.pseudo);
            formData.append('password', form.password);
            formData.append('password_confirmation', form.password_confirmation);
            formData.append('role', 'client');
            if (form.cni) formData.append('cni', form.cni);
            if (location.latitude) formData.append('latitude', location.latitude);
            if (location.longitude) formData.append('longitude', location.longitude);

            const response = await API.post('/inscriptions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                localStorage.setItem('senfoire_token', response.data.access_token);
                navigate('/client-dashboard');
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex bg-[#0a0f1e]">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center lg:sticky lg:top-0 lg:h-screen lg:self-start shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#065f46] via-[#064e3b] to-[#0a0f1e]" />
                <AuroraBackground colors="emerald" />

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
                            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Espace Client</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight mb-4 animate-slide-in-field field-stagger-2">
                        Créez votre<br />
                        <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">compte acheteur</span>
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-10 animate-slide-in-field field-stagger-3">
                        Rejoignez des milliers d'acheteurs et découvrez une sélection unique de produits du monde entier.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: '🛍️', text: 'Accès à des milliers de produits', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/10' },
                            { icon: '⚡', text: 'Commande en quelques clics', color: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/10' },
                            { icon: '📦', text: 'Suivi de livraison en temps réel', color: 'from-teal-500/10 to-cyan-500/10', border: 'border-teal-500/10' },
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
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative">
                <AuroraBackground colors="emerald" className="opacity-40" />

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

                    <div className="card-glass rounded-3xl p-8 relative">
                        <div className="text-center mb-6 animate-slide-in-field field-stagger-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm font-bold mb-4">
                                🛒 Inscription Client
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Créer un compte</h2>
                            <p className="text-sm text-white/40 mt-2">
                                Commencez à acheter sur SENFOIRE
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

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="animate-slide-in-field field-stagger-2">
                                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Nom *</label>
                                    <input type="text" name="nom" required value={form.nom} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald" />
                                </div>
                                <div className="animate-slide-in-field field-stagger-3">
                                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Prénom *</label>
                                    <input type="text" name="prenom" required value={form.prenom} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald" />
                                </div>
                            </div>

                            <div className="animate-slide-in-field field-stagger-4">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Pseudo *</label>
                                <input type="text" name="pseudo" required value={form.pseudo} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                    placeholder="Votre pseudo de connexion" />
                            </div>

                            <div className="animate-slide-in-field field-stagger-5">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Email</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                    placeholder="votre@email.com (optionnel)" />
                            </div>

                            <div className="animate-slide-in-field field-stagger-6">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Téléphone *</label>
                                <input type="tel" name="telephone" required value={form.telephone} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                    placeholder="77 123 45 67" />
                            </div>

                            <div className="animate-slide-in-field field-stagger-7">
                                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Numéro CNI</label>
                                <input type="text" name="cni" value={form.cni} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                    placeholder="Optionnel" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="animate-slide-in-field field-stagger-8">
                                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Mot de passe *</label>
                                    <input type="password" name="password" required value={form.password} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                        placeholder="••••••••" minLength={6} />
                                </div>
                                <div className="animate-slide-in-field field-stagger-9">
                                    <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1.5">Confirmer *</label>
                                    <input type="password" name="password_confirmation" required value={form.password_confirmation} onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 glow-focus-emerald"
                                        placeholder="••••••••" />
                                </div>
                            </div>

                            <div className="animate-slide-in-field field-stagger-10">
                                <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                                    <LocationPicker onLocationSelected={(lat, lng) => setLocation({ latitude: lat, longitude: lng })} />
                                </div>
                            </div>

                            <div className="animate-slide-in-field field-stagger-10">
                                <button type="submit" disabled={isSubmitting}
                                    className="btn-shimmer w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-50 text-sm">
                                    {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
                            <p className="text-sm text-white/30">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
