import React, { useState } from 'react';
import { ShieldCheck, LogIn, Sparkles, Store, KeyRound, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { loginWithAdminCredentials } from '../services/aiService';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'google'>('credentials');
  const [username, setUsername] = useState('velvetshadow');
  const [password, setPassword] = useState('irham08062006');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fill default requested admin credentials
  const handleQuickFill = () => {
    setUsername('velvetshadow');
    setPassword('irham08062006');
    setError(null);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginWithAdminCredentials(username, password);
      if (res.success && res.user) {
        onLoginSuccess({
          uid: res.user.uid || 'admin_velvetshadow',
          email: res.user.email,
          displayName: res.user.name,
          username: res.user.username,
          isAdmin: true,
          isCustomAdmin: true
        });
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      onLoginSuccess({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || 'Google Admin',
        photoURL: fbUser.photoURL,
        isAdmin: true,
        isCustomAdmin: false
      });
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Gagal login dengan akun Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Brand Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-800/80">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4 ring-4 ring-indigo-500/10">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            Velvet Store <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold tracking-wider">Admin</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Portal Manajemen Toko Online & E-Commerce
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-6 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('credentials'); setError(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Akun Admin
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('google'); setError(null); }}
            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Google Sign-in
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="p-6 pt-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <label htmlFor="username">Username</label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-normal transition-colors"
                >
                  Isi Akun Default
                </button>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="velvetshadow"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" text-xs text-slate-300 font-medium className="block text-xs text-slate-300 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="irham08062006"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk sebagai Admin</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </div>

            {/* Credential Hint Box */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-slate-300 space-y-1">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Kredensial Admin Bawaan:
              </div>
              <div className="font-mono text-slate-300 text-[10px] pl-5 space-y-0.5">
                <div>Username: <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">velvetshadow</span></div>
                <div>Password: <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">irham08062006</span></div>
              </div>
            </div>
          </form>
        )}

        {/* Google Sign-In Tab */}
        {activeTab === 'google' && (
          <div className="p-6 pt-5 space-y-5 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan akun Google Anda untuk masuk melalui Firebase Auth. Data toko Anda akan terisolasi secara privat di Firestore per-user.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold shadow-lg flex items-center justify-center gap-3 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Masuk dengan Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Didukung Firebase Authentication & Firestore</span>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          Express Serverless API • Ready for Vercel Deployment
        </div>
      </div>
    </div>
  );
};
