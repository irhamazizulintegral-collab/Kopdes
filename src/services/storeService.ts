import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Category, Customer, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Omit<Product, 'userId'>[] = [
  {
    id: 'prod-1',
    name: 'Velvet Midnight Hoodie Oversize',
    category: 'Fashion Pria',
    price: 329000,
    costPrice: 195000,
    stock: 24,
    sku: 'VMH-001-BLK',
    description: 'Hoodie oversized berbahan fleece katun 330gsm dengan bordir tipografi Velvet Shadow presisi tinggi. Sangat nyaman, hangat, dan breathable untuk aktivitas harian.',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Shadow Leather Crossbody Bag',
    category: 'Aksesoris',
    price: 489000,
    costPrice: 280000,
    stock: 8,
    sku: 'SLC-002-BRN',
    description: 'Tas selempang kulit sintetis grade A tahan air dengan kompartemen laptop 13 inch dan resleting YKK premium.',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Minimalist Mechanical Keyboard 75%',
    category: 'Elektronik',
    price: 899000,
    costPrice: 590000,
    stock: 3,
    sku: 'MMK-003-WHT',
    description: 'Keyboard mekanik nirkabel Bluetooth 5.1 & 2.4GHz dengan switch linear pre-lubed dan keycaps PBT doubleshot.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Aroma Therapy Reed Diffuser - Velvet Cedar',
    category: 'Home & Living',
    price: 159000,
    costPrice: 75000,
    stock: 0,
    sku: 'ARD-004-CDR',
    description: 'Pewangi ruangan elegan aroma cedarwood & dark vanilla 100ml, tahan hingga 60 hari.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    status: 'out_of_stock',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export const INITIAL_ORDERS: Omit<Order, 'userId'>[] = [
  {
    id: 'ord-1001',
    orderNumber: 'INV-202610-001',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    customerEmail: 'budi.santoso@example.com',
    shippingAddress: 'Jl. Sudirman No. 45, Jakarta Selatan 12190',
    status: 'shipped',
    totalAmount: 329000,
    paymentMethod: 'BCA Virtual Account',
    paymentStatus: 'paid',
    trackingNumber: 'JNE8829104821',
    items: [
      { id: 'prod-1', name: 'Velvet Midnight Hoodie Oversize', price: 329000, quantity: 1 }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'INV-202610-002',
    customerName: 'Siti Rahmawati',
    customerPhone: '085711223344',
    customerEmail: 'siti.rahma@example.com',
    shippingAddress: 'Griya Asri Blok C2, Bandung 40132',
    status: 'processing',
    totalAmount: 1388000,
    paymentMethod: 'GoPay / QRIS',
    paymentStatus: 'paid',
    trackingNumber: '',
    items: [
      { id: 'prod-2', name: 'Shadow Leather Crossbody Bag', price: 489000, quantity: 1 },
      { id: 'prod-3', name: 'Minimalist Mechanical Keyboard 75%', price: 899000, quantity: 1 }
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-1003',
    orderNumber: 'INV-202610-003',
    customerName: 'Dimas Prasetyo',
    customerPhone: '081987654321',
    customerEmail: 'dimas.prasetyo@example.com',
    shippingAddress: 'Jl. Pemuda No. 12, Surabaya 60271',
    status: 'pending',
    totalAmount: 489000,
    paymentMethod: 'Mandiri Transfer',
    paymentStatus: 'unpaid',
    trackingNumber: '',
    items: [
      { id: 'prod-2', name: 'Shadow Leather Crossbody Bag', price: 489000, quantity: 1 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_CATEGORIES: Omit<Category, 'userId'>[] = [
  { id: 'cat-1', name: 'Fashion Pria', description: 'Pakaian dan busana pria modern', createdAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Aksesoris', description: 'Tas, dompet, dan pelengkap gaya', createdAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Elektronik', description: 'Gadget, peripheral, dan aksesoris teknologi', createdAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Home & Living', description: 'Dekorasi rumah dan aromaterapi premium', createdAt: new Date().toISOString() },
];

export const INITIAL_CUSTOMERS: Omit<Customer, 'userId'>[] = [
  {
    id: 'cust-1',
    name: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi.santoso@example.com',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    totalOrders: 3,
    totalSpend: 1150000,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'cust-2',
    name: 'Siti Rahmawati',
    phone: '085711223344',
    email: 'siti.rahma@example.com',
    address: 'Griya Asri Blok C2, Bandung',
    totalOrders: 2,
    totalSpend: 1877000,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'cust-3',
    name: 'Dimas Prasetyo',
    phone: '081987654321',
    email: 'dimas.prasetyo@example.com',
    address: 'Jl. Pemuda No. 12, Surabaya',
    totalOrders: 1,
    totalSpend: 489000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Helper to check if current Firebase Auth user matches the userId
function hasLiveFirebaseAuth(userId: string): boolean {
  return Boolean(auth.currentUser && auth.currentUser.uid === userId);
}

// ---------------- PRODUCTS ----------------
export async function getProducts(userId: string): Promise<Product[]> {
  const path = `users/${userId}/products`;
  if (!hasLiveFirebaseAuth(userId)) {
    const local = localStorage.getItem(`store_products_${userId}`);
    if (local) return JSON.parse(local);
    const initial = INITIAL_PRODUCTS.map(p => ({ ...p, userId }));
    localStorage.setItem(`store_products_${userId}`, JSON.stringify(initial));
    return initial;
  }

  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Seed initial products for the user
      const initial = INITIAL_PRODUCTS.map(p => ({ ...p, userId }));
      for (const item of initial) {
        await setDoc(doc(db, path, item.id), item);
      }
      return initial;
    }
    return snapshot.docs.map(d => d.data() as Product);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeProducts(
  userId: string,
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = `users/${userId}/products`;
  if (!hasLiveFirebaseAuth(userId)) {
    getProducts(userId).then(onUpdate);
    // Listen for storage events across tabs or local updates
    const listener = () => {
      getProducts(userId).then(onUpdate);
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }

  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      if (snapshot.empty) {
        getProducts(userId).then(onUpdate);
      } else {
        onUpdate(snapshot.docs.map(d => d.data() as Product));
      }
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveProduct(userId: string, product: Product): Promise<void> {
  const path = `users/${userId}/products/${product.id}`;
  if (!hasLiveFirebaseAuth(userId)) {
    const products = await getProducts(userId);
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(`store_products_${userId}`, JSON.stringify(products));
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'products', product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteProduct(userId: string, productId: string): Promise<void> {
  const path = `users/${userId}/products/${productId}`;
  if (!hasLiveFirebaseAuth(userId)) {
    const products = await getProducts(userId);
    const updated = products.filter(p => p.id !== productId);
    localStorage.setItem(`store_products_${userId}`, JSON.stringify(updated));
    return;
  }

  try {
    await deleteDoc(doc(db, 'users', userId, 'products', productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ---------------- ORDERS ----------------
export async function getOrders(userId: string): Promise<Order[]> {
  const path = `users/${userId}/orders`;
  if (!hasLiveFirebaseAuth(userId)) {
    const local = localStorage.getItem(`store_orders_${userId}`);
    if (local) return JSON.parse(local);
    const initial = INITIAL_ORDERS.map(o => ({ ...o, userId }));
    localStorage.setItem(`store_orders_${userId}`, JSON.stringify(initial));
    return initial;
  }

  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      const initial = INITIAL_ORDERS.map(o => ({ ...o, userId }));
      for (const item of initial) {
        await setDoc(doc(db, path, item.id), item);
      }
      return initial;
    }
    return snapshot.docs.map(d => d.data() as Order);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function subscribeOrders(
  userId: string,
  onUpdate: (orders: Order[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = `users/${userId}/orders`;
  if (!hasLiveFirebaseAuth(userId)) {
    getOrders(userId).then(onUpdate);
    const listener = () => getOrders(userId).then(onUpdate);
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }

  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      if (snapshot.empty) {
        getOrders(userId).then(onUpdate);
      } else {
        onUpdate(snapshot.docs.map(d => d.data() as Order));
      }
    },
    error => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveOrder(userId: string, order: Order): Promise<void> {
  const path = `users/${userId}/orders/${order.id}`;
  if (!hasLiveFirebaseAuth(userId)) {
    const orders = await getOrders(userId);
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
    }
    localStorage.setItem(`store_orders_${userId}`, JSON.stringify(orders));
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'orders', order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ---------------- CATEGORIES ----------------
export async function getCategories(userId: string): Promise<Category[]> {
  const path = `users/${userId}/categories`;
  if (!hasLiveFirebaseAuth(userId)) {
    const local = localStorage.getItem(`store_categories_${userId}`);
    if (local) return JSON.parse(local);
    const initial = INITIAL_CATEGORIES.map(c => ({ ...c, userId }));
    localStorage.setItem(`store_categories_${userId}`, JSON.stringify(initial));
    return initial;
  }

  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      const initial = INITIAL_CATEGORIES.map(c => ({ ...c, userId }));
      for (const item of initial) {
        await setDoc(doc(db, path, item.id), item);
      }
      return initial;
    }
    return snapshot.docs.map(d => d.data() as Category);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveCategory(userId: string, category: Category): Promise<void> {
  const path = `users/${userId}/categories/${category.id}`;
  if (!hasLiveFirebaseAuth(userId)) {
    const list = await getCategories(userId);
    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) list[idx] = category;
    else list.push(category);
    localStorage.setItem(`store_categories_${userId}`, JSON.stringify(list));
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'categories', category.id), category);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const path = `users/${userId}/categories/${categoryId}`;
  if (!hasLiveFirebaseAuth(userId)) {
    const list = await getCategories(userId);
    const filtered = list.filter(c => c.id !== categoryId);
    localStorage.setItem(`store_categories_${userId}`, JSON.stringify(filtered));
    return;
  }

  try {
    await deleteDoc(doc(db, 'users', userId, 'categories', categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ---------------- CUSTOMERS ----------------
export async function getCustomers(userId: string): Promise<Customer[]> {
  const path = `users/${userId}/customers`;
  if (!hasLiveFirebaseAuth(userId)) {
    const local = localStorage.getItem(`store_customers_${userId}`);
    if (local) return JSON.parse(local);
    const initial = INITIAL_CUSTOMERS.map(c => ({ ...c, userId }));
    localStorage.setItem(`store_customers_${userId}`, JSON.stringify(initial));
    return initial;
  }

  try {
    const snapshot = await getDocs(collection(db, path));
    if (snapshot.empty) {
      const initial = INITIAL_CUSTOMERS.map(c => ({ ...c, userId }));
      for (const item of initial) {
        await setDoc(doc(db, path, item.id), item);
      }
      return initial;
    }
    return snapshot.docs.map(d => d.data() as Customer);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveCustomer(userId: string, customer: Customer): Promise<void> {
  const path = `users/${userId}/customers/${customer.id}`;
  if (!hasLiveFirebaseAuth(userId)) {
    const list = await getCustomers(userId);
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.push(customer);
    localStorage.setItem(`store_customers_${userId}`, JSON.stringify(list));
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'customers', customer.id), customer);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ---------------- SETTINGS ----------------
export const DEFAULT_SETTINGS: Omit<StoreSettings, 'userId'> = {
  storeName: 'Velvet Shadow Store',
  tagline: 'Toko Online Fashion & Lifestyle Modern Indonesia',
  currency: 'IDR',
  phone: '0812-9876-5432',
  email: 'admin@velvetshadow.store',
  address: 'SCBD District 8, Lt. 18, Jakarta Selatan 12190',
  bankInfo: 'BCA 8830129381 a.n Velvet Shadow Store',
  updatedAt: new Date().toISOString()
};

export async function getStoreSettings(userId: string): Promise<StoreSettings> {
  const path = `users/${userId}/settings/general`;
  if (!hasLiveFirebaseAuth(userId)) {
    const local = localStorage.getItem(`store_settings_${userId}`);
    if (local) return JSON.parse(local);
    const initial = { ...DEFAULT_SETTINGS, userId };
    localStorage.setItem(`store_settings_${userId}`, JSON.stringify(initial));
    return initial;
  }

  try {
    const snapshot = await getDoc(doc(db, 'users', userId, 'settings', 'general'));
    if (!snapshot.exists()) {
      const initial = { ...DEFAULT_SETTINGS, userId };
      await setDoc(doc(db, 'users', userId, 'settings', 'general'), initial);
      return initial;
    }
    return snapshot.data() as StoreSettings;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveStoreSettings(userId: string, settings: StoreSettings): Promise<void> {
  const path = `users/${userId}/settings/general`;
  if (!hasLiveFirebaseAuth(userId)) {
    localStorage.setItem(`store_settings_${userId}`, JSON.stringify(settings));
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'settings', 'general'), settings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
