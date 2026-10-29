export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'draft' | 'out_of_stock';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  trackingNumber: string;
  items: OrderItem[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  userId: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  phone: string;
  email: string;
  address: string;
  bankInfo: string;
  userId: string;
  updatedAt: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  username?: string;
  isAdmin: boolean;
  isCustomAdmin?: boolean;
}

export type ActiveTab = 
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'categories'
  | 'customers'
  | 'ai-tools'
  | 'settings';
