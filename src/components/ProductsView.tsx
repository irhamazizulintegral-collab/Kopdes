import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Sparkles,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Product, Category } from '../types';
import { generateProductDescription } from '../services/aiService';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  userId: string;
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  userId,
  onSaveProduct,
  onDeleteProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Fashion');
  const [price, setPrice] = useState<number | ''>(150000);
  const [costPrice, setCostPrice] = useState<number | ''>(90000);
  const [stock, setStock] = useState<number | ''>(20);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'out_of_stock'>('active');

  // AI Modal Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiTone, setAiTone] = useState('menarik, premium, dan persuasif');
  const [aiPromptFeatures, setAiPromptFeatures] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory(categories[0]?.name || 'Fashion');
    setPrice(150000);
    setCostPrice(90000);
    setStock(20);
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600');
    setDescription('');
    setStatus('active');
    setAiError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setCostPrice(p.costPrice || 0);
    setStock(p.stock);
    setSku(p.sku);
    setImageUrl(p.imageUrl);
    setDescription(p.description);
    setStatus(p.status);
    setAiError(null);
    setIsModalOpen(true);
  };

  const handleAiGenerate = async () => {
    if (!name.trim()) {
      setAiError('Silakan isi Nama Produk terlebih dahulu sebelum memanggil AI.');
      return;
    }
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const result = await generateProductDescription({
        productName: name,
        category,
        keyFeatures: aiPromptFeatures || description || 'Kualitas terbaik bahan awet premium',
        tone: aiTone
      });

      if (result) {
        const fullText = `${result.shortPitch}\n\n${result.fullDescription}\n\nKeunggulan Utama:\n${result.highlights?.map(h => `• ${h}`).join('\n') || ''}`;
        setDescription(fullText);
      }
    } catch (err: any) {
      setAiError(err.message || 'Gagal generate AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || stock === '') return;

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price),
      costPrice: Number(costPrice || 0),
      stock: Number(stock),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      description: description.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      status: Number(stock) <= 0 ? 'out_of_stock' : status,
      userId,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await onSaveProduct(productPayload);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Katalog Produk</span>
          </h2>
          <p className="text-xs text-slate-400">
            Kelola inventaris, harga jual, margin keuntungan, dan stok produk toko
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif (Dijual)</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Stok Habis</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-600" />
            <div>Tidak ada produk yang cocok dengan pencarian / filter.</div>
            <button
              onClick={handleOpenAddModal}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
            >
              Tambah Produk Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Produk</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium">Kategori</th>
                  <th className="pb-3 font-medium">Harga Jual</th>
                  <th className="pb-3 font-medium">Margin</th>
                  <th className="pb-3 font-medium">Stok</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const profit = p.price - (p.costPrice || 0);
                  const marginPct = p.price > 0 ? Math.round((profit / p.price) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                          />
                          <div className="max-w-xs">
                            <div className="font-semibold text-white truncate">{p.name}</div>
                            <div className="text-[10px] text-slate-400 truncate line-clamp-1">
                              {p.description || 'Tidak ada deskripsi'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 font-mono text-[11px] text-slate-300">
                        {p.sku}
                      </td>

                      <td className="py-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 font-semibold text-white">
                        {formatRupiah(p.price)}
                      </td>

                      <td className="py-3">
                        <span className={`text-[11px] font-medium ${marginPct >= 30 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {marginPct}% (+{formatRupiah(profit)})
                        </span>
                      </td>

                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            p.stock === 0
                              ? 'text-rose-400 font-bold'
                              : p.stock <= 5
                              ? 'text-amber-400'
                              : 'text-slate-200'
                          }`}
                        >
                          {p.stock} unit
                        </span>
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            p.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : p.status === 'out_of_stock'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {p.status === 'active' ? 'Aktif' : p.status === 'out_of_stock' ? 'Habis' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Produk"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            title="Hapus Produk"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <span>{editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru ke Toko'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {aiError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nama Produk *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Velvet Midnight Hoodie Oversize"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Status Penjualan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Aktif (Dapat Dipesan)</option>
                    <option value="draft">Draft (Disembunyikan)</option>
                    <option value="out_of_stock">Stok Habis</option>
                  </select>
                </div>
              </div>

              {/* Prices & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Harga Modal / HPP (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Jumlah Stok (Unit) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* SKU & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">SKU / Kode Produk</label>
                  <input
                    type="text"
                    placeholder="Contoh: VMH-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">URL Foto Produk</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* AI Auto Copywriting Box */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Copywriter Gemini (Server-side)
                  </span>
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGeneratingAi || !name.trim()}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer text-[11px]"
                  >
                    {isGeneratingAi ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Buat Deskripsi Otomatis</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Masukkan nama produk di atas, lalu klik tombol untuk meminta AI menyusun deskripsi menarik, keunggulan, dan copywriting penjualan.
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Deskripsi Lengkap Produk</label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan spesifikasi, bahan, ukuran, dan keunggulan produk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan ke Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
