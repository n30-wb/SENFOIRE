import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuroraBackground from '../components/AuroraBackground';

export default function AttenteValidation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { inscriptionId, role } = location.state || {};
    const [statut, setStatut] = useState('en_attente');
    const [motifRejet, setMotifRejet] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!inscriptionId) {
            navigate('/inscription');
            return;
        }

        const checkStatut = async () => {
            try {
                const res = await API.get(`/inscriptions/${inscriptionId}/statut`);
                setStatut(res.data.statut);
                setMotifRejet(res.data.motif_rejet || '');
                if (res.data.statut === 'approuve') {
                    navigate('/inscription/finaliser', {
                        state: { inscriptionId, role }
                    });
                }
            } catch (err) {
                console.error(err);
            }
            setChecking(false);
        };

        checkStatut();
        const interval = setInterval(checkStatut, 5000);
        return () => clearInterval(interval);
    }, [inscriptionId, role, navigate]);

    if (statut === 'rejete') {
        return (
            <div className="min-h-screen flex bg-[#0a0f1e]">
                <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#0a0f1e]" />
                    <AuroraBackground colors="red" />

                    <div className="relative z-10 px-12 max-w-lg">
                        <div className="flex items-center gap-4 mb-10 animate-slide-in-field field-stagger-1">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-30 animate-pulse-glow" />
                                <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white font-black text-2xl shadow-2xl">
                                    SF
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">
                                    SEN<span className="text-red-300">FOIRE</span>
                                </h1>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Inscription</p>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white leading-tight mb-4 animate-slide-in-field field-stagger-2">
                            Inscription<br />
                            <span className="bg-gradient-to-r from-red-300 to-rose-300 bg-clip-text text-transparent">non retenue</span>
                        </h2>
                        <p className="text-white/50 text-sm leading-relaxed animate-slide-in-field field-stagger-3">
                            Votre demande d'inscription n'a pas été approuvée. Contactez l'administrateur pour plus d'informations.
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative overflow-hidden">
                    <AuroraBackground colors="red" className="opacity-50" />

                    <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                        <div className="lg:hidden text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-red-900/30">
                                    SF
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    SEN<span className="text-red-300">FOIRE</span>
                                </h1>
                            </Link>
                        </div>

                        <div className="card-glass rounded-3xl p-8 sm:p-10 relative text-center">
                            <div className="animate-slide-in-field field-stagger-1">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-30" />
                                    <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-5xl">
                                        ❌
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight animate-slide-in-field field-stagger-2">Inscription rejetée</h2>
                            {motifRejet && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-sm text-red-300 mt-6 text-left animate-slide-in-field field-stagger-3">
                                    <p className="font-bold mb-1">Motif :</p>
                                    {motifRejet}
                                </div>
                            )}
                            <p className="text-sm text-white/40 mt-4 animate-slide-in-field field-stagger-4">
                                Veuillez contacter l'administrateur pour plus d'informations.
                            </p>
                            <Link to="/inscription" className="block w-full mt-6 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold rounded-xl transition-all text-sm text-center animate-slide-in-field field-stagger-5">
                                Retour
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0a0f1e]">
            {/* LEFT PANEL */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#78350f] via-[#92400e] to-[#0a0f1e]" />
                <AuroraBackground colors="amber" />

                <div className="relative z-10 px-12 max-w-lg">
                    <div className="flex items-center gap-4 mb-10 animate-slide-in-field field-stagger-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-xl opacity-30 animate-pulse-glow" />
                            <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white font-black text-2xl shadow-2xl">
                                SF
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                SEN<span className="text-amber-300">FOIRE</span>
                            </h1>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Inscription</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight mb-4 animate-slide-in-field field-stagger-2">
                        Votre compte<br />
                        <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">est en cours</span>
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed animate-slide-in-field field-stagger-3">
                        L'administrateur examine votre demande. Vous serez notifié dès que votre compte sera validé.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 relative overflow-hidden">
                <AuroraBackground colors="amber" className="opacity-50" />

                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-amber-900/30">
                                SF
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                SEN<span className="text-amber-300">FOIRE</span>
                            </h1>
                        </Link>
                    </div>

                    <div className="card-glass rounded-3xl p-8 sm:p-10 relative text-center">
                        <div className="animate-slide-in-field field-stagger-1">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 bg-amber-500/20 rounded-2xl animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-xl opacity-30" />
                                <div className="relative w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-5xl">
                                    ⏳
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight animate-slide-in-field field-stagger-2">Inscription en cours</h2>
                        <p className="text-sm text-white/40 mt-3 leading-relaxed animate-slide-in-field field-stagger-3">
                            Votre compte <span className="font-bold text-amber-300 capitalize">{role}</span> est en cours de validation par l'administrateur.
                        </p>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-6 animate-slide-in-field field-stagger-4">
                            <p className="text-sm text-amber-300 font-medium flex items-center justify-center gap-2">
                                📩 Vous recevrez une notification une fois votre compte validé.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm text-white/30 mt-6 animate-slide-in-field field-stagger-5">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Vérification automatique toutes les 5 secondes...
                        </div>

                        <Link to="/login" className="block w-full mt-6 py-3 px-4 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold rounded-xl transition-all text-sm text-center animate-slide-in-field field-stagger-6">
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
