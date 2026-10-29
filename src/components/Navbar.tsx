import React from 'react';
import { Store, LogOut, ShieldCheck, Sparkles, User, Cloud } from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  user: AuthUser;
  onLogout: () => void;
  onNewProductClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNewProductClick }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-white">Velvet Store</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span>Firestore Sync: Aktif</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {onNewProductClick && (
          <button
            onClick={onNewProductClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        )}

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
              <span>{user.displayName || user.username || 'Admin'}</span>
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {user.isCustomAdmin ? '@velvetshadow' : user.email || 'Admin User'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Keluar dari akun"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800/60 text-slate-300 hover:text-rose-200 text-xs font-medium transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
