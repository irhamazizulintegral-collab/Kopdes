export interface GeneratedDescription {
  shortPitch: string;
  fullDescription: string;
  highlights: string[];
  specsSuggestion: string[];
  tags: string[];
}

export interface StoreInsights {
  summary: string;
  statusScore: string;
  urgentActions: string[];
  recommendations: Array<{
    title: string;
    impact: string;
    description: string;
  }>;
  marketingIdea: string;
}

export interface CustomerReplyResponse {
  reply: string;
  suggestedNextStep: string;
}

export async function loginWithAdminCredentials(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login gagal');
  }
  return data;
}

export async function generateProductDescription(payload: {
  productName: string;
  category?: string;
  keyFeatures?: string;
  tone?: string;
}): Promise<GeneratedDescription> {
  const res = await fetch('/api/ai/generate-description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menghasilkan deskripsi produk dengan AI');
  }
  return data.data;
}

export async function getStoreInsights(payload: {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
  topCategories?: string[];
}): Promise<StoreInsights> {
  const res = await fetch('/api/ai/store-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menganalisis toko dengan AI');
  }
  return data.data;
}

export async function generateCustomerReply(payload: {
  customerName: string;
  message: string;
  tone?: string;
  orderContext?: string;
}): Promise<CustomerReplyResponse> {
  const res = await fetch('/api/ai/customer-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menghasilkan balasan pelanggan');
  }
  return data.data;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err) {
    return { status: 'down', error: String(err) };
  }
}
