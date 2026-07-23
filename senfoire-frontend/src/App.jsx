import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { I18nProvider } from './context/I18nContext';
import OfflineIndicator from './components/OfflineIndicator';
import AuroraBackground from './components/AuroraBackground';
import Login from './pages/Login';
import ChoixRole from './pages/ChoixRole';
import FormulaireClient from './pages/FormulaireClient';
import FormulaireVendeur from './pages/FormulaireVendeur';
import FormulaireLivreur from './pages/FormulaireLivreur';
import AttenteValidation from './pages/AttenteValidation';
import SetupCredentials from './pages/SetupCredentials';
import VendeurDashboard from './components/VendeurDashboard';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import LivreurDashboard from './components/LivreurDashboard';
import CaissierDashboard from './components/CaissierDashboard';
import VisiteurCatalogue from './pages/VisiteurCatalogue';
import ForgotPassword from './pages/ForgotPassword';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-foire-primary to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-900/20 animate-pulse">
            SF
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-foire-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-foire-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-foire-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
      <ToastProvider>
        <OfflineIndicator />
        <Router>
          <Routes>
            {/* Pages publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/visiteur" element={<VisiteurCatalogue />} />
            <Route path="/inscription" element={<ChoixRole />} />
            <Route path="/inscription/client" element={<FormulaireClient />} />
            <Route path="/inscription/vendeur" element={<FormulaireVendeur />} />
            <Route path="/inscription/livreur" element={<FormulaireLivreur />} />
            <Route path="/inscription/attente" element={<AttenteValidation />} />
            <Route path="/inscription/finaliser" element={<SetupCredentials />} />

            {/* Dashboards protégés */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendeur-dashboard" element={
              <ProtectedRoute>
                <VendeurDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client-dashboard" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/livreur-dashboard" element={
              <ProtectedRoute>
                <LivreurDashboard />
              </ProtectedRoute>
            } />
            <Route path="/caissier-dashboard" element={
              <ProtectedRoute>
                <CaissierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
      </I18nProvider>
    </AuthProvider>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <AuroraBackground colors="blue" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">
        <div className="card-glass rounded-3xl p-10 sm:p-12 space-y-8 relative">
          <div className="space-y-3 animate-slide-in-field field-stagger-1">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-40 animate-pulse-glow" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-purple-500/30">
                SF
              </div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mt-4">
              SEN<span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">FOIRE</span>
            </h1>
            <p className="text-xs text-white/30 font-bold uppercase tracking-[0.35em]">Foire Internationale Virtuelle</p>
          </div>

          <p className="text-sm text-white/40 leading-relaxed animate-slide-in-field field-stagger-2">
            La première plateforme d'exposition internationale virtuelle et interactive.
            Découvrez, achetez et vendez sans frontières.
          </p>

          <div className="space-y-3 animate-slide-in-field field-stagger-3">
            {[
              { icon: '🌍', text: 'Vendeurs du monde entier', color: 'from-blue-500/10 to-purple-500/10', border: 'border-blue-500/10' },
              { icon: '🚚', text: 'Livraison rapide et fiable', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-500/10' },
              { icon: '🔒', text: 'Paiement 100% sécurisé', color: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/10' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${item.color} border ${item.border}`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-white/60">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 animate-slide-in-field field-stagger-4">
            <a
              href="/visiteur"
              className="btn-shimmer block w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              Explorer la foire
            </a>
          </div>

          <div className="flex gap-3 animate-slide-in-field field-stagger-5">
            <a
              href="/login"
              className="flex-1 py-3.5 px-6 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold rounded-2xl transition-all text-center hover:scale-[1.02] active:scale-[0.98]"
            >
              Se connecter
            </a>
            <a
              href="/inscription"
              className="flex-1 py-3.5 px-6 btn-shimmer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
