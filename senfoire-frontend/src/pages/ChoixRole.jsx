import { Link } from 'react-router-dom';
import AuroraBackground from '../components/AuroraBackground';

const roles = [
    {
        id: 'client',
        label: 'Client',
        icon: '🛒',
        description: 'Achetez des produits de la foire SENFOIRE',
        gradient: 'from-emerald-500 to-teal-600',
        hoverGradient: 'hover:from-emerald-400 hover:to-teal-500',
        shadowColor: 'shadow-emerald-500/30',
        ringColor: 'hover:ring-emerald-400/30',
        iconBg: 'bg-emerald-400/20',
        auroraColors: 'emerald',
    },
    {
        id: 'vendeur',
        label: 'Vendeur',
        icon: '🏪',
        description: 'Vendez vos produits sur la foire virtuelle',
        gradient: 'from-amber-500 to-orange-600',
        hoverGradient: 'hover:from-amber-400 hover:to-orange-500',
        shadowColor: 'shadow-amber-500/30',
        ringColor: 'hover:ring-amber-400/30',
        iconBg: 'bg-amber-400/20',
        auroraColors: 'amber',
    },
    {
        id: 'livreur',
        label: 'Livreur',
        icon: '🚚',
        description: 'Livrez les commandes aux clients',
        gradient: 'from-orange-500 to-red-600',
        hoverGradient: 'hover:from-orange-400 hover:to-red-500',
        shadowColor: 'shadow-orange-500/30',
        ringColor: 'hover:ring-orange-400/30',
        iconBg: 'bg-orange-400/20',
        auroraColors: 'orange',
    },
];

export default function ChoixRole() {
    return (
        <div className="min-h-screen flex bg-[#0a0f1e]">
            {/* LEFT PANEL */}
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
                            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em]">Foire Internationale Virtuelle</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight mb-4 animate-slide-in-field field-stagger-2">
                        Rejoignez la<br />
                        <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">communauté SENFOIRE</span>
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-10 animate-slide-in-field field-stagger-3">
                        Choisissez le rôle qui vous correspond et commencez votre aventure sur la première foire internationale virtuelle.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: '🎯', text: 'Inscription rapide en quelques étapes', color: 'from-blue-500/10 to-purple-500/10', border: 'border-blue-500/10' },
                            { icon: '🌐', text: 'Accessible depuis le monde entier', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/10' },
                            { icon: '💬', text: 'Support dédié pour chaque profil', color: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/10' },
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
                <AuroraBackground colors="purple" className="opacity-50" />

                <div className="relative z-10 w-full max-w-md animate-fade-in-up">
                    <div className="lg:hidden text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#7c3aed] flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-900/30">
                                SF
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                SEN<span className="text-purple-300">FOIRE</span>
                            </h1>
                        </Link>
                    </div>

                    <div className="card-glass rounded-3xl p-8 sm:p-10 relative">
                        <div className="text-center mb-8 animate-slide-in-field field-stagger-1">
                            <div className="relative w-14 h-14 mx-auto mb-4">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-40" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-500/25">
                                    🎭
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Choisissez votre profil</h2>
                            <p className="text-sm text-white/40 mt-2">
                                Sélectionnez votre rôle pour commencer
                            </p>
                        </div>

                        <div className="space-y-3">
                            {roles.map((role, index) => (
                                <Link
                                    key={role.id}
                                    to={`/inscription/${role.id}`}
                                    className={`block w-full p-5 rounded-2xl bg-gradient-to-r ${role.gradient} ${role.hoverGradient} text-white shadow-lg ${role.shadowColor} hover:shadow-xl hover:-translate-y-0.5 hover:ring-2 ${role.ringColor} transition-all duration-300 animate-slide-in-field field-stagger-${index + 2}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${role.iconBg} backdrop-blur-sm flex items-center justify-center text-3xl`}>
                                            {role.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black">{role.label}</h3>
                                            <p className="text-sm text-white/80">{role.description}</p>
                                        </div>
                                        <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center animate-slide-in-field field-stagger-6">
                            <p className="text-sm text-white/30">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
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
