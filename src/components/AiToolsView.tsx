import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  TrendingUp,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Send,
  Zap,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import {
  generateProductDescription,
  getStoreInsights,
  generateCustomerReply,
  GeneratedDescription,
  StoreInsights,
  CustomerReplyResponse
} from '../services/aiService';
import { Product, Order, Customer } from '../types';

interface AiToolsViewProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  initialCustomerForReply?: Customer | null;
}

export const AiToolsView: React.FC<AiToolsViewProps> = ({
  products,
  orders,
  customers,
  initialCustomerForReply
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'copywriter' | 'insights' | 'cs-reply'>(
    initialCustomerForReply ? 'cs-reply' : 'copywriter'
  );

  // Tab 1: Product Copywriter
  const [prodName, setProdName] = useState('Velvet Midnight Oversized Hoodie');
  const [prodCategory, setProdCategory] = useState('Fashion Pria');
  const [prodFeatures, setProdFeatures] = useState('Fleece katun 330gsm, bordir tipografi premium, saku kangaroo dalam, tahan luntur');
  const [prodTone, setProdTone] = useState('persuasif, modern, dan bergaya streetwear');
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [copyResult, setCopyResult] = useState<GeneratedDescription | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab 2: Store Insights
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsResult, setInsightsResult] = useState<StoreInsights | null>(null);

  // Tab 3: Customer Care Reply
  const [customerName, setCustomerName] = useState(initialCustomerForReply?.name || 'Siti Rahmawati');
  const [customerMsg, setCustomerMsg] = useState('Halo admin, pesanan saya nomor INV-202610-002 kapan dikirim ya? Sudah 2 hari statusnya masih diproses.');
  const [orderContext, setOrderContext] = useState('Pesanan INV-202610-002 berisi Keyboard & Tas Kulit, sedang disiapkan tim gudang');
  const [replyTone, setReplyTone] = useState('ramah, sopan, solutif, dan menenangkan pelanggan');
  const [loadingReply, setLoadingReply] = useState(false);
  const [replyResult, setReplyResult] = useState<CustomerReplyResponse | null>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;
    setLoadingCopy(true);
    setGlobalError(null);
    try {
      const res = await generateProductDescription({
        productName: prodName,
        category: prodCategory,
        keyFeatures: prodFeatures,
        tone: prodTone
      });
      setCopyResult(res);
    } catch (err: any) {
      setGlobalError(err.message || 'Gagal generate deskripsi produk');
    } finally {
      setLoadingCopy(false);
    }
  };

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    setGlobalError(null);
    try {
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid' || o.status === 'completed' || o.status === 'shipped')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const topCategories = Array.from(new Set(products.map(p => p.category)));
      const lowStockCount = products.filter(p => p.stock <= 5).length;
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

      const res = await getStoreInsights({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        lowStockCount,
        pendingOrders,
        topCategories
      });
      setInsightsResult(res);
    } catch (err: any) {
      setGlobalError(err.message || 'Gagal menganalisis toko');
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleGenerateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMsg.trim()) return;
    setLoadingReply(true);
    setGlobalError(null);
    try {
      const res = await generateCustomerReply({
        customerName,
        message: customerMsg,
        tone: replyTone,
        orderContext
      });
      setReplyResult(res);
    } catch (err: any) {
      setGlobalError(err.message || 'Gagal generate balasan pelanggan');
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI Studio Assistant (Gemini 2.5 Flash)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Alat kecerdasan buatan server-side untuk mempercepat operasional, pemasaran, dan layanan pelanggan toko Anda
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('copywriter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'copywriter'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Copywriting & Deskripsi Produk</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('insights');
            if (!insightsResult) handleGenerateInsights();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'insights'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Analisis Penjualan & Strategi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cs-reply')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeSubTab === 'cs-reply'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Balas Pesan Pelanggan (CS)</span>
        </button>
      </div>

      {globalError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{globalError}</span>
        </div>
      )}

      {/* SUB-TAB 1: PRODUCT COPYWRITER */}
      {activeSubTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Input Data Produk untuk AI</span>
            </h3>

            <form onSubmit={handleGenerateCopy} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Contoh: Velvet Midnight Oversized Hoodie"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Kategori</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Gaya Bahasa (Tone)</label>
                  <select
                    value={prodTone}
                    onChange={(e) => setProdTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="persuasif, modern, dan bergaya streetwear">Streetwear & Modern</option>
                    <option value="elegan, premium, dan mewah">Mewah & Eksklusif</option>
                    <option value="santai, akrab, dan ramah anak muda">Santai & Kekinian</option>
                    <option value="teknis, profesional, dan detail">Teknis & Profesional</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Keunggulan / Bahan / Fitur Kunci</label>
                <textarea
                  rows={3}
                  value={prodFeatures}
                  onChange={(e) => setProdFeatures(e.target.value)}
                  placeholder="Bahan fleece 330gsm, resleting YKK, jahitan rantai..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loadingCopy}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {loadingCopy ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
                <span>Generate Copywriting dengan AI Gemini</span>
              </button>
            </form>
          </div>

          {/* AI Result Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Hasil Deskripsi & Copywriting</span>
              </h3>
              {copyResult && (
                <button
                  onClick={() =>
                    handleCopy(
                      `${copyResult.shortPitch}\n\n${copyResult.fullDescription}\n\nKeunggulan:\n${copyResult.highlights?.join('\n')}`,
                      'all'
                    )
                  }
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'all' ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>
              )}
            </div>

            {loadingCopy ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs text-slate-400">Gemini sedang meracik copywriting persuasif...</div>
              </div>
            ) : copyResult ? (
              <div className="space-y-4 text-xs">
                {/* Short Pitch */}
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
                  <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider mb-1">
                    Tagline / Pitch Utama
                  </div>
                  <div className="font-semibold text-white text-sm">
                    "{copyResult.shortPitch}"
                  </div>
                </div>

                {/* Full Description */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Deskripsi Lengkap
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {copyResult.fullDescription}
                  </p>
                </div>

                {/* Highlights */}
                {copyResult.highlights && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Poin Keunggulan (Bullet Points)
                    </div>
                    <ul className="space-y-1 text-slate-300">
                      {copyResult.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {copyResult.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {copyResult.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] border border-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 space-y-1">
                <FileText className="w-8 h-8 mx-auto text-slate-700" />
                <div>Tekan tombol "Generate" untuk melihat copywriting AI.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STORE INSIGHTS */}
      {activeSubTab === 'insights' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Analisis Strategis & Rekomendasi Pertumbuhan Toko</span>
              </h3>
              <p className="text-xs text-slate-400">
                Gemini AI menganalisis data pesanan, inventaris stok, dan kategori terlaris toko Anda
              </p>
            </div>

            <button
              onClick={handleGenerateInsights}
              disabled={loadingInsights}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              {loadingInsights ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <RefreshCw className="w-4 h-4 text-white" />
              )}
              <span>Perbarui Analisis</span>
            </button>
          </div>

          {loadingInsights ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs text-slate-400">Gemini sedang mengevaluasi metrik performa toko Anda...</div>
            </div>
          ) : insightsResult ? (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    Kesehatan Operasional Toko
                  </div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    {insightsResult.statusScore}
                  </div>
                </div>
                <p className="text-slate-300 text-xs md:max-w-xl leading-relaxed">
                  {insightsResult.summary}
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsResult.recommendations?.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold text-white text-sm">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.impact}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-xs">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Marketing Idea */}
              {insightsResult.marketingIdea && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-300 text-xs">Ide Kampanye & Promosi Pekan Ini:</div>
                    <div className="text-emerald-200/90 text-xs mt-0.5 leading-relaxed">
                      {insightsResult.marketingIdea}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* SUB-TAB 3: CUSTOMER CARE REPLY */}
      {activeSubTab === 'cs-reply' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Pesan Masuk dari Pelanggan</span>
            </h3>

            <form onSubmit={handleGenerateReply} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nama Pelanggan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Pertanyaan / Keluhan Pelanggan *</label>
                <textarea
                  rows={3}
                  required
                  value={customerMsg}
                  onChange={(e) => setCustomerMsg(e.target.value)}
                  placeholder="Tuliskan chat atau komplain pelanggan yang ingin dibalas..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Konteks Internal Pesanan (Opsional)</label>
                <input
                  type="text"
                  value={orderContext}
                  onChange={(e) => setOrderContext(e.target.value)}
                  placeholder="Contoh: Barang sudah dikemas dan dijemput kurir hari ini jam 14:00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loadingReply}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {loadingReply ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
                <span>Buat Balasan CS Sopan & Solutif</span>
              </button>
            </form>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Balasan Siap Kirim (WhatsApp / DM)</span>
              </h3>
              {replyResult && (
                <button
                  onClick={() => handleCopy(replyResult.reply, 'reply')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'reply' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'reply' ? 'Tersalin!' : 'Salin Balasan'}</span>
                </button>
              )}
            </div>

            {loadingReply ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs text-slate-400">Menyusun balasan ramah & profesional...</div>
              </div>
            ) : replyResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-line shadow-inner">
                  {replyResult.reply}
                </div>

                {replyResult.suggestedNextStep && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    <span className="font-bold">Saran untuk Admin:</span> {replyResult.suggestedNextStep}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-700" />
                <div>Tulis pesan pelanggan dan klik tombol untuk membuat balasan otomatis.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
