import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
  Sparkles,
  Settings,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  orderCount?: number;
  productCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  orderCount = 0,
  productCount = 0
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    isAi?: boolean;
  }> = [
    { id: 'dashboard', label: 'Ringkasan & Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Katalog Produk', icon: Package, badge: productCount },
    { id: 'orders', label: 'Pesanan Pelanggan', icon: ShoppingBag, badge: orderCount },
    { id: 'categories', label: 'Kategori Produk', icon: Tags },
    { id: 'customers', label: 'Daftar Pelanggan', icon: Users },
    { id: 'ai-tools', label: 'AI Gemini Assistant', icon: Sparkles, isAi: true },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-3 md:p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-3 py-2">
          Menu Manajemen
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : item.isAi
                    ? 'text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.isAi
                        ? 'text-indigo-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.isAi && !isActive && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      AI
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mini System Info Box */}
      <div className="mt-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-medium">Backend Express</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            api/index.ts
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>Firestore Engine:</span>
          <span className="text-slate-300">Per-User Multi-Tenant</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>AI Model:</span>
          <span className="text-indigo-300 font-mono">gemini-2.5-flash</span>
        </div>
      </div>
    </aside>
  );
};
