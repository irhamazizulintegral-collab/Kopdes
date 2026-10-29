import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCw
} from 'lucide-react';
import { Product, Order, Customer, ActiveTab } from '../types';
import { getStoreInsights, StoreInsights } from '../services/aiService';

interface DashboardViewProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectOrder: (order: Order) => void;
  onNewProductClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  orders,
  customers,
  onNavigateTab,
  onSelectOrder,
  onNewProductClick
}) => {
  const [aiInsights, setAiInsights] = useState<StoreInsights | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Financial and operational metrics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid' || o.status === 'completed' || o.status === 'shipped')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRunAiInsights = async () => {
    setLoadingAi(true);
    try {
      const topCategories = Array.from(new Set(products.map(p => p.category)));
      const res = await getStoreInsights({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        pendingOrders: pendingOrders.length,
        topCategories
      });
      setAiInsights(res);
    } catch (err) {
      console.error('Failed to get store insights:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Admin Overview
            </span>
            <span className="text-xs text-slate-400">• Operasional Toko Hari Ini</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Selamat Datang di Velvet Store Admin
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Semua data katalog, pesanan, dan pelanggan tersimpan aman di Firestore per-user.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNewProductClick}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
          <button
            onClick={handleRunAiInsights}
            disabled={loadingAi}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            {loadingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            )}
            <span>Analisis AI Gemini</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Pendapatan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-2">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Dari pesanan lunas & terkirim</span>
          </div>
        </div>

        {/* Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Pesanan</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-2">
            {orders.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 font-semibold">{pendingOrders.length}</span>
            <span>menunggu diproses</span>
          </div>
        </div>

        {/* Products */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Katalog Produk</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-2">
            {products.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">
              {products.filter(p => p.status === 'active').length}
            </span>
            <span>aktif dijual</span>
          </div>
        </div>

        {/* Customers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Pelanggan</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-extrabold text-white mt-2">
            {customers.length}
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1">
            <span>Tercatat di direktori</span>
          </div>
        </div>
      </div>

      {/* AI Store Intelligence Section */}
      {aiInsights && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-700/40 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Analisis Strategis Toko (Gemini AI)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Skor: {aiInsights.statusScore}
              </span>
            </div>
            <button
              onClick={() => setAiInsights(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {aiInsights.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {aiInsights.recommendations?.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center justify-between font-semibold text-white mb-1">
                  <span>{rec.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Dampak: {rec.impact}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>

          {aiInsights.marketingIdea && (
            <div className="p-2.5 rounded-xl bg-indigo-900/30 border border-indigo-700/30 text-xs text-indigo-200 flex items-center gap-2">
              <span className="font-bold text-indigo-300">💡 Ide Promo:</span>
              <span>{aiInsights.marketingIdea}</span>
            </div>
          )}
        </div>
      )}

      {/* Low Stock Alert if any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                Perhatian: {lowStockProducts.length} Produk Mendekati Habis / Kosong
              </div>
              <div className="text-[11px] text-amber-200/80">
                {lowStockProducts.map(p => `${p.name} (Sisa: ${p.stock})`).join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline shrink-0 cursor-pointer"
          >
            Kelola Stok
          </button>
        </div>
      )}

      {/* Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Pesanan Masuk Terbaru</h3>
              <p className="text-xs text-slate-400">Pantau dan ubah status pengiriman pesanan pembeli</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada pesanan masuk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2.5 font-medium">No. Pesanan</th>
                    <th className="pb-2.5 font-medium">Pelanggan</th>
                    <th className="pb-2.5 font-medium">Total</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.slice(0, 5).map((order) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                      shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                    };

                    return (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 font-mono font-medium text-white">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 text-slate-300">
                          <div>{order.customerName}</div>
                          <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 font-semibold text-white">
                          {formatRupiah(order.totalAmount)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              statusColors[order.status] || 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products / Inventory Snapshot (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Katalog Unggulan</h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3"
              >
                <img
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatRupiah(product.price)}
                  </div>
                  <div className="text-[10px] flex items-center gap-1.5 mt-0.5">
                    <span className="text-slate-500">{product.category}</span>
                    <span>•</span>
                    <span className={product.stock <= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      Stok: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('ai-tools')}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gunakan AI Copywriter Produk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
