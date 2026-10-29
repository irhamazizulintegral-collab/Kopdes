import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { auth } from './firebase';
import { AuthUser, ActiveTab, Product, Order, Category, Customer, StoreSettings } from './types';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { OrdersView } from './components/OrdersView';
import { CategoriesView } from './components/CategoriesView';
import { CustomersView } from './components/CustomersView';
import { AiToolsView } from './components/AiToolsView';
import { SettingsView } from './components/SettingsView';
import {
  subscribeProducts,
  subscribeOrders,
  saveProduct,
  deleteProduct,
  saveOrder,
  getCategories,
  saveCategory,
  deleteCategory,
  getCustomers,
  saveCustomer,
  getStoreSettings,
  saveStoreSettings,
  DEFAULT_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS
} from './services/storeService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Store data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    ...DEFAULT_SETTINGS,
    userId: 'default'
  });

  // Cross-view selection state
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [customerForAiReply, setCustomerForAiReply] = useState<Customer | null>(null);

  // Check login state: Firebase Auth listener + Admin credentials session
  useEffect(() => {
    // 1. Check local admin session
    const localAdmin = localStorage.getItem('velvet_admin_user');
    if (localAdmin) {
      try {
        const parsed = JSON.parse(localAdmin);
        setCurrentUser(parsed);
        setAuthLoading(false);
      } catch {
        localStorage.removeItem('velvet_admin_user');
      }
    }

    // 2. Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userObj: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || 'Google Admin',
          photoURL: fbUser.photoURL,
          isAdmin: true,
          isCustomAdmin: false
        };
        setCurrentUser(userObj);
      } else {
        // If not signed in to Firebase and no local admin credentials, user is logged out
        const saved = localStorage.getItem('velvet_admin_user');
        if (!saved) {
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch or subscribe to user data when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      setOrders([]);
      setCategories([]);
      setCustomers([]);
      return;
    }

    const userId = currentUser.uid;

    // Subscriptions
    const unsubProducts = subscribeProducts(userId, (p) => setProducts(p));
    const unsubOrders = subscribeOrders(userId, (o) => setOrders(o));

    // Initial loads for categories, customers, and settings
    getCategories(userId).then(setCategories).catch(console.error);
    getCustomers(userId).then(setCustomers).catch(console.error);
    getStoreSettings(userId).then(setSettings).catch(console.error);

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [currentUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.isCustomAdmin) {
      localStorage.setItem('velvet_admin_user', JSON.stringify(user));
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('velvet_admin_user');
    await fbSignOut(auth);
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Product actions
  const handleSaveProduct = async (p: Product) => {
    if (!currentUser) return;
    await saveProduct(currentUser.uid, p);
    // Optimistic UI update
    setProducts(prev => {
      const idx = prev.findIndex(item => item.id === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = p;
        return copy;
      }
      return [p, ...prev];
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser) return;
    await deleteProduct(currentUser.uid, productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Order actions
  const handleSaveOrder = async (order: Order) => {
    if (!currentUser) return;
    await saveOrder(currentUser.uid, order);
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === order.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = order;
        return copy;
      }
      return [order, ...prev];
    });
  };

  // Category actions
  const handleSaveCategory = async (cat: Category) => {
    if (!currentUser) return;
    await saveCategory(currentUser.uid, cat);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === cat.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cat;
        return copy;
      }
      return [...prev, cat];
    });
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!currentUser) return;
    await deleteCategory(currentUser.uid, catId);
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Customer actions
  const handleSaveCustomer = async (cust: Customer) => {
    if (!currentUser) return;
    await saveCustomer(currentUser.uid, cust);
    setCustomers(prev => {
      const idx = prev.findIndex(c => c.id === cust.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cust;
        return copy;
      }
      return [...prev, cust];
    });
  };

  // Settings actions
  const handleSaveSettings = async (newSettings: StoreSettings) => {
    if (!currentUser) return;
    await saveStoreSettings(currentUser.uid, newSettings);
    setSettings(newSettings);
  };

  // Re-seed sample data
  const handleResetSampleData = async () => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    for (const p of INITIAL_PRODUCTS) {
      await saveProduct(userId, { ...p, userId });
    }
    for (const o of INITIAL_ORDERS) {
      await saveOrder(userId, { ...o, userId });
    }
    const freshSettings = { ...DEFAULT_SETTINGS, userId };
    await saveStoreSettings(userId, freshSettings);
    setSettings(freshSettings);
  };

  // Show loading indicator during initial auth resolution
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-400 font-medium">Memuat Velvet Store Admin...</div>
        </div>
      </div>
    );
  }

  // Wajib Login Guard: If not authenticated, render LoginPage
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onNewProductClick={() => setActiveTab('products')}
      />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          orderCount={orders.length}
          productCount={products.length}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              products={products}
              orders={orders}
              customers={customers}
              onNavigateTab={setActiveTab}
              onSelectOrder={(ord) => {
                setSelectedOrderForModal(ord);
                setActiveTab('orders');
              }}
              onNewProductClick={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              userId={currentUser.uid}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              products={products}
              userId={currentUser.uid}
              onSaveOrder={handleSaveOrder}
              selectedOrderModal={selectedOrderForModal}
              onCloseOrderModal={() => setSelectedOrderForModal(null)}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              products={products}
              userId={currentUser.uid}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              userId={currentUser.uid}
              onSaveCustomer={handleSaveCustomer}
              onOpenCustomerAiChat={(cust) => {
                setCustomerForAiReply(cust);
                setActiveTab('ai-tools');
              }}
            />
          )}

          {activeTab === 'ai-tools' && (
            <AiToolsView
              products={products}
              orders={orders}
              customers={customers}
              initialCustomerForReply={customerForAiReply}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              user={currentUser}
              onSaveSettings={handleSaveSettings}
              onResetSampleData={handleResetSampleData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
