import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  X,
  Phone,
  MapPin,
  CreditCard,
  Send,
  Printer
} from 'lucide-react';
import { Order, Product } from '../types';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  userId: string;
  onSaveOrder: (order: Order) => Promise<void>;
  selectedOrderModal?: Order | null;
  onCloseOrderModal?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  products,
  userId,
  onSaveOrder,
  selectedOrderModal,
  onCloseOrderModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(selectedOrderModal || null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BCA Virtual Account');
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>('paid');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Tracking number edit in active modal
  const [tempTrackingNumber, setTempTrackingNumber] = useState('');

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    const updated: Order = {
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    await onSaveOrder(updated);
    if (activeOrder && activeOrder.id === order.id) {
      setActiveOrder(updated);
    }
  };

  const handleSaveTrackingNumber = async () => {
    if (!activeOrder) return;
    const updated: Order = {
      ...activeOrder,
      trackingNumber: tempTrackingNumber.trim(),
      status: activeOrder.status === 'processing' ? 'shipped' : activeOrder.status,
      updatedAt: new Date().toISOString()
    };
    await onSaveOrder(updated);
    setActiveOrder(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const chosenProduct = products.find(p => p.id === selectedProductId) || products[0];
    const itemPrice = chosenProduct ? chosenProduct.price : 100000;
    const totalAmount = itemPrice * Number(selectedQuantity);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || 'customer@example.com',
      shippingAddress: shippingAddress.trim() || 'Alamat tidak dicantumkan',
      status: 'pending',
      totalAmount,
      paymentMethod,
      paymentStatus,
      trackingNumber: '',
      items: [
        {
          id: chosenProduct ? chosenProduct.id : 'custom',
          name: chosenProduct ? chosenProduct.name : 'Produk Pesanan',
          price: itemPrice,
          quantity: Number(selectedQuantity)
        }
      ],
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onSaveOrder(newOrder);
    setIsNewOrderModalOpen(false);
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setShippingAddress('');
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span>Manajemen Pesanan</span>
          </h2>
          <p className="text-xs text-slate-400">
            Daftar pesanan pelanggan, status pembayaran, nomor resi, dan riwayat pengiriman
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pesanan Manual</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor invoice, nama pelanggan, no telp, atau resi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950/80 border border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-600" />
            <div>Tidak ada pesanan yang sesuai kriteria.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">No. Invoice</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Pelanggan</th>
                  <th className="pb-3 font-medium">Produk / Item</th>
                  <th className="pb-3 font-medium">Total Tagihan</th>
                  <th className="pb-3 font-medium">Pembayaran</th>
                  <th className="pb-3 font-medium">Status Pesanan</th>
                  <th className="pb-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-mono font-bold text-white">
                        {order.orderNumber}
                      </td>

                      <td className="py-3 text-slate-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="py-3">
                        <div className="font-semibold text-white">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                      </td>

                      <td className="py-3 text-slate-300">
                        <div className="truncate max-w-[200px]">
                          {order.items?.map(it => `${it.quantity}x ${it.name}`).join(', ') || 'Item'}
                        </div>
                      </td>

                      <td className="py-3 font-bold text-white">
                        {formatRupiah(order.totalAmount)}
                      </td>

                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </td>

                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as any)}
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Diproses</option>
                          <option value="shipped">Dikirim</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setActiveOrder(order);
                            setTempTrackingNumber(order.trackingNumber || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-[11px] font-medium transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
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

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Detail Pesanan Pelanggan
                </span>
                <h3 className="text-base font-bold text-white font-mono">
                  {activeOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveOrder(null);
                  if (onCloseOrderModal) onCloseOrderModal();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Customer & Address Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-semibold text-white text-sm flex items-center justify-between">
                  <span>{activeOrder.customerName}</span>
                  {activeOrder.customerPhone && (
                    <a
                      href={`https://wa.me/${activeOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-normal flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Chat WhatsApp</span>
                    </a>
                  )}
                </div>
                <div className="text-slate-400 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                  <span>{activeOrder.shippingAddress}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Email: {activeOrder.customerEmail} • Telp: {activeOrder.customerPhone}
                </div>
              </div>

              {/* Status and Resi Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Status Pesanan</label>
                  <select
                    value={activeOrder.status}
                    onChange={(e) => handleStatusChange(activeOrder, e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending (Menunggu Pembayaran)</option>
                    <option value="processing">Diproses (Sedang Dikemas)</option>
                    <option value="shipped">Dikirim (Dalam Perjalanan)</option>
                    <option value="completed">Selesai (Diterima Pembeli)</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-400">Nomor Resi Pengiriman</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="JNE / J&T / SiCepat..."
                      value={tempTrackingNumber}
                      onChange={(e) => setTempTrackingNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTrackingNumber}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-semibold text-white text-xs">Rincian Produk yang Dibeli</div>
                <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
                  {activeOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-white">{it.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatRupiah(it.price)} x {it.quantity} unit
                        </div>
                      </div>
                      <div className="font-bold text-white">
                        {formatRupiah(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Metode Pembayaran</span>
                  <span className="text-white font-medium">{activeOrder.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Status Pembayaran</span>
                  <button
                    onClick={() => {
                      const nextStatus = activeOrder.paymentStatus === 'paid' ? 'unpaid' : 'paid';
                      const updated = { ...activeOrder, paymentStatus: nextStatus as any, updatedAt: new Date().toISOString() };
                      onSaveOrder(updated);
                      setActiveOrder(updated);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                      activeOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {activeOrder.paymentStatus === 'paid' ? 'LUNAS (Klik untuk ubah)' : 'BELUM BAYAR (Klik untuk tandai lunas)'}
                  </button>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm text-white">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-400">{formatRupiah(activeOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Buat Pesanan Pelanggan Baru</span>
              </h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Anita Wijaya"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Nomor WhatsApp / Telp</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Email Pelanggan</label>
                  <input
                    type="email"
                    placeholder="anita@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Alamat Pengiriman</label>
                <textarea
                  rows={2}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota, kode pos"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-medium">Pilih Produk</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatRupiah(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BCA Virtual Account">BCA Virtual Account</option>
                    <option value="Mandiri Transfer">Mandiri Transfer</option>
                    <option value="QRIS / GoPay">QRIS / GoPay</option>
                    <option value="COD (Bayar di Tempat)">COD (Bayar di Tempat)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="paid">Lunas</option>
                    <option value="unpaid">Belum Lunas</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Simpan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
