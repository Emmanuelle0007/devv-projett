import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import AuthLayout from './AuthLayout';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo;


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (result.success && result.redirect) {
            navigate(returnTo || result.redirect);
        } else {
            setError(result.error || 'Erreur inconnue.');
        }
    };

    return (
        <AuthLayout title="Connexion" subtitle="Accédez à votre espace IRMA">
            <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto min-h-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl">
                
                <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-8">
                           <span className="text-[#D4A853] font-bold text-xl uppercase tracking-tighter">IRMA</span>
                        </div>

                        <p className="font-body text-sm text-gray-400 mb-1">Bienvenue !!</p>
                        <h1 className="font-display text-4xl font-bold mb-10" style={{ color: '#0F172A' }}>
                            Connexion
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col">
                                <label className="font-body text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest pointer-events-none">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 font-body text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D4A853]/20"
                                    style={{ color: '#0F172A' }}
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="font-body text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                                        Mot de passe
                                    </label>
                                    <Link to="/forgot-password" className="font-body text-[10px] font-bold hover:underline uppercase opacity-70" style={{ color: '#D4A853' }}>
                                        Oublié ?
                                    </Link>
                                </div>
                                <div className="relative overflow-hidden">
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••"
                                        className="w-full px-4 py-3 pr-14 rounded-xl border border-gray-100 bg-gray-50/30 font-body text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D4A853]/20"
                                        style={{ color: '#0F172A' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-colors"
                                        style={{ color: '#0F172A' }}
                                    >
                                        {showPwd ? (
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                                    <svg width="14" height="14" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <p className="font-body text-xs font-bold italic text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl text-white font-body font-bold text-sm transition-all duration-300 hover:brightness-105 active:scale-[0.98] shadow-lg shadow-[#D4A853]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#D4A853' }}
                            >
                                {loading ? 'Connexion...' : 'SE CONNECTER'}
                            </button>

                            <p className="mt-8 font-body text-xs text-gray-400 text-center">
                                Pas encore de compte ?{' '}
                                <Link to="/register" className="font-bold hover:underline" style={{ color: '#0F172A' }}>
                                    S'inscrire
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                <div className="hidden lg:flex flex-1 bg-[#FFF1EB] overflow-hidden">
                    <img 
                        src="/src/assets/lulu.jpg" 
                        alt="Illustration" 
                        className="w-full h-full object-cover" 
                    />
                </div>
            </div>
        </AuthLayout>
    );
}
