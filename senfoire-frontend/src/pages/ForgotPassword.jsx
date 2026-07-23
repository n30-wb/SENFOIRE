import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import AuroraBackground from '../components/AuroraBackground';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/password/email', { email });
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.message || "Email introuvable.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/password/verify', { email, code });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/password/reset', { email, code, password, password_confirmation: confirmPassword });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <AuroraBackground colors="blue" />
      <div className="relative z-10 w-full max-w-md">
        <div className="card-glass rounded-3xl p-10 sm:p-12 space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto shadow-xl shadow-purple-500/30">
                SF
              </div>
            </Link>
            <h1 className="text-2xl font-black text-white">Mot de passe oublié ?</h1>
            <p className="text-sm text-white/40">
              {step === 'email' ? 'Entrez votre email pour recevoir un code' :
               step === 'code' ? 'Entrez le code reçu par email' :
               'Choisissez un nouveau mot de passe'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <p className="text-sm font-semibold text-red-400 text-center">{error}</p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={sendCode} className="space-y-4">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Votre email"
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all" />
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/20 transition-all cursor-pointer">
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={verifyCode} className="space-y-4">
              <input value={code} onChange={e => setCode(e.target.value)} type="text" required placeholder="Code à 6 chiffres" maxLength={6}
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white text-sm text-center tracking-[0.5em] placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all" />
              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 cursor-pointer">
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-xs text-white/30 hover:text-white/50 text-center cursor-pointer">
                Changer d'email
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={resetPassword} className="space-y-4">
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="Nouveau mot de passe" minLength={6}
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all" />
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" required placeholder="Confirmer le mot de passe" minLength={6}
                className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all" />
              <button type="submit" disabled={loading || !password || password !== confirmPassword}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer">
                {loading ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
